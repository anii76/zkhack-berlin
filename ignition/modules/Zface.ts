import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

const StarterModule = buildModule("ZFace", (m) => {

  const verifier = m.contract("HonkVerifier");
  
  // Create a bytes32[128] array for face encoding (all zeros for now)
  const faceEncoding = Array(128).fill("0x0000000000000000000000000000000000000000000000000000000000000000");
  
  // Convert threshold to bytes32 format using ethers.js
  const threshold = ethers.zeroPadValue(ethers.toBeHex(500000000), 32);
  
  const zface = m.contract("ZFace", [verifier, faceEncoding, threshold], { value: BigInt("1000000000000000"), // 0.001 ETH in wei
   });

  return { zface, verifier };
});

export default StarterModule;
