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
};

export default config;
