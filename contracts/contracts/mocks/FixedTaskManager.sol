// SPDX-License-Identifier: BSD-3-Clause-Clear
/* solhint-disable one-contract-per-file */
pragma solidity >=0.8.25 <0.9.0;

import {ACL, Permission} from "@fhenixprotocol/cofhe-mock-contracts/ACL.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MockCoFHE} from "@fhenixprotocol/cofhe-mock-contracts/MockCoFHE.sol";
import {ITaskManager, FunctionId, Utils, EncryptedInput} from "@fhenixprotocol/cofhe-contracts/ICofhe.sol";
import {console} from "hardhat/console.sol";

// ── Errors ────────────────────────────────────────────────────────────────────
error DecryptionResultNotReady(uint256 ctHash);
error InvalidInputsAmount(string operation, uint256 got, uint256 expected);
error InvalidOperationInputs(string operation);
error TooManyInputs(string operation, uint256 got, uint256 maxAllowed);
error InvalidBytesLength(uint256 got, uint256 expected);
error InvalidTypeOrSecurityZone(string operation);
error InvalidInputType(uint8 actual, uint8 expected);
error InvalidInputForFunction(string functionName, uint8 inputType);
error InvalidSecurityZone(int32 zone, int32 min, int32 max);
error InvalidSignature();
error InvalidSigner(address signer, address expectedSigner);
error InvalidAddress();
error OnlyOwnerAllowed(address caller);
error OnlyAggregatorAllowed(address caller);
error RandomFunctionNotSupported();

// ── FixedTMCommon ─────────────────────────────────────────────────────────────
//
//  Identical to upstream TMCommon with ONE fix in appendMetadata():
//
//  BUGGY:  metadata = (getByteForTrivialAndType(...) << 8) | securityZone
//  FIXED:  metadata =  getByteForTrivialAndType(...)       | securityZone
//
//  getByteForTrivialAndType already places uintType at bits [14:8] and
//  isTrivial at bit 15.  The extra << 8 pushed type to bits [22:16] while
//  getUintTypeFromHash reads bits [14:8] — always returning 0 = EBOOL_TFHE
//  → InvalidInputForFunction("add", 0) on every euint128 arithmetic op.
// ─────────────────────────────────────────────────────────────────────────────
library FixedTMCommon {
    uint256 private constant HASH_MASK_FOR_METADATA    = type(uint256).max - type(uint16).max;
    uint256 private constant SECURITY_ZONE_MASK        = type(uint8).max;
    uint256 private constant UINT_TYPE_MASK            = (type(uint8).max >> 1);
    uint256 private constant TRIVIALLY_ENCRYPTED_MASK  = uint256(type(uint8).max - (type(uint8).max >> 1)) << 8; // 0x8000
    uint256 private constant SHIFTED_TYPE_MASK         = uint256(type(uint8).max >> 1) << 8;                     // 0x7f00

    function uint256ToBytes32(uint256 value) internal pure returns (bytes memory) {
        bytes memory b = new bytes(32);
        assembly { mstore(add(b, 32), value) }
        return b;
    }

    function combineInputs(
        uint256[] memory encryptedHashes,
        uint256[] memory extraInputs
    ) internal pure returns (uint256[] memory) {
        uint256[] memory inputs = new uint256[](encryptedHashes.length + extraInputs.length);
        uint8 i = 0;
        for (; i < encryptedHashes.length; i++) inputs[i] = encryptedHashes[i];
        for (; i < encryptedHashes.length + extraInputs.length; i++)
            inputs[i] = extraInputs[i - encryptedHashes.length];
        return inputs;
    }

    function getReturnType(FunctionId functionId, uint8 ctType) internal pure returns (uint8) {
        if (
            functionId == FunctionId.lte || functionId == FunctionId.lt ||
            functionId == FunctionId.gte || functionId == FunctionId.gt ||
            functionId == FunctionId.eq  || functionId == FunctionId.ne
        ) return Utils.EBOOL_TFHE;
        return ctType;
    }

    function calcPlaceholderKey(
        uint8 ctType,
        int32 securityZone,
        uint256[] memory inputs,
        FunctionId functionId
    ) internal pure returns (uint256) {
        bytes memory combined;
        bool isTriviallyEncrypted = (functionId == FunctionId.trivialEncrypt);
        for (uint8 i = 0; i < inputs.length; i++)
            combined = bytes.concat(combined, uint256ToBytes32(inputs[i]));
        if (functionId == FunctionId.square) {
            functionId = FunctionId.mul;
            combined   = bytes.concat(combined, uint256ToBytes32(inputs[0]));
        }
        combined = bytes.concat(combined, bytes1(uint8(functionId)));
        uint256 ctHash = appendMetadata(
            uint256(keccak256(combined)), securityZone,
            getReturnType(functionId, ctType), isTriviallyEncrypted
        );
        return ctHash;
    }

    function getByteForTrivialAndType(bool isTrivial, uint8 uintType) internal pure returns (uint256) {
        return (isTrivial ? TRIVIALLY_ENCRYPTED_MASK : 0) | (uint256(uintType & UINT_TYPE_MASK) << 8);
    }

    /// @notice THE FIX: no extra `<< 8` — getByteForTrivialAndType already sits at bits [15:8].
    function appendMetadata(
        uint256 preCtHash, int32 securityZone, uint8 uintType, bool isTrivial
    ) internal pure returns (uint256 result) {
        result = preCtHash & HASH_MASK_FOR_METADATA;
        result = result | getByteForTrivialAndType(isTrivial, uintType) | uint256(uint8(int8(securityZone)));
    }

    function getSecurityZoneFromHash(uint256 hash) internal pure returns (int32) {
        return int32(int8(uint8(hash & SECURITY_ZONE_MASK)));
    }
    function getUintTypeFromHash(uint256 hash) internal pure returns (uint8) {
        return uint8((hash & SHIFTED_TYPE_MASK) >> 8);
    }
    function getSecAndTypeFromHash(uint256 hash) internal pure returns (uint256) {
        return uint256((SHIFTED_TYPE_MASK | SECURITY_ZONE_MASK) & hash);
    }
    function isTriviallyEncryptedFromHash(uint256 hash) internal pure returns (bool) {
        return (hash & TRIVIALLY_ENCRYPTED_MASK) == TRIVIALLY_ENCRYPTED_MASK;
    }
}

// ── FixedTaskManager ──────────────────────────────────────────────────────────
contract FixedTaskManager is ITaskManager, MockCoFHE {

    address private _owner;
    bool    private _initialized;

    mapping(uint256 => uint256) private _decryptResult;
    mapping(uint256 => bool)    private _decryptResultReady;
    mapping(uint256 => uint64)  private _decryptResultReadyTimestamp;

    int32   private securityZoneMax;
    int32   private securityZoneMin;
    address public  aggregator;
    ACL     public  acl;
    address private verifierSigner;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {}

    function initialize(address initialOwner) public {
        _owner         = initialOwner;
        _initialized   = true;
        verifierSigner = address(0);
    }

    modifier onlyOwner() {
        if (msg.sender != _owner) revert OnlyOwnerAllowed(msg.sender);
        _;
    }
    modifier onlyAggregator() {
        if (msg.sender != aggregator) revert OnlyAggregatorAllowed(msg.sender);
        _;
    }

    event TaskCreated(uint256 ctHash, string operation, uint256 input1, uint256 input2, uint256 input3);
    event ProtocolNotification(uint256 ctHash, string operation, string errorMessage);
    event DecryptionResult(uint256 ctHash, uint256 result, address indexed requestor);
    error ACLNotAllowed(uint256 handle, address account);

    function exists()        public pure returns (bool) { return true; }
    function isInitialized() public view returns (bool) { return _initialized; }

    function setSecurityZones(int32 minSZ, int32 maxSZ) external onlyOwner {
        securityZoneMin = minSZ; securityZoneMax = maxSZ;
    }
    function setVerifierSigner(address signer) external onlyOwner { verifierSigner = signer; }
    function setACLContract(address a) external onlyOwner {
        if (a == address(0)) revert InvalidAddress();
        acl = ACL(a);
    }
    function setAggregator(address a) external onlyOwner {
        if (a == address(0)) revert InvalidAddress();
        aggregator = a;
    }
    function setSecurityZoneMax(int32 sz) external onlyOwner {
        if (sz < securityZoneMin) revert InvalidSecurityZone(sz, securityZoneMin, securityZoneMax);
        securityZoneMax = sz;
    }
    function setSecurityZoneMin(int32 sz) external onlyOwner {
        if (sz > securityZoneMax) revert InvalidSecurityZone(sz, securityZoneMin, securityZoneMax);
        securityZoneMin = sz;
    }

    function checkAllowed(uint256 ctHash) internal view {
        if (!FixedTMCommon.isTriviallyEncryptedFromHash(ctHash))
            if (!acl.isAllowed(ctHash, msg.sender)) revert ACLNotAllowed(ctHash, msg.sender);
    }
    function isValidSecurityZone(int32 sz) internal view returns (bool) {
        return sz >= securityZoneMin && sz <= securityZoneMax;
    }
    function isUnaryOperation(FunctionId f)          internal pure returns (bool) { return f == FunctionId.not || f == FunctionId.square; }
    function isPlaintextOperation(FunctionId f)      internal pure returns (bool) { return f == FunctionId.random || f == FunctionId.trivialEncrypt; }
    function isAllTypesFunction(FunctionId f)        internal pure returns (bool) { return f == FunctionId.select || f == FunctionId.eq || f == FunctionId.ne || f == FunctionId.cast; }
    function isBooleanAndNumeralFunction(FunctionId f) internal pure returns (bool) { return f == FunctionId.xor || f == FunctionId.and || f == FunctionId.or || f == FunctionId.not; }

    function getSecurityZone(FunctionId functionId, uint256[] memory enc, uint256[] memory plain) internal pure returns (int32) {
        if (isPlaintextOperation(functionId)) return int32(int256(plain[plain.length - 1]));
        return FixedTMCommon.getSecurityZoneFromHash(enc[0]);
    }
    function validateEncryptedHashes(uint256[] memory hashes) internal view {
        for (uint8 i = 0; i < hashes.length; i++) checkAllowed(hashes[i]);
    }
    function validateFunctionInputTypes(FunctionId funcId, string memory fn, uint256[] memory inputs) internal pure {
        if (isAllTypesFunction(funcId)) return;
        if (isBooleanAndNumeralFunction(funcId)) {
            for (uint8 i = 0; i < inputs.length; i++) {
                uint8 t = FixedTMCommon.getUintTypeFromHash(inputs[i]);
                if ((t ^ Utils.EADDRESS_TFHE) == 0) revert InvalidInputForFunction(fn, Utils.EADDRESS_TFHE);
            }
        } else {
            for (uint8 i = 0; i < inputs.length; i++) {
                uint8 t = FixedTMCommon.getUintTypeFromHash(inputs[i]);
                if ((t ^ Utils.EADDRESS_TFHE) == 0 || (t ^ Utils.EBOOL_TFHE) == 0)
                    revert InvalidInputForFunction(fn, t);
            }
        }
    }
    function validateSelectInputs(uint256[] memory h) internal pure {
        if (h.length != 3) revert InvalidInputsAmount("select", h.length, 3);
        if (FixedTMCommon.getSecAndTypeFromHash(h[1] ^ h[2]) != 0) revert InvalidTypeOrSecurityZone("select");
        uint8 t = FixedTMCommon.getUintTypeFromHash(h[0]);
        if ((t ^ Utils.EBOOL_TFHE) != 0) revert InvalidInputType(t, Utils.EBOOL_TFHE);
    }
    function validateInputs(uint256[] memory h, FunctionId funcId) internal view {
        string memory fn = Utils.functionIdToString(funcId);
        if (h.length == 0) {
            if (!isPlaintextOperation(funcId)) revert InvalidOperationInputs(fn);
            return;
        }
        if (funcId == FunctionId.select) { validateSelectInputs(h); }
        else if (isUnaryOperation(funcId)) {
            if (h.length != 1) revert InvalidInputsAmount(fn, h.length, 1);
        } else {
            if (h.length != 2) revert InvalidInputsAmount(fn, h.length, 2);
            if (FixedTMCommon.getSecAndTypeFromHash(h[0] ^ h[1]) != 0) revert InvalidTypeOrSecurityZone(fn);
        }
        int32 sz = FixedTMCommon.getSecurityZoneFromHash(h[0]);
        if (!isValidSecurityZone(sz)) revert InvalidSecurityZone(sz, securityZoneMin, securityZoneMax);
        validateEncryptedHashes(h);
        validateFunctionInputTypes(funcId, fn, h);
    }
    function sendEventCreated(uint256 ctHash, string memory op, uint256[] memory inputs) private {
        if      (inputs.length == 1) { emit TaskCreated(ctHash, op, inputs[0], 0, 0);               MOCK_unaryOperation(ctHash, op, inputs[0]); }
        else if (inputs.length == 2) { emit TaskCreated(ctHash, op, inputs[0], inputs[1], 0);        MOCK_twoInputOperation(ctHash, op, inputs[0], inputs[1]); }
        else                         { emit TaskCreated(ctHash, op, inputs[0], inputs[1], inputs[2]); MOCK_threeInputOperation(ctHash, op, inputs[0], inputs[1], inputs[2]); }
    }

    function createTask(uint8 returnType, FunctionId funcId, uint256[] memory encryptedHashes, uint256[] memory extraInputs) external returns (uint256) {
        if (funcId == FunctionId.random) revert RandomFunctionNotSupported();
        uint256 total = encryptedHashes.length + extraInputs.length;
        if (total > 3) revert TooManyInputs(Utils.functionIdToString(funcId), total, 3);
        validateInputs(encryptedHashes, funcId);
        uint256[] memory inputs = FixedTMCommon.combineInputs(encryptedHashes, extraInputs);
        int32    sz             = getSecurityZone(funcId, encryptedHashes, extraInputs);
        uint256  ctHash         = FixedTMCommon.calcPlaceholderKey(returnType, sz, inputs, funcId);
        acl.allowTransient(ctHash, msg.sender, address(this));
        sendEventCreated(ctHash, Utils.functionIdToString(funcId), inputs);
        return ctHash;
    }
    function createDecryptTask(uint256 ctHash, address) public {
        checkAllowed(ctHash);
        _decryptResultReady[ctHash]          = true;
        _decryptResult[ctHash]               = _get(ctHash);
        _decryptResultReadyTimestamp[ctHash] = uint64(block.timestamp) + uint64((block.timestamp % 10) + 1);
    }
    function getDecryptResult(uint256 ctHash) public view returns (uint256) {
        (uint256 r, bool ok) = getDecryptResultSafe(ctHash);
        if (!ok) revert DecryptionResultNotReady(ctHash);
        return r;
    }
    function getDecryptResultSafe(uint256 ctHash) public view returns (uint256, bool) {
        if (!_decryptResultReady[ctHash]) return (0, false);
        if (block.timestamp < _decryptResultReadyTimestamp[ctHash]) return (0, false);
        return (_get(ctHash), true);
    }
    function handleDecryptResult(uint256 ctHash, uint256 result, address[] calldata) external onlyAggregator {
        _decryptResultReady[ctHash]          = true;
        _decryptResult[ctHash]               = result;
        _decryptResultReadyTimestamp[ctHash] = uint64(block.timestamp);
    }
    function handleError(uint256 ctHash, string memory op, string memory msg_) external onlyAggregator {
        emit ProtocolNotification(ctHash, op, msg_);
    }
    function verifyInput(EncryptedInput memory input, address sender) external returns (uint256) {
        int32 sz = int32(uint32(input.securityZone));
        if (verifierSigner != address(0)) {
            if (!isValidSecurityZone(sz)) revert InvalidSecurityZone(sz, securityZoneMin, securityZoneMax);
            address signer = extractSigner(input, sender);
            if (signer != verifierSigner) revert InvalidSigner(signer, verifierSigner);
        }
        uint256 h = FixedTMCommon.appendMetadata(input.ctHash, sz, input.utype, false);
        acl.allowTransient(h, msg.sender, address(this));
        return h;
    }
    function allow(uint256 ctHash, address account) external {
        if (!FixedTMCommon.isTriviallyEncryptedFromHash(ctHash)) acl.allow(ctHash, account, msg.sender);
    }
    function allowGlobal(uint256 ctHash) external {
        if (!FixedTMCommon.isTriviallyEncryptedFromHash(ctHash)) acl.allowGlobal(ctHash, msg.sender);
    }
    function allowTransient(uint256 ctHash, address account) external {
        if (!FixedTMCommon.isTriviallyEncryptedFromHash(ctHash)) acl.allowTransient(ctHash, account, msg.sender);
    }
    function allowForDecryption(uint256 ctHash) external {
        if (!FixedTMCommon.isTriviallyEncryptedFromHash(ctHash)) {
            uint256[] memory hashes = new uint256[](1);
            hashes[0] = ctHash;
            acl.allowForDecryption(hashes, msg.sender);
        }
    }
    function isAllowed(uint256 ctHash, address account) external view returns (bool) {
        if (FixedTMCommon.isTriviallyEncryptedFromHash(ctHash)) return true;
        return acl.isAllowed(ctHash, account);
    }
    function isAllowedWithPermission(Permission memory permission, uint256 handle) public view returns (bool) {
        return acl.isAllowedWithPermission(permission, handle);
    }
    function extractSigner(EncryptedInput memory input, address sender) private view returns (address) {
        bytes32 h = keccak256(abi.encodePacked(input.ctHash, input.utype, input.securityZone, sender, block.chainid));
        address signer = ECDSA.recover(h, input.signature);
        if (signer == address(0)) revert InvalidSignature();
        return signer;
    }
}
