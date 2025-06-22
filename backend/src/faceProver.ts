import hre, { ethers } from "hardhat";

// faces should be already quantized
export async function faceProver(referenceFace: bigint[], probeFace: bigint[], threshold: number): Promise<{ witness: Uint8Array; publicInputs: string[]; proof: Uint8Array; }> {
  const { noir, backend } = await hre.noir.getCircuit("zface_verifier");


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
