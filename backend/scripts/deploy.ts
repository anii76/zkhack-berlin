import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const networkName = process.env.HARDHAT_NETWORK || "localhost";
  console.log(`🚀 Deploying to ${networkName}...`);

  try {
    // Deploy the HonkVerifier contract
    console.log("Deploying HonkVerifier...");
    const HonkVerifier = await ethers.getContractFactory("HonkVerifier");
    const verifier = await HonkVerifier.deploy();
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();
    console.log(`HonkVerifier deployed at: ${verifierAddress}`);

    // Deploy the ArrayVerifierEntry contract with the verifier address
    console.log("Deploying ArrayVerifierEntry...");
    const ArrayVerifierEntry = await ethers.getContractFactory("ArrayVerifierEntry");
    const entry = await ArrayVerifierEntry.deploy(verifierAddress);
    await entry.waitForDeployment();
    const entryAddress = await entry.getAddress();
    console.log(`ArrayVerifierEntry deployed at: ${entryAddress}`);

    console.log("✅ Deployment complete!");
    
    // Save deployment addresses for later use
    const fs = await import('fs');
    const deploymentInfo = {
      network: networkName,
      contracts: {
        HonkVerifier: verifierAddress,
        ArrayVerifierEntry: entryAddress
      },
      timestamp: new Date().toISOString()
    };
    
    const deploymentsDir = './deployments';
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      `${deploymentsDir}/${networkName}.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log(`Deployment info saved to ${deploymentsDir}/${networkName}.json`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});