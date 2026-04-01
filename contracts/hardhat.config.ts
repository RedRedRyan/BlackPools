import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "cofhe-hardhat-plugin";
import "hardhat-gas-reporter";
import "solidity-coverage";
import dotenv from "dotenv";
 
dotenv.config(); // Load from current directory
dotenv.config({ path: "../.env" }); // Fallback to parent directory

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      hardfork: "cancun",
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.ankr.com/eth_sepolia",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    arbitrumSepolia: {
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 421614,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      arbitrumSepolia: process.env.ARB_ETHERSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "",
      baseSepolia: process.env.BASE_ETHERSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

import { task } from "hardhat/config";

task("deploy:eth", "Deploy to Ethereum Sepolia").setAction(async (_, { run }) => {
  await run("run", { script: "tasks/deploy-vault.ts", network: "sepolia" });
});

task("deploy:arb", "Deploy to Arbitrum Sepolia").setAction(async (_, { run }) => {
  await run("run", { script: "tasks/deploy-vault.ts", network: "arbitrumSepolia" });
});

task("deploy:base", "Deploy to Base Sepolia").setAction(async (_, { run }) => {
  await run("run", { script: "tasks/deploy-vault.ts", network: "baseSepolia" });
});

export default config;
