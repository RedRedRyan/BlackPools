import { ethers, run } from "hardhat";
import { saveDeployment, logDeploymentSummary } from "./utils";

/**
 * Helper to verify contracts on Etherscan/Arbiscan/Basescan.
 */
async function verify(address: string, constructorArguments: any[] = []) {
  console.log(`🔍 Verifying contract at ${address}...`);
  try {
    await run("verify:verify", {
      address,
      constructorArguments,
    });
    console.log("✓ Contract verified!");
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("✓ Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }
}

/**
 * Deploy all Black Pools contracts.
 * Deploys: TestERC20 (USDC, WETH), MockPool, BlackPools, BlackPoolsTaskManager, Counter.
 */
async function main() {
  console.log("🚀 Deploying Black Pools contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}\n`);

  const network = (await ethers.provider.getNetwork()).name;
  const isLocal = network === "localhost" || network === "hardhat";

  // Deploy TestERC20 tokens
  console.log("📦 Deploying TestERC20 tokens...");
  const TestERC20Factory = await ethers.getContractFactory("TestERC20");

  const testUSDC = await TestERC20Factory.deploy("Test USDC", "USDC", 6);
  await testUSDC.waitForDeployment();
  const testUSDCAddr = await testUSDC.getAddress();
  console.log(`✓ Test USDC deployed: ${testUSDCAddr}`);

  const testWETH = await TestERC20Factory.deploy("Test WETH", "WETH", 18);
  await testWETH.waitForDeployment();
  const testWETHAddr = await testWETH.getAddress();
  console.log(`✓ Test WETH deployed: ${testWETHAddr}`);

  console.log("\n📦 Deploying TestPriceOracle...");
  const TestPriceOracleFactory = await ethers.getContractFactory("TestPriceOracle");
  const testOracle = await TestPriceOracleFactory.deploy(8, BigInt(2000e8));
  await testOracle.waitForDeployment();
  const testOracleAddr = await testOracle.getAddress();
  console.log(`✓ TestPriceOracle deployed: ${testOracleAddr}`);

  // Deploy MockPool
  console.log("\n📦 Deploying MockPool...");
  const MockPoolFactory = await ethers.getContractFactory("MockPool");
  const mockPool = await MockPoolFactory.deploy();
  await mockPool.waitForDeployment();
  const mockPoolAddr = await mockPool.getAddress();
  console.log(`✓ MockPool deployed: ${mockPoolAddr}`);

  // Deploy BlackPools
  console.log("\n📦 Deploying BlackPools...");
  const BlackPoolsFactory = await ethers.getContractFactory("BlackPools");
  const blackPools = await BlackPoolsFactory.deploy();
  await blackPools.waitForDeployment();
  const blackPoolsAddr = await blackPools.getAddress();
  console.log(`✓ BlackPools deployed: ${blackPoolsAddr}`);

  // Deploy BlackPoolsTaskManager
  console.log("\n📦 Deploying BlackPoolsTaskManager...");
  const TaskManagerFactory = await ethers.getContractFactory("contracts/TaskManager.sol:BlackPoolsTaskManager");
  const taskManager = await TaskManagerFactory.deploy();
  await taskManager.waitForDeployment();
  const taskManagerAddr = await taskManager.getAddress();
  console.log(`✓ BlackPoolsTaskManager deployed: ${taskManagerAddr}`);

  // Save deployment addresses
  const addresses = {
    testUSDC: testUSDCAddr,
    testWETH: testWETHAddr,
    testOracle: testOracleAddr,
    mockPool: mockPoolAddr,
    blackPools: blackPoolsAddr,
    taskManager: taskManagerAddr,
  };

  saveDeployment(network, addresses);
  logDeploymentSummary(addresses);

  if (!isLocal) {
    console.log("\n⏳ Waiting for block confirmations for verification (this may take a minute)...");
    // Wait for 3-5 confirmations for more reliable verification
    await taskManager.deploymentTransaction()?.wait(5);

    console.log("\n🛠 Starting verification process...");
    await verify(testUSDCAddr, ["Test USDC", "USDC", 6]);
    await verify(testWETHAddr, ["Test WETH", "WETH", 18]);
    await verify(testOracleAddr, [8, BigInt(2000e8)]);
    await verify(mockPoolAddr);
    await verify(blackPoolsAddr);
    await verify(taskManagerAddr);
  }

  console.log("✅ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

