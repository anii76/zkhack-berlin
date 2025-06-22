// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {HonkVerifier} from "../contracts/Verifier.sol";
import {ArrayVerifierEntry} from "../contracts/ArrayVerifierEntry.sol";

contract ArrayVerifierTest is Test {
    HonkVerifier public verifier;
    ArrayVerifierEntry public arrayVerifier;
    
    function setUp() public {
        // Deploy contracts
        verifier = new HonkVerifier();
        arrayVerifier = new ArrayVerifierEntry(address(verifier));
    }
    
    function testTargetArray() public view {
        // Test that the target array is set correctly
        uint256[3] memory target = arrayVerifier.getTargetArray();
        assertEq(target[0], 20);
        assertEq(target[1], 5);
        assertEq(target[2], 92);
    }
    
    function testVerifyWithRealProof() public {
        // To run this test, you need to:
        // 1. Generate a proof with: nargo prove
        // 2. Copy the proof hex here
        
        // Example (you'll need to replace with actual proof):
        // bytes memory proof = hex"YOUR_PROOF_HEX_HERE";
        // bool isValid = arrayVerifier.verifyArraysMatch(proof);
        // assertTrue(isValid, "Proof should be valid");
        
        // For now, just skip
        console.log("Skipping real proof test - need actual proof data");
    }
}