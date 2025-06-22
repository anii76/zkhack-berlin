"use strict";
// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
const DeployerModule = (0, modules_1.buildModule)("DeployerModule", (m) => {
    const deployer = m.contract("Deployer");
    return { deployer };
});
exports.default = DeployerModule;
