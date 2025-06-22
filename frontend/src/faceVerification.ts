import { faceProver } from '../../src/faceProver';
import { quantize } from '../../src/quantize';
import { THRESHOLD } from '../../src/threshold';

export async function generateFaceProof(
  referenceFace: number[], 
  probeFace: number[], 
  threshold?: number
): Promise<{ proof: string; publicInputs: string[] }> {
  // Quantize the face embeddings (convert float arrays to bigint arrays)
  const quantizedReference = referenceFace.map(value => quantize(value));
  const quantizedProbe = probeFace.map(value => quantize(value));
  
  // Use provided threshold or default
  const proofThreshold = threshold || Number(THRESHOLD);
  
  // Generate the ZK proof
  const result = await faceProver(quantizedReference, quantizedProbe, proofThreshold);
  
  // Convert proof to hex string for easy transmission
  const proofHex = '0x' + Array.from(result.proof)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  
  return {
    proof: proofHex,
    publicInputs: result.publicInputs
  };
}