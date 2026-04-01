// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {FHE, euint128, ebool, InEuint128} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

import {IBlackPools} from "../interfaces/IBlackPools.sol";
import {IPriceOracle} from "../interfaces/IPriceOracle.sol";
import {MarketLib} from "../libraries/MarketLib.sol";

contract BlackPools is IBlackPools, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using MarketLib for IBlackPools.MarketParams;

    // Protocol fee: 10% of gross interest goes to protocol (1000 / 10000)
    uint256 private constant FEE_BPS = 1000;

    mapping(bytes32 => Market) private _markets;
    mapping(bytes32 => mapping(address => Position)) private _positions;
    mapping(bytes32 => MarketParams) private _marketParams;

    // ── FHE helpers ──────────────────────────────────────────────────────────

    /// @dev FHE.asEuint128(0) alone leaves the handle locked — nobody can
    ///      use it in a subsequent FHE operation until FHE.allowThis() is
    ///      called. _initZero() enforces that pairing unconditionally.
    function _initZero() internal returns (euint128 z) {
        z = FHE.asEuint128(0);
        FHE.allowThis(z);
    }

    /// @dev Call after every euint128 write.
    function _allow(euint128 v, address user) internal {
        FHE.allowThis(v);
        FHE.allowSender(v);
        if (user != address(0) && user != msg.sender) {
            FHE.allow(v, user);
        }
    }

    /// @dev Storage-zero euint128 is not a valid FHE handle.
    ///      Initialise every position field before the first FHE operation.
    function _initPositionIfNeeded(bytes32 mid, address user) internal {
        Position storage p = _positions[mid][user];
        if (euint128.unwrap(p.supplyShares) == 0) {
            p.supplyShares = _initZero();
            FHE.allow(p.supplyShares, user);
        }
        if (euint128.unwrap(p.borrowShares) == 0) {
            p.borrowShares = _initZero();
            FHE.allow(p.borrowShares, user);
        }
        if (euint128.unwrap(p.collateral) == 0) {
            p.collateral = _initZero();
            FHE.allow(p.collateral, user);
        }
    }

    // ── Oracle health check (plaintext) ──────────────────────────────────────

    /// @dev Read the oracle price and compute the collateral value in loan
    ///      token units. Both collateralAmount and borrowAmount are passed
    ///      in plaintext (from the plainXxx parameters) so the health check
    ///      can happen synchronously on-chain without FHE decryption.
    ///
    ///      Healthy if:  collateralValue * lltv / 10000  >  borrowAmount
    ///      where:       collateralValue = collateralAmount * price / 10^oracleDecimals
    function _isHealthy(
        MarketParams memory p,
        uint256 plainCollateral,
        uint256 plainBorrow
    ) internal view returns (bool) {
        if (plainBorrow == 0) return true;
        if (plainCollateral == 0) return false;

        (, int256 answer, , , ) = IPriceOracle(p.oracle).latestRoundData();
        require(answer > 0, "BlackPools: bad oracle price");

        uint8 oracleDecimals = IPriceOracle(p.oracle).decimals();
        // Assuming collateralToken is WETH (18 decimals), loanToken is USDC (6 decimals), oracle is 8 decimals
        // collateralValue (USDC) = (collateral (18) * price (8)) / 10^(18 + 8 - 6) = / 10^20
        // Currently: (collateral * price) / 10^8 = / 10^8.  Difference is 10^12.
        uint256 collateralValue = (plainCollateral * uint256(answer)) /
            (10 ** (oracleDecimals + 12));
        uint256 maxBorrow = (collateralValue * p.lltv) / 10_000;

        return maxBorrow >= plainBorrow;
    }

    // ── createMarket ─────────────────────────────────────────────────────────

    function createMarket(MarketParams calldata params) external nonReentrant {
        params.validate();
        bytes32 mid = params.id();
        require(
            !MarketLib.isCreated(_markets[mid]),
            "BlackPools: market exists"
        );

        _markets[mid].totalSupplyAssets = _initZero();
        _markets[mid].totalBorrowAssets = _initZero();
        _markets[mid].totalSupplyShares = _initZero();
        _markets[mid].totalBorrowShares = _initZero();
        _markets[mid].lastUpdate = block.timestamp;
        _markets[mid].fee = uint128(FEE_BPS);
        _marketParams[mid] = params;

        emit MarketCreated(mid, params);
    }

    // ── supply ───────────────────────────────────────────────────────────────

    function supply(
        MarketParams calldata params,
        InEuint128 calldata encryptedAssets,
        uint256 plainAssets,
        address onBehalfOf
    ) external nonReentrant {
        bytes32 mid = params.id();
        require(
            MarketLib.isCreated(_markets[mid]),
            "BlackPools: market not found"
        );

        IERC20(params.loanToken).safeTransferFrom(
            msg.sender,
            address(this),
            plainAssets
        );

        euint128 assets = FHE.asEuint128(encryptedAssets);
        FHE.allowThis(assets);
        FHE.allowSender(assets);

        euint128 shares = assets; // 1:1 for testnet

        _initPositionIfNeeded(mid, onBehalfOf);

        _markets[mid].totalSupplyAssets = FHE.add(
            _markets[mid].totalSupplyAssets,
            assets
        );
        _markets[mid].totalSupplyShares = FHE.add(
            _markets[mid].totalSupplyShares,
            shares
        );
        _positions[mid][onBehalfOf].supplyShares = FHE.add(
            _positions[mid][onBehalfOf].supplyShares,
            shares
        );

        _allow(_markets[mid].totalSupplyAssets, address(0));
        _allow(_markets[mid].totalSupplyShares, address(0));
        _allow(_positions[mid][onBehalfOf].supplyShares, onBehalfOf);

        emit Supplied(mid, msg.sender, onBehalfOf);
    }

    // ── withdraw ─────────────────────────────────────────────────────────────

    function withdraw(
        MarketParams calldata params,
        InEuint128 calldata encryptedShares,
        uint256 plainShares,
        address user,
        address receiver
    ) external nonReentrant {
        bytes32 mid = params.id();
        require(
            MarketLib.isCreated(_markets[mid]),
            "BlackPools: market not found"
        );
        require(user == msg.sender, "BlackPools: not authorized");

        euint128 shares = FHE.asEuint128(encryptedShares);
        FHE.allowThis(shares);
        FHE.allowSender(shares);

        euint128 assets = shares; // 1:1 for testnet

        _positions[mid][user].supplyShares = FHE.sub(
            _positions[mid][user].supplyShares,
            shares
        );
        _markets[mid].totalSupplyShares = FHE.sub(
            _markets[mid].totalSupplyShares,
            shares
        );
        _markets[mid].totalSupplyAssets = FHE.sub(
            _markets[mid].totalSupplyAssets,
            assets
        );

        _allow(_positions[mid][user].supplyShares, user);
        _allow(_markets[mid].totalSupplyShares, address(0));
        _allow(_markets[mid].totalSupplyAssets, address(0));

        IERC20(params.loanToken).safeTransfer(receiver, plainShares);
        emit Withdrawn(mid, msg.sender, receiver);
    }

    // ── supplyCollateral ─────────────────────────────────────────────────────

    function supplyCollateral(
        MarketParams calldata params,
        InEuint128 calldata encryptedCollateral,
        uint256 plainCollateral,
        address user
    ) external nonReentrant {
        bytes32 mid = params.id();
        require(
            MarketLib.isCreated(_markets[mid]),
            "BlackPools: market not found"
        );

        IERC20(params.collateralToken).safeTransferFrom(
            msg.sender,
            address(this),
            plainCollateral
        );

        euint128 col = FHE.asEuint128(encryptedCollateral);
        FHE.allowThis(col);
        FHE.allowSender(col);

        _initPositionIfNeeded(mid, user);

        _positions[mid][user].collateral = FHE.add(
            _positions[mid][user].collateral,
            col
        );
        _allow(_positions[mid][user].collateral, user);

        // Track plaintext collateral for oracle-based health checks
        _positions[mid][user].plainCollateral += plainCollateral;

        emit CollateralSupplied(mid, msg.sender, plainCollateral);
    }

    // ── withdrawCollateral ───────────────────────────────────────────────────

    function withdrawCollateral(
        MarketParams calldata params,
        InEuint128 calldata encryptedAssets,
        uint256 plainAssets,
        address onBehalfOf,
        address receiver
    ) external nonReentrant {
        bytes32 mid = params.id();
        require(
            MarketLib.isCreated(_markets[mid]),
            "BlackPools: market not found"
        );
        require(onBehalfOf == msg.sender, "BlackPools: not authorized");

        uint256 newCollateral = _positions[mid][onBehalfOf].plainCollateral -
            plainAssets;
        require(
            _isHealthy(
                params,
                newCollateral,
                _positions[mid][onBehalfOf].plainBorrow
            ),
            "BlackPools: insufficient collateral"
        );

        euint128 assets = FHE.asEuint128(encryptedAssets);
        FHE.allowThis(assets);
        FHE.allowSender(assets);

        _positions[mid][onBehalfOf].collateral = FHE.sub(
            _positions[mid][onBehalfOf].collateral,
            assets
        );
        _allow(_positions[mid][onBehalfOf].collateral, onBehalfOf);
        _positions[mid][onBehalfOf].plainCollateral = newCollateral;

        IERC20(params.collateralToken).safeTransfer(receiver, plainAssets);
        emit CollateralWithdrawn(mid, msg.sender, receiver);
    }

    // ── borrow ───────────────────────────────────────────────────────────────

    function borrow(
        MarketParams calldata params,
        InEuint128 calldata encryptedBorrowAmount,
        uint256 plainAmount,
        address user,
        address receiver
    ) external nonReentrant {
        bytes32 mid = params.id();
        require(
            MarketLib.isCreated(_markets[mid]),
            "BlackPools: market not found"
        );
        require(user == msg.sender, "BlackPools: not authorized");

        uint256 newBorrow = _positions[mid][user].plainBorrow + plainAmount;
        require(
            _isHealthy(
                params,
                _positions[mid][user].plainCollateral,
                newBorrow
            ),
            "BlackPools: insufficient collateral"
        );

        euint128 borrowAmount = FHE.asEuint128(encryptedBorrowAmount);
        FHE.allowThis(borrowAmount);
        FHE.allowSender(borrowAmount);

        _initPositionIfNeeded(mid, user);

        _markets[mid].totalBorrowShares = FHE.add(
            _markets[mid].totalBorrowShares,
            borrowAmount
        );
        _markets[mid].totalBorrowAssets = FHE.add(
            _markets[mid].totalBorrowAssets,
            borrowAmount
        );
        _positions[mid][user].borrowShares = FHE.add(
            _positions[mid][user].borrowShares,
            borrowAmount
        );

        _allow(_markets[mid].totalBorrowShares, address(0));
        _allow(_markets[mid].totalBorrowAssets, address(0));
        _allow(_positions[mid][user].borrowShares, user);

        _positions[mid][user].plainBorrow = newBorrow;

        _markets[mid].plainTotalBorrow += plainAmount;
        IERC20(params.loanToken).safeTransfer(receiver, plainAmount);
        emit Borrowed(mid, user, receiver, plainAmount);
    }

    // ── repay ────────────────────────────────────────────────────────────────

    function repay(
        MarketParams calldata params,
        InEuint128 calldata encryptedRepayAmount,
        uint256 plainAmount,
        address user
    ) external nonReentrant {
        bytes32 mid = params.id();
        require(
            MarketLib.isCreated(_markets[mid]),
            "BlackPools: market not found"
        );

        IERC20(params.loanToken).safeTransferFrom(
            msg.sender,
            address(this),
            plainAmount
        );

        euint128 amountRepaid = FHE.asEuint128(encryptedRepayAmount);
        FHE.allowThis(amountRepaid);
        FHE.allowSender(amountRepaid);

        _initPositionIfNeeded(mid, user);

        _markets[mid].totalBorrowAssets = FHE.sub(
            _markets[mid].totalBorrowAssets,
            amountRepaid
        );
        _markets[mid].totalBorrowShares = FHE.sub(
            _markets[mid].totalBorrowShares,
            amountRepaid
        );
        _positions[mid][user].borrowShares = FHE.sub(
            _positions[mid][user].borrowShares,
            amountRepaid
        );

        _allow(_markets[mid].totalBorrowAssets, address(0));
        _allow(_markets[mid].totalBorrowShares, address(0));
        _allow(_positions[mid][user].borrowShares, user);

        _markets[mid].plainTotalBorrow = _markets[mid].plainTotalBorrow >
            plainAmount
            ? _markets[mid].plainTotalBorrow - plainAmount
            : 0;

        _positions[mid][user].plainBorrow = _positions[mid][user].plainBorrow >
            plainAmount
            ? _positions[mid][user].plainBorrow - plainAmount
            : 0;

        emit Repaid(mid, user, plainAmount);
    }

    // ── accrueInterest ───────────────────────────────────────────────────────

    /// @param encryptedRate  Encrypted per-second rate (InEuint128).
    /// @param plainRate      Plaintext per-second rate in ray units (1e27 = 100%).
    ///                       Used for the fee split which requires plaintext division.
    function accrueInterest(
        MarketParams calldata params,
        InEuint128 calldata encryptedRate,
        uint256 plainRate
    ) external nonReentrant {
        bytes32 mid = params.id();
        require(
            MarketLib.isCreated(_markets[mid]),
            "BlackPools: market not found"
        );

        uint256 elapsed = block.timestamp - _markets[mid].lastUpdate;
        require(elapsed > 0, "BlackPools: no time elapsed");

        euint128 rate = FHE.asEuint128(encryptedRate);
        FHE.allowThis(rate);
        euint128 elapsedEnc = FHE.asEuint128(uint128(elapsed));
        FHE.allowThis(elapsedEnc);

        // grossInterest (encrypted) = totalBorrowAssets * rate * elapsed
        euint128 grossInterest = FHE.div(
            FHE.mul(_markets[mid].totalBorrowAssets, FHE.mul(rate, elapsedEnc)),
            FHE.asEuint128(1e27)
        );
        FHE.allowThis(grossInterest);

        // grossInterestPlain is an approximation used only for the fee euint128.
        uint256 grossInterestPlain = (_markets[mid].plainTotalBorrow *
            plainRate *
            elapsed) / 1e27;
        uint256 feePlain = (grossInterestPlain * FEE_BPS) / 10_000;
        uint256 supplierInterestPlain = grossInterestPlain - feePlain;

        euint128 feeEnc = FHE.asEuint128(uint128(feePlain));
        FHE.allowThis(feeEnc);
        euint128 supplierInterest = FHE.asEuint128(
            uint128(supplierInterestPlain)
        );
        FHE.allowThis(supplierInterest);

        // Borrowers owe the full gross interest
        _markets[mid].totalBorrowAssets = FHE.add(
            _markets[mid].totalBorrowAssets,
            grossInterest
        );
        // Suppliers receive gross minus fee
        _markets[mid].totalSupplyAssets = FHE.add(
            _markets[mid].totalSupplyAssets,
            supplierInterest
        );

        _markets[mid].lastUpdate = block.timestamp;
        _markets[mid].plainTotalBorrow += grossInterestPlain;

        _allow(_markets[mid].totalBorrowAssets, address(0));
        _allow(_markets[mid].totalSupplyAssets, address(0));

        emit InterestAccrued(mid, block.timestamp);
    }

    // ── liquidate ────────────────────────────────────────────────────────────

    function liquidate(
        MarketParams calldata params,
        address borrower,
        InEuint128 calldata encryptedSeizedAssets,
        uint256 plainSeizedAssets
    ) external nonReentrant {
        bytes32 mid = params.id();
        require(
            MarketLib.isCreated(_markets[mid]),
            "BlackPools: market not found"
        );

        // Position must be unhealthy before liquidation is permitted
        require(
            !_isHealthy(
                params,
                _positions[mid][borrower].plainCollateral,
                _positions[mid][borrower].plainBorrow
            ),
            "BlackPools: position healthy"
        );

        euint128 seized = FHE.asEuint128(encryptedSeizedAssets);
        FHE.allowThis(seized);
        FHE.allowSender(seized);

        // Repaid is proportional to seized
        // Convert seized collateral (18 decimals) to loan assets (6 decimals)
        // repaid = seized * price / 10^(18 + 8 - 6) = seized * price / 10^20
        (, int256 answer, , , ) = IPriceOracle(params.oracle).latestRoundData();
        require(answer > 0, "BlackPools: bad oracle price");
        uint128 _answer = uint128(uint256(answer));
        euint128 repaid = FHE.div(
            FHE.mul(seized, FHE.asEuint128(_answer)),
            FHE.asEuint128(10 ** 20)
        );
        uint256 repaidPlain = (plainSeizedAssets * uint256(answer)) / 10 ** 20;

        _positions[mid][borrower].collateral = FHE.sub(
            _positions[mid][borrower].collateral,
            seized
        );
        _markets[mid].totalBorrowShares = FHE.sub(
            _markets[mid].totalBorrowShares,
            repaid
        );
        _markets[mid].totalBorrowAssets = FHE.sub(
            _markets[mid].totalBorrowAssets,
            repaid
        );
        _positions[mid][borrower].borrowShares = FHE.sub(
            _positions[mid][borrower].borrowShares,
            repaid
        );

        _allow(_positions[mid][borrower].collateral, borrower);
        _allow(_markets[mid].totalBorrowShares, address(0));
        _allow(_markets[mid].totalBorrowAssets, address(0));
        _allow(_positions[mid][borrower].borrowShares, borrower);

        _positions[mid][borrower].plainCollateral = _positions[mid][borrower]
            .plainCollateral > plainSeizedAssets
            ? _positions[mid][borrower].plainCollateral - plainSeizedAssets
            : 0;
        _markets[mid].plainTotalBorrow = _markets[mid].plainTotalBorrow >
            repaidPlain
            ? _markets[mid].plainTotalBorrow - repaidPlain
            : 0;

        _positions[mid][borrower].plainBorrow = _positions[mid][borrower]
            .plainBorrow > repaidPlain
            ? _positions[mid][borrower].plainBorrow - repaidPlain
            : 0;

        IERC20(params.collateralToken).safeTransfer(
            msg.sender,
            plainSeizedAssets
        );
        emit Liquidated(mid, borrower, msg.sender, plainSeizedAssets);
    }

    // ── views ────────────────────────────────────────────────────────────────

    function market(bytes32 mid) external view returns (Market memory) {
        return _markets[mid];
    }

    function position(
        bytes32 mid,
        address user
    ) external view returns (Position memory) {
        return _positions[mid][user];
    }

    function idToMarketParams(
        bytes32 mid
    ) external view returns (MarketParams memory) {
        return _marketParams[mid];
    }

    function isMarketCreated(bytes32 mid) external view returns (bool) {
        return MarketLib.isCreated(_markets[mid]);
    }
}
