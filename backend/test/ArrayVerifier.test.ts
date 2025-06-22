import { expect } from "chai";
import { ethers } from "hardhat";
import { HonkVerifier, ArrayVerifierEntry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ArrayVerifier", function () {
  let verifier: HonkVerifier;
  let arrayVerifier: ArrayVerifierEntry;
  let owner: SignerWithAddress;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();

    // Deploy HonkVerifier
    const HonkVerifierFactory = await ethers.getContractFactory("HonkVerifier");
    verifier = await HonkVerifierFactory.deploy();
    await verifier.waitForDeployment();

    // Deploy ArrayVerifierEntry
    const ArrayVerifierEntryFactory = await ethers.getContractFactory("ArrayVerifierEntry");
    arrayVerifier = await ArrayVerifierEntryFactory.deploy(await verifier.getAddress());
    await arrayVerifier.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct verifier address", async function () {
      const verifierAddress = await arrayVerifier.honkVerifier();
      expect(verifierAddress).to.equal(await verifier.getAddress());
    });

    it("Should have the correct target array", async function () {
      const targetArray = await arrayVerifier.getTargetArray();
      expect(targetArray[0]).to.equal(20n);
      expect(targetArray[1]).to.equal(5n);
      expect(targetArray[2]).to.equal(92n);
    });
  });

  describe("Proof Verification", function () {
    it("Should verify a valid proof", async function () {
      // This test requires a real proof generated from the Noir circuit
      // To generate a proof:
      // 1. Run `nargo compile`
      // 2. Create Prover.toml with matching arrays
      // 3. Run `nargo execute`
      // 4. Run `bb prove` to generate the proof
      
      // For now, we'll skip this test as it requires a real proof
      this.skip();
    });

    it("Should reject an invalid proof", async function () {
      // Test with invalid proof data
      const invalidProof = "0x" + "00".repeat(100); // Dummy proof data
      
      // This should revert or return false depending on implementation
      await expect(
        arrayVerifier.verifyArraysMatch(invalidProof)
      ).to.be.reverted;
    });
  });
});