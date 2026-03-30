import { expect } from "chai";
import { ethers } from "hardhat";
import { Encryptable, cofhejs } from "cofhejs/node";
import { cofhejs_initializeWithHardhatSigner } from "cofhe-hardhat-plugin/dist/src/networkUtils";
import { mock_expectPlaintext } from "cofhe-hardhat-plugin/dist/src/mockUtils";
import { BlackPools, TestERC20, TestPriceOracle } from "../typechain-types";
import { deployFixedMocks } from "./helpers/deployFixedMock";

describe("BlackPools", function () {
  before(async function () {
    await deployFixedMocks();
  });


  let blackPools: BlackPools;
  let usdc: TestERC20;
  let weth: TestERC20;
  let oracle: TestPriceOracle;
  let owner: any;
  let user1: any;
  let user2: any;
  let params: any;
  let marketId: string;

  async function encryptUint128(signer: any, value: bigint) {
    const init = await cofhejs_initializeWithHardhatSigner(signer, { generatePermit: false });
    expect(init.success, init.success ? undefined : init.error.message).to.equal(true);

    const encrypted = await cofhejs.encrypt(() => undefined, [Encryptable.uint128(value)]);
    expect(encrypted.success, encrypted.success ? undefined : encrypted.error.message).to.equal(true);

    return encrypted.data![0];
  }

  async function createMarket() {
    await blackPools.createMarket(params);
    marketId = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "address", "uint128"],
        [params.loanToken, params.collateralToken, params.oracle, params.lltv]
      )
    );
  }

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const TestERC20Factory = await ethers.getContractFactory("TestERC20");
    usdc = await TestERC20Factory.deploy("USDC", "USDC", 6);
    weth = await TestERC20Factory.deploy("WETH", "WETH", 18);

    const TestPriceOracleFactory = await ethers.getContractFactory("TestPriceOracle");
    oracle = await TestPriceOracleFactory.deploy(8, 2000n * 10n ** 8n);

    const BlackPoolsFactory = await ethers.getContractFactory("BlackPools");
    blackPools = await BlackPoolsFactory.deploy();

    params = {
      loanToken: await usdc.getAddress(),
      collateralToken: await weth.getAddress(),
      oracle: await oracle.getAddress(),
      lltv: 8000,
    };

    await usdc.mint(owner.address, ethers.parseUnits("5000", 6));
    await usdc.mint(user1.address, ethers.parseUnits("5000", 6));
    await usdc.mint(user2.address, ethers.parseUnits("5000", 6));
    await weth.mint(user1.address, ethers.parseUnits("10", 18));
    await weth.mint(user2.address, ethers.parseUnits("10", 18));
  });

  describe("Market Creation", function () {
    it("creates a market with a live oracle", async function () {
      await expect(blackPools.createMarket(params)).to.emit(blackPools, "MarketCreated");
    });

    it("reverts if oracle is zero", async function () {
      await expect(
        blackPools.createMarket({
          ...params,
          oracle: ethers.ZeroAddress,
        })
      ).to.be.revertedWith("MarketLib: zero oracle");
    });
  });

  describe("Core Flows", function () {
    beforeEach(async function () {
      await createMarket();
    });

    it("supplies liquidity, borrows safely, and blocks an unhealthy borrow", async function () {
      const liquidity = ethers.parseUnits("1000", 6);
      const collateral = ethers.parseUnits("0.1", 18);
      const safeBorrow = ethers.parseUnits("100", 6);
      const unsafeBorrow = ethers.parseUnits("70", 6);

      await usdc.connect(owner).approve(await blackPools.getAddress(), liquidity);
      await blackPools.connect(owner).supply(
        params,
        await encryptUint128(owner, liquidity),
        liquidity,
        owner.address
      );

      await weth.connect(user1).approve(await blackPools.getAddress(), collateral);
      await blackPools.connect(user1).supplyCollateral(
        params,
        await encryptUint128(user1, collateral),
        collateral,
        user1.address
      );

      await blackPools.connect(user1).borrow(
        params,
        await encryptUint128(user1, safeBorrow),
        safeBorrow,
        user1.address,
        user1.address
      );

      const positionAfterBorrow = await blackPools.position(marketId, user1.address);
      await mock_expectPlaintext(ethers.provider, positionAfterBorrow.borrowShares, safeBorrow);
      await mock_expectPlaintext(ethers.provider, positionAfterBorrow.collateral, collateral);

      await expect(
        blackPools.connect(user1).borrow(
          params,
          await encryptUint128(user1, unsafeBorrow),
          unsafeBorrow,
          user1.address,
          user1.address
        )
      ).to.be.revertedWith("BlackPools: insufficient collateral");
    });

    it("accrues interest with protocol fees and lets suppliers withdraw at the updated exchange rate", async function () {
      const supplyAmount = ethers.parseUnits("1000", 6);
      const collateral = ethers.parseUnits("1", 18);
      const borrowAmount = ethers.parseUnits("500", 6);
      const ratePerSecondRay = 10n ** 20n;

      await usdc.connect(owner).approve(await blackPools.getAddress(), supplyAmount);
      await blackPools.connect(owner).supply(
        params,
        await encryptUint128(owner, supplyAmount),
        supplyAmount,
        owner.address
      );

      await weth.connect(user1).approve(await blackPools.getAddress(), collateral);
      await blackPools.connect(user1).supplyCollateral(
        params,
        await encryptUint128(user1, collateral),
        collateral,
        user1.address
      );

      await blackPools.connect(user1).borrow(
        params,
        await encryptUint128(user1, borrowAmount),
        borrowAmount,
        user1.address,
        user1.address
      );

      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        blackPools.connect(owner).accrueInterest(
          params,
          await encryptUint128(owner, ratePerSecondRay),
          ratePerSecondRay
        )
      ).to.emit(blackPools, "InterestAccrued");

      const marketAfterAccrual = await blackPools.market(marketId);
      const expectedGrossInterest = (borrowAmount * ratePerSecondRay * 3600n) / 10n ** 27n;
      const expectedFee = (expectedGrossInterest * 1000n) / 10000n;
      const expectedSupplierInterest = expectedGrossInterest - expectedFee;

      await mock_expectPlaintext(
        ethers.provider,
        marketAfterAccrual.totalBorrowAssets,
        borrowAmount + expectedGrossInterest
      );
      await mock_expectPlaintext(
        ethers.provider,
        marketAfterAccrual.totalSupplyAssets,
        supplyAmount + expectedSupplierInterest
      );

      const ownerShares = supplyAmount;
      const expectedWithdrawAssets = (ownerShares * (supplyAmount + expectedSupplierInterest)) / supplyAmount;
      const ownerBalanceBefore = await usdc.balanceOf(owner.address);

      await blackPools.connect(owner).withdraw(
        params,
        await encryptUint128(owner, ownerShares),
        ownerShares,
        owner.address,
        owner.address
      );

      const ownerBalanceAfter = await usdc.balanceOf(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(expectedWithdrawAssets);
    });

    it("repays debt and burns the matching borrow shares", async function () {
      const liquidity = ethers.parseUnits("1000", 6);
      const collateral = ethers.parseUnits("0.5", 18);
      const borrowAmount = ethers.parseUnits("100", 6);
      const repayAmount = ethers.parseUnits("40", 6);

      await usdc.connect(owner).approve(await blackPools.getAddress(), liquidity);
      await blackPools.connect(owner).supply(
        params,
        await encryptUint128(owner, liquidity),
        liquidity,
        owner.address
      );

      await weth.connect(user1).approve(await blackPools.getAddress(), collateral);
      await blackPools.connect(user1).supplyCollateral(
        params,
        await encryptUint128(user1, collateral),
        collateral,
        user1.address
      );

      await blackPools.connect(user1).borrow(
        params,
        await encryptUint128(user1, borrowAmount),
        borrowAmount,
        user1.address,
        user1.address
      );

      await usdc.connect(user1).approve(await blackPools.getAddress(), repayAmount);
      await blackPools.connect(user1).repay(
        params,
        await encryptUint128(user1, repayAmount),
        repayAmount,
        user1.address
      );

      const positionAfterRepay = await blackPools.position(marketId, user1.address);
      const marketAfterRepay = await blackPools.market(marketId);
      await mock_expectPlaintext(ethers.provider, positionAfterRepay.borrowShares, borrowAmount - repayAmount);
      await mock_expectPlaintext(ethers.provider, marketAfterRepay.totalBorrowAssets, borrowAmount - repayAmount);
    });

    it("liquidates an unhealthy position after the oracle price drops", async function () {
      const liquidity = ethers.parseUnits("1000", 6);
      const collateral = ethers.parseUnits("0.1", 18);
      const borrowAmount = ethers.parseUnits("120", 6);
      const seizedCollateral = ethers.parseUnits("0.05", 18);

      await usdc.connect(owner).approve(await blackPools.getAddress(), liquidity);
      await blackPools.connect(owner).supply(
        params,
        await encryptUint128(owner, liquidity),
        liquidity,
        owner.address
      );

      await weth.connect(user1).approve(await blackPools.getAddress(), collateral);
      await blackPools.connect(user1).supplyCollateral(
        params,
        await encryptUint128(user1, collateral),
        collateral,
        user1.address
      );

      await blackPools.connect(user1).borrow(
        params,
        await encryptUint128(user1, borrowAmount),
        borrowAmount,
        user1.address,
        user1.address
      );

      await expect(
        blackPools.connect(user2).liquidate(
          params,
          user1.address,
          await encryptUint128(user2, seizedCollateral),
          seizedCollateral
        )
      ).to.be.revertedWith("BlackPools: position healthy");

      await oracle.setPrice(1000n * 10n ** 8n);

      const repaidAssets = ethers.parseUnits("50", 6);
      await usdc.connect(user2).approve(await blackPools.getAddress(), repaidAssets);

      const liquidatorCollateralBefore = await weth.balanceOf(user2.address);
      await blackPools.connect(user2).liquidate(
        params,
        user1.address,
        await encryptUint128(user2, seizedCollateral),
        seizedCollateral
      );
      const liquidatorCollateralAfter = await weth.balanceOf(user2.address);

      expect(liquidatorCollateralAfter - liquidatorCollateralBefore).to.equal(seizedCollateral);

      const positionAfterLiquidation = await blackPools.position(marketId, user1.address);
      await mock_expectPlaintext(ethers.provider, positionAfterLiquidation.collateral, collateral - seizedCollateral);
      await mock_expectPlaintext(
        ethers.provider,
        positionAfterLiquidation.borrowShares,
        borrowAmount - repaidAssets
      );
    });
  });
});
