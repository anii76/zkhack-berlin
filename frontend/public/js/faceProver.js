"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.faceProver = faceProver;
const hardhat_1 = __importDefault(require("hardhat"));
// faces should be already quantized
async function faceProver(referenceFace, probeFace, threshold) {
    const { noir, backend } = await hardhat_1.default.noir.getCircuit("zface_verifier");
    const input = {
        probeFace: probeFace.map(v => ({ x: v.toString() })),
        referenceFace: referenceFace.map(v => ({ x: v.toString() })),
        threshold: threshold.toString()
    };
    const { witness } = await noir.execute(input);
    const { proof, publicInputs } = await backend.generateProof(witness, {
        keccak: true,
    });
    return {
        witness,
        publicInputs,
        proof,
    };
}
