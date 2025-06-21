import { ethers } from "hardhat";
import Deployer from "../ignition/modules/Deployer";

async function main() {
    const deployer = await ethers.getContractFactory("Deployer");
    const deployerContract = await deployer.attach("0xAF87d3DBD96d5c833E2d5220d33f539e56B8791D")
    const tx = await deployerContract.getAddress();
    // @ts-ignore 
    // salt, owner
    const g = await deployerContract.deploy(ethers.keccak256("0x9473EC0057AcBBa6b6E1d6af50d14C6343C0817B"), "0x9473EC0057AcBBa6b6E1d6af50d14C6343C0817A");
    console.log("Deployer deployed at", g);
    console.log("Deployer deployed at", tx);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
