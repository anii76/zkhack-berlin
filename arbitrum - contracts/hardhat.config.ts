import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
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