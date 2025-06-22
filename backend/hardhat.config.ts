import "@nomicfoundation/hardhat-toolbox";
import "hardhat-noir";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.29",
    settings: { optimizer: { enabled: true, runs: 100000000 } },
  },
  noir: {
    version: "v0.39.0",
  },
  defaultNetwork: "arbitrumSepolia",//"hardhat",
  networks: {
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: ["259729b49f1748d2842867a8f3871fe81f8ff14878b32a728e2b3fa6c51b4c63"]
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      chainId: 31337
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    // Your API key for Etherscan _
    // Obtain one at https://etherscan.io/ or https://polygonscan.com/
    apiKey: { arbitrumSepolia: "WZPM4M5GYVTV33XXNXGT7Y1TKDU2R5SJRH" }
  }
};

export default config;

