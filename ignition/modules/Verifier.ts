import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VerifierModule = buildModule("HonkVerifier", (m) => {

  const verifier = m.contract("noir/target/my_noir.sol:HonkVerifier");


  return { verifier };
});

export default VerifierModule;
