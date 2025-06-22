import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VerifierModule = buildModule("HonkVerifier", (m) => {

  const verifier = m.contract("noir/target/zface_verifier.sol:HonkVerifier");


  return { verifier };
});

export default VerifierModule;
