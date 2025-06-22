import hre from "hardhat";
import Deployer from "../ignition/modules/Deployer";

async function main() {
    const deployer = await hre.ethers.getContractFactory("Deployer");
    const deployerContract = await deployer.attach("0x3b39F2783760a2B0D318995fE20dB587e55cADdc")
    const tx = await deployerContract.getAddress();
    // @ts-ignore 
    // salt, verifier address, face encoding
    const faceEncoding = Array(128).fill("0x0000000000000000000000000000000000000000000000000000000000000000");
    const g = await deployerContract.deploy(hre.ethers.keccak256("0x9473EC0057AcBBa6b6E1d6af50d14C6343C0817D"), "0x4f98718CE96ccAb7CEaaB5a81C7ddDAF77D8dDc8", faceEncoding, hre.ethers.zeroPadValue(hre.ethers.toBeHex(500000000), 32));
    console.log("Deployer deployed at", g);
    console.log("Deployer deployed at", tx);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
