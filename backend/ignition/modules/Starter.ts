import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const StarterModule = buildModule("ZFace", (m) => {

  const verifier = m.contract("noir/target/zface_verifier.sol:HonkVerifier");
  
  // Create a bytes32[128] array for face encoding (all zeros for now)
  const faceEncoding = Array(128).fill("0x0000000000000000000000000000000000000000000000000000000000000000");
  
  const zface = m.contract("ZFace", [verifier, faceEncoding], { value: 0n });

  return { zface, verifier };
});

export default StarterModule;
