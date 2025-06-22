import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const API_URL = "https://relayer-api.horizenlabs.io/api/v1";

const bufvk = fs.readFileSync("./assets/noir/vk");
const bufproof = fs.readFileSync("./assets/noir/proof");
const base64Proof = bufproof.toString("base64");
const base64Vk = bufvk.toString("base64");
console.log("My vk key is : ", bufvk);
console.log("My vk key in base64 is : ", base64Vk);

async function main() {
  // Required code

  const params = {
    proofType: "ultraplonk",
    vkRegistered: false,
    proofOptions: {
      numberOfPublicInputs: 1, // Replace this for the number of public inputs your circuit support
    },
    proofData: {
      proof: base64Proof,
      vk: base64Vk,
    },
  };

  const requestResponse = await axios.post(
    `${API_URL}/submit-proof/${process.env.API_KEY}`,
    params
  );
  console.log(requestResponse.data);

  if (requestResponse.data.optimisticVerify != "success") {
    console.error("Proof verification, check proof artifacts");
    return;
  }

  while (true) {
    const jobStatusResponse = await axios.get(
      `${API_URL}/job-status/${process.env.API_KEY}/${requestResponse.data.jobId}`
    );
    if (jobStatusResponse.data.status === "Finalized") {
      console.log("Job finalized successfully");
      console.log(jobStatusResponse.data);
      break;
    } else {
      console.log("Job status: ", jobStatusResponse.data.status);
      console.log("Waiting for job to finalize...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
    }
  }
}

main();
