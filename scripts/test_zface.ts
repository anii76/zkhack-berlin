import { ethers } from "hardhat";
import Deployer from "../ignition/modules/Deployer";

async function main() {
    const zface = await ethers.getContractFactory("ZFace");
    const zfaceContract = await zface.attach("0xA2b6EBE2f95b0d5fCA020eB6F638942604dd7787")
    const tx = await zfaceContract.getAddress();
    // @ts-ignore 
    // salt, verifier address, face encoding
    const faceEncoding = Array(128).fill("0x0000000000000000000000000000000000000000000000000000000000000000");
    const g = await zfaceContract.withdraw();
    console.log("ZFace deployed at", g);
    console.log("ZFace deployed at", tx);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
