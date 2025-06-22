"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
const VerifierModule = (0, modules_1.buildModule)("HonkVerifier", (m) => {
    const verifier = m.contract("noir/target/zface_verifier.sol:HonkVerifier");
    return { verifier };
});
exports.default = VerifierModule;
