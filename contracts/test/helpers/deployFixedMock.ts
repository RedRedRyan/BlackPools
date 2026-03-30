/**
 * test/helpers/deployFixedMocks.ts
 *
 * After the cofhe-hardhat-plugin injects the upstream TaskManager at
 * 0xeA30c4B8...D9, this helper overwrites that same address with
 * FixedTaskManager (which corrects the appendMetadata double-shift bug),
 * then re-runs the plugin's own post-deploy wiring.
 *
 * Call once in a top-level before() hook:
 *
 *   import { deployFixedMocks } from "./helpers/deployFixedMocks";
 *   before(async () => { await deployFixedMocks(); });
 */

import { ethers } from "hardhat";
import type { ContractFactory } from "ethers";

// Fixed address the cofhe-hardhat-plugin always uses for TaskManager.
// Source: cofhe-hardhat-plugin/src/addresses.ts
const TASK_MANAGER_ADDRESS = "0xeA30c4B8b44078Bbf8a6ef5b9f1eC1626C7848D9";

export async function deployFixedMocks(): Promise<void> {
  const [deployer] = await ethers.getSigners();

  // ── 1. Deploy FixedTaskManager to a temp address to get deployed bytecode ──
  //
  // hardhat_setCode requires the *deployed* bytecode (no constructor).
  // The easiest way to get it is to actually deploy once and read the code.
  const FixedTMFactory = await ethers.getContractFactory("FixedTaskManager");
  const deployed       = await getDeployedBytecode(FixedTMFactory);

  // ── 2. Overwrite the plugin's TaskManager address with the fixed bytecode ──
  await ethers.provider.send("hardhat_setCode", [TASK_MANAGER_ADDRESS, deployed]);

  // ── 3. Re-initialize (setCode wipes storage) ───────────────────────────────
  const taskManager = await ethers.getContractAt("FixedTaskManager", TASK_MANAGER_ADDRESS);
  await (await taskManager.initialize(deployer.address)).wait();

  // ── 4. Redeploy ACL and wire it in ─────────────────────────────────────────
  //
  // The plugin deploys ACL at a dynamic address and calls setACLContract().
  // After setCode the TM storage is gone so we need a fresh ACL.
  const ACLFactory = await ethers.getContractFactory("ACL");
  const acl        = await ACLFactory.deploy(deployer.address);
  await acl.waitForDeployment();
  await (await taskManager.setACLContract(await acl.getAddress())).wait();

  // ── 5. Security zones — plugin default is min=0, max=0 ────────────────────
  await (await taskManager.setSecurityZones(0, 0)).wait();

  console.log("✓ FixedTaskManager patched at", TASK_MANAGER_ADDRESS);
  console.log("✓ Fresh ACL deployed at      ", await acl.getAddress());
}

async function getDeployedBytecode(factory: ContractFactory): Promise<string> {
  const tmp  = await factory.deploy();
  await tmp.waitForDeployment();
  return ethers.provider.getCode(await tmp.getAddress());
}