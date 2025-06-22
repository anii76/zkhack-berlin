import { BytesLike } from "ethers";

export function quantize(value: number): bigint {
  // Convert a floating-point number to a quantized integer
  // Scale to 16-bit precision and handle negative numbers
  const scaled = Math.floor(value * (2 ** 16));
  // Handle negative numbers using the field prime p
  const p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495616");
  if (scaled < 0) {
    return p + BigInt(scaled);
  }
  return BigInt(scaled);
}

export function quantizedToBytes32(value: bigint): BytesLike {
  // Convert quantized value to bytes32 representation
  // Handle BigInt values properly
  const hex = value.toString(16).padStart(64, '0'); // Convert to hex and pad to 32 bytes
  const buffer = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    buffer[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return buffer;
}
