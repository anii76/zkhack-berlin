import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { HonkVerifier } from "../typechain-types";
import { BytesLike } from "ethers";

const faceA = Array.from({ length: 128 }, (_, i) => i / 127);
const faceABytes: BytesLike[] = faceA.map((x) => ethers.hexlify(x);
const faceB = faceA.map((x) => 1 - x);

let verifierContract: HonkVerifier;
before(async () => {
  verifierContract = await ethers.deployContract("HonkVerifier");
})

it("proves and verifies on-chain", async () => {
  // Deploy a verifier contract
  const contractFactory = await ethers.getContractFactory("ZFace");
  const contract = await contractFactory.deploy(await verifierContract.getAddress(), faceA);
  await contract.waitForDeployment();

  // Generate a proof
  const { noir, backend } = await hre.noir.getCircuit("my_noir");


  const input = { probeFace: faceA, referenceFace: faceA };
  const { witness } = await noir.execute(input);
  const { proof, publicInputs } = await backend.generateProof(witness, {
    keccak: true,
  });
  console.debug({ proof })
  // it matches because we marked y as `pub` in `main.nr`
  // expect(BigInt(publicInputs[30] * 127)).to.eq(BigInt(input.referenceFace[30] * 127));

  // Verify the proof on-chain
  const result = await contract.verify(proof);
  expect(result).to.eq(true);

  // You can also verify in JavaScript.
  const resultJs = await backend.verifyProof(
    {
      proof,
      publicInputs: [String(input.y)],
    },
    { keccak: true },
  );
  expect(resultJs).to.eq(true);
});
