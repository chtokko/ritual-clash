require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config();

const ritualPrivateKey = process.env.RITUAL_PRIVATE_KEY;

/** @type {import("hardhat/config").HardhatUserConfig} */
module.exports = {
  solidity: {
    version: "0.8.26",
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
    ritual: {
      url: process.env.RITUAL_RPC_URL || "https://rpc.ritualfoundation.org",
      chainId: 1979,
      accounts: ritualPrivateKey ? [ritualPrivateKey] : [],
    },
  },
  paths: {
    sources: "./contracts/evm",
    tests: "./test/evm",
    cache: "./hardhat-cache",
    artifacts: "./hardhat-artifacts",
  },
};
