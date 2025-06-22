import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';
import { Barretenberg, RawBuffer } from '@aztec/bb.js';
import { decompressSync } from 'fflate';

async function main() {
  console.log("🧪 Testing ArrayVerifierEntry contract...");
  
  const networkName = process.env.HARDHAT_NETWORK || "localhost";
  
  try {
    // Step 1: Create test inputs
    console.log("📝 Creating Prover.toml with test inputs...");
    const proverToml = `array1 = ["20", "5", "92"]
array2 = ["20", "5", "92"]
x = "3"
y = "3"`;
    fs.writeFileSync('Prover.toml', proverToml);
    
    // Step 2: Generate proof using bb.js
    console.log("🔐 Generating proof with Barretenberg...");
    
    // Initialize Barretenberg
    const bb = await Barretenberg.new();
    
    // Read the compiled circuit
    const circuitPath = path.join(process.cwd(), 'target/zface.json');
    if (!fs.existsSync(circuitPath)) {
      throw new Error("Compiled circuit not found. Please run 'nargo compile' first.");
    }
    
    const circuit = JSON.parse(fs.readFileSync(circuitPath, 'utf-8'));
    const bytecode = Buffer.from(circuit.bytecode, 'base64');
    
    // Read witness data
    const witnessPath = path.join(process.cwd(), 'target/zface.gz');
    if (!fs.existsSync(witnessPath)) {
      console.log("⚠️  Witness not found. Please run 'nargo execute' first.");
      throw new Error("Witness file not found");
    }
    
    // Decompress witness
    const compressedWitness = fs.readFileSync(witnessPath);
    const witnessData = decompressSync(compressedWitness);
    
    const proofPath = path.join(process.cwd(), 'target/proof');
    
    // Step 3: Get deployed contract address
    console.log("📍 Getting ArrayVerifierEntry address...");
    const deploymentFile = `./deployments/${networkName}.json`;
    if (!fs.existsSync(deploymentFile)) {
      throw new Error(`Deployment file not found: ${deploymentFile}. Please run deploy script first.`);
    }
    
    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf-8'));
    const arrayVerifierAddress = deployment.contracts.ArrayVerifierEntry;
    console.log(`ArrayVerifierEntry deployed at: ${arrayVerifierAddress}`);
    
    // Step 4: Call the contract
    console.log("🧪 Running proof verification...");
    const ArrayVerifierEntry = await ethers.getContractFactory("ArrayVerifierEntry");
    const verifier = ArrayVerifierEntry.attach(arrayVerifierAddress);
    
    // Convert proof to hex string
    const proofHex = '0x' + proof.toString('hex');
    console.log(`Proof (hex): ${proofHex.substring(0, 100)}...`);
    
    // Call verifyArraysMatch
    const isValid = await verifier.verifyArraysMatch(proofHex);
    
    if (isValid) {
      console.log("✅ Proof verified successfully!");
    } else {
      console.log("❌ Proof verification failed!");
    }
    
    await bb.destroy();
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
