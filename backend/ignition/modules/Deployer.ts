// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployerModule = buildModule("DeployerModule", (m) => {
  const deployer = m.contract("Deployer");

  return { deployer };
});

export default DeployerModule;