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
        const zface = yield hardhat_1.ethers.getContractFactory("ZFace");
        const zfaceContract = yield zface.attach("0xA2b6EBE2f95b0d5fCA020eB6F638942604dd7787");
        const tx = yield zfaceContract.getAddress();
        // @ts-ignore 
        // salt, verifier address, face encoding
        const proof = Array(128).fill("0x0000000000000000000000000000000000000000000000000000000000000000");
        const g = yield zfaceContract.withdraw("0x9473EC0057AcBBa6b6E1d6af50d14C6343C0817A");
        console.log("ZFace deployed at", g);
        console.log("ZFace deployed at", tx);
    });
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
