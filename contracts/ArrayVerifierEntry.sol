// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Verifier.sol";

contract ArrayVerifierEntry {
    UltraHonkVerifier public immutable verifier;
    
    // The fixed array that inputs must match: [20, 5, 92]
    uint256[3] public targetArray = [20, 5, 92];
    
    constructor(address _verifier) {
        verifier = UltraHonkVerifier(_verifier);
    }
    
    function verifyArraysMatch(
        bytes calldata proof,
        uint256[3] calldata inputArray
    ) external view returns (bool) {
        // Build public inputs array for the verifier
        // The public inputs are the target array values
        uint256[] memory publicInputs = new uint256[](3);
        publicInputs[0] = targetArray[0];
        publicInputs[1] = targetArray[1];
        publicInputs[2] = targetArray[2];
        
        // Verify the proof
        // The proof proves that the private input array equals the public target array
        return verifier.verify(proof, publicInputs);
    }
    
    function getTargetArray() external view returns (uint256[3] memory) {
        return targetArray;
    }
}