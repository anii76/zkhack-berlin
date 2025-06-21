import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VerifierModule = buildModule("Verifier", (m) => {

  const verifier = m.contract("Verifier");


  return { verifier };
});
