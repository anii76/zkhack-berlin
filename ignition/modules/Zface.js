"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
const ethers_1 = require("ethers");
const StarterModule = (0, modules_1.buildModule)("ZFace", (m) => {
    const verifier = m.contract("HonkVerifier");
    // Create a bytes32[128] array for face encoding (all zeros for now)
    const faceEncoding = Array(128).fill("0x0000000000000000000000000000000000000000000000000000000000000000");
    // Convert threshold to bytes32 format using ethers.js
    const threshold = ethers_1.ethers.zeroPadValue(ethers_1.ethers.toBeHex(300000000), 32);
    const zface = m.contract("ZFace", [verifier, faceEncoding, threshold], { value: 0n });
    return { zface, verifier };
});
exports.default = StarterModule;
