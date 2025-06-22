import { ethers } from "hardhat";
import ZFace from "../ignition/modules/Zface";
import fs from "fs";

async function main() {
    const zface = await ethers.getContractFactory("ZFace");
    const zfaceContract = await zface.attach("0xA2b6EBE2f95b0d5fCA020eB6F638942604dd7787")
    const tx = await zfaceContract.getAddress();
    // @ts-ignore 
    // receiver address, proof
    const proof = fs.readFileSync("proof.json", "utf-8");
    const g = await zfaceContract.withdraw("0x9473EC0057AcBBa6b6E1d6af50d14C6343C0817A", proof);
    console.log("ZFace deployed at", g);
    console.log("ZFace deployed at", tx);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
