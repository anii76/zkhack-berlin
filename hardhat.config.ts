import "@nomicfoundation/hardhat-toolbox";
import "hardhat-noir";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: { optimizer: { enabled: true, runs: 100000000 } },
  },
  noir: {
    version: "0.39.0",
  },
  defaultNetwork: "arbitrumSepolia",//"hardhat",
  networks: {
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: [""]
    }
  },
  etherscan: {
    // Your API key for Etherscan _
    // Obtain one at https://etherscan.io/ or https://polygonscan.com/
    apiKey: { arbitrumSepolia: "" }
  }
};

export default config;
