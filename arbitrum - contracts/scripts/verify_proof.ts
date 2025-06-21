import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Define the interface for the verifier contract
interface IVerifier {
    verify(proof: string, publicInputs: string[]): Promise<boolean>;
}

async function main() {
    console.log("🔍 Loading proof and public inputs...");
    
    // Load the proof from file (binary format)
    const proofPath = path.join(__dirname, "proof");
    const proofBytes = fs.readFileSync(proofPath);
    const proofHex = "0x" + proofBytes.toString("hex");
    
    console.log(`📄 Proof loaded: ${proofHex.substring(0, 100)}...`);
    console.log(`📏 Proof size: ${proofBytes.length} bytes`);
    
    // Load the public inputs from file (binary format)
    const publicInputsPath = path.join(__dirname, "public_inputs");
    const publicInputsBytes = fs.readFileSync(publicInputsPath);
    
    // Convert public inputs to bytes32 array
    // Assuming each public input is 32 bytes (256 bits)
    const publicInputs: string[] = [];
    for (let i = 0; i < publicInputsBytes.length; i += 32) {
        const chunk = publicInputsBytes.slice(i, i + 32);
        // Pad with zeros if less than 32 bytes
        const padded = Buffer.concat([chunk, Buffer.alloc(32 - chunk.length, 0)]);
        publicInputs.push("0x" + padded.toString("hex"));
    }
    
    console.log(`📊 Public inputs: ${publicInputs.map(input => input.substring(0, 10) + "...")}`);
    console.log(`📏 Number of public inputs: ${publicInputs.length}`);
    
    // Get the deployed verifier contract
    console.log("🏗️  Connecting to deployed verifier contract...");
    const verifierFactory = await ethers.getContractFactory("HonkVerifier");
    
    // Replace this with your actual deployed contract address
    const verifierAddress = "0x3c2c0741A0e15B4ebEC5108129D1736F97AFddD8"; // Update this
    const verifier = verifierFactory.attach(verifierAddress) as any as IVerifier;
    
    console.log(`📍 Verifier contract address: ${verifierAddress}`);
    
    try {
        console.log("🔐 Calling verify function...");
        
        // Call the verify function
        const result = await verifier.verify(proofHex, publicInputs);
        
        console.log("✅ Verification result:", result);
        
        if (result) {
            console.log("🎉 Proof verification successful!");
        } else {
            console.log("❌ Proof verification failed!");
        }
        
    } catch (error) {
        console.error("❌ Error during verification:", error);
        
        // Check if it's a specific error from the contract
        if (error instanceof Error) {
            if (error.message.includes("ProofLengthWrong")) {
                console.log("💡 Error: Proof length is incorrect. Expected 440 * 32 = 14080 bytes");
            } else if (error.message.includes("PublicInputsLengthWrong")) {
                console.log("💡 Error: Number of public inputs doesn't match the verification key");
            } else if (error.message.includes("SumcheckFailed")) {
                console.log("💡 Error: Sumcheck verification failed");
            } else if (error.message.includes("ShpleminiFailed")) {
                console.log("💡 Error: Shplemini verification failed");
            }
        }
    }
}

// Alternative function to verify with custom data
async function verifyWithCustomData(proofHex: string, publicInputsHex: string[]) {
    console.log("🔍 Verifying with custom data...");
    
    const verifierFactory = await ethers.getContractFactory("HonkVerifier");
    const verifierAddress = "0x3c2c0741A0e15B4ebEC5108129D1736F97AFddD8"; // Update this
    const verifier = verifierFactory.attach(verifierAddress) as any as IVerifier;
    
    try {
        const result = await verifier.verify(proofHex, publicInputsHex);
        console.log("✅ Custom verification result:", result);
        return result;
    } catch (error) {
        console.error("❌ Custom verification error:", error);
        throw error;
    }
}

// Example usage with hardcoded test data
async function verifyWithTestData() {
    console.log("🧪 Testing with sample data...");
    
    // This is just an example - replace with your actual proof and public inputs
    const sampleProof = "0x" + "00".repeat(14080); // 440 * 32 bytes of zeros (invalid proof)
    const samplePublicInputs = ["0x" + "00".repeat(64)]; // One public input of zeros
    
    try {
        await verifyWithCustomData(sampleProof, samplePublicInputs);
    } catch (error) {
        console.log("Expected error for invalid test data");
    }
}

// Export functions for use in other scripts
export { verifyWithCustomData, verifyWithTestData };

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 