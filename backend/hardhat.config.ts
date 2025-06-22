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
      accounts: [""]
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
    apiKey: { arbitrumSepolia: "" }
  }
};

export default config;

