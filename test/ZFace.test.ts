import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { HonkVerifier } from "../typechain-types";
import { BytesLike } from "ethers";

function quantize(value: number): number {
  // Convert a floating-point number to a quantized integer
  // Assuming we want to scale it to 16-bit precision
  return Math.floor(value * (2 ** 16)); // Scale to 16-bit integer
}

function quantizedToBytes32(value: number): BytesLike {
  // Convert quantized value to bytes32 representation
  // Assuming quantized values are represented as scaled integers
  const buffer = new ArrayBuffer(32);
  const view = new DataView(buffer);
  view.setUint32(28, value, false); // Store in last 4 bytes, big-endian
  return new Uint8Array(buffer);
}

// Create test face embeddings (quantized values)
const faceA = Array(128).fill(0).map(quantize);
const faceABytes: BytesLike[] = faceA.map(quantizedToBytes32);
const faceB = Array(128).fill(1).map(quantize);;
const faceBBytes: BytesLike[] = faceB.map(quantizedToBytes32);

// Set threshold for similarity (sum of squared differences)
const threshold = 1000; // Adjust based on your similarity requirements
const thresholdBytes = quantizedToBytes32(threshold);

let verifierContract: HonkVerifier;
before(async () => {
  verifierContract = await ethers.deployContract("HonkVerifier");
})

it("proves and verifies on-chain", async () => {
  // Deploy the ZFace contract with reference face and threshold
  const contractFactory = await ethers.getContractFactory("ZFace");
  const contract = await contractFactory.deploy(
    await verifierContract.getAddress(), 
    faceABytes,
    thresholdBytes
  );
  await contract.waitForDeployment();

  // Generate a proof
  const { noir, backend } = await hre.noir.getCircuit("my_noir");

  
  const input = { 
    probeFace: faceA.map(v => ({ x: v })), 
    referenceFace: faceA.map(v => ({ x: v })),
    threshold: threshold
  };
  
  const { witness } = await noir.execute(input);
  const { proof, publicInputs } = await backend.generateProof(witness, {
    keccak: true,
  });
  console.debug({ proof });
  
  // Verify that public inputs match (reference face + threshold)
  expect(publicInputs.length).to.eq(129);

  // Verify the proof on-chain
  const result = await contract.verify(proof);
  expect(result).to.eq(true);

  // You can also verify in JavaScript
  const resultJs = await backend.verifyProof(
    {
      proof,
      publicInputs,
    },
    { keccak: true },
  );
  expect(resultJs).to.eq(true);
});

it("fails verification with different faces", async () => {
  // Deploy the ZFace contract
  const contractFactory = await ethers.getContractFactory("ZFace");
  const contract = await contractFactory.deploy(
    await verifierContract.getAddress(), 
    faceABytes,
    thresholdBytes
  );
  await contract.waitForDeployment();

  // Generate a proof with different probe face
  const { noir, backend } = await hre.noir.getCircuit("my_noir");

  const quantizedFaceA = faceA.map(v => ({ sign: 0, integer: v, fractional: 0 }));
  const quantizedFaceB = faceB.map(v => ({ sign: 0, integer: v, fractional: 0 }));
  
  // This should fail in the circuit execution because sum of squared differences > threshold
  await expect(noir.execute({ 
    probeFace: quantizedFaceB, 
    referenceFace: quantizedFaceA,
    threshold: 10 // Low threshold to ensure failure
  })).to.be.rejected;
});
