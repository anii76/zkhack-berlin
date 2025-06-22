import { ethers } from "hardhat";
import Deployer from "../ignition/modules/Deployer";

async function main() {
    const deployer = await ethers.getContractFactory("Deployer");
    const deployerContract = await deployer.attach("0x86E5dE549fBF9a8cE9f4086259ecC1E66810f18b")
    const tx = await deployerContract.getAddress();
    // @ts-ignore 
    // salt, verifier address, face encoding
    const faceEncoding = Array(128).fill("0x0000000000000000000000000000000000000000000000000000000000000000");
    const g = await deployerContract.deploy(ethers.keccak256("0x9473EC0057AcBBa6b6E1d6af50d14C6343C0817D"), "0xb18038a8cbb3001E79f75adb8c79852eae0f4CeC", faceEncoding);
    console.log("Deployer deployed at", g);
    console.log("Deployer deployed at", tx);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
