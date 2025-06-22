// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ArrayVerifierEntry} from "../contracts/ArrayVerifierEntry.sol";

contract TestProofScript is Script {
    function run() public view {
        // Get the deployed ArrayVerifierEntry address from env
        address arrayVerifierEntry = vm.envAddress("ARRAY_VERIFIER_ENTRY");
        
        // Get the proof from env
        bytes memory proof = vm.envBytes("PROOF_HEX");
        
        // Call the verifyArraysMatch function
        ArrayVerifierEntry verifier = ArrayVerifierEntry(arrayVerifierEntry);
        
        console.log("Testing proof verification...");
        console.log("Contract address:", arrayVerifierEntry);
        console.log("Proof length:", proof.length);
        
        bool isValid = verifier.verifyArraysMatch(proof);
        
        if (isValid) {
            console.log(unicode"✅ Proof verified successfully!");
        } else {
            console.log(unicode"❌ Proof verification failed!");
        }
    }
}
