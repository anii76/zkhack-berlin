"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const deployer = yield hardhat_1.ethers.getContractFactory("Deployer");
        const deployerContract = yield deployer.attach("0x86E5dE549fBF9a8cE9f4086259ecC1E66810f18b");
        const tx = yield deployerContract.getAddress();
        // @ts-ignore 
        // salt, verifier address, face encoding
        const faceEncoding = Array(128).fill("0x0000000000000000000000000000000000000000000000000000000000000000");
        const g = yield deployerContract.deploy(hardhat_1.ethers.keccak256("0x9473EC0057AcBBa6b6E1d6af50d14C6343C0817D"), "0xb18038a8cbb3001E79f75adb8c79852eae0f4CeC", faceEncoding);
        console.log("Deployer deployed at", g);
        console.log("Deployer deployed at", tx);
    });
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
