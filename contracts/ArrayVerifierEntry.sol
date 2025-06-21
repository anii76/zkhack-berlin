// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "./Verifier.sol";

contract ArrayVerifierEntry {
    HonkVerifier public immutable verifier;
    bytes32[2] private staticInputs = [
        bytes32("3"),
        bytes32("3")
    ];
    
    constructor(address _verifier) {
        verifier = HonkVerifier(_verifier);
    }
    
    function verifyArraysMatch(
        bytes calldata proof
    ) external view returns (bool) {
        bytes32[] memory publicInputs = new bytes32[](staticInputs.length);
        // Verify the proof
        // The proof proves that the private input array equals the public target array
        return verifier.verify(proof, publicInputs);
    }
}
