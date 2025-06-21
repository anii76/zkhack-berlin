import { expect } from "chai";
import hre, { ethers } from "hardhat";

it("proves and verifies on-chain", async () => {
  // Deploy a verifier contract
  const contractFactory = await ethers.getContractFactory("MyContract");
  const contract = await contractFactory.deploy();
  await contract.waitForDeployment();

  // Generate a proof
  const { noir, backend } = await hre.noir.getCircuit("my_noir");

  const faceA = Array.from({ length: 128 }, (_, i) => i / 127);
  const faceB = faceA.map((x) => 1 - x);

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
