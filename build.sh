#!/bin/bash
set -euo pipefail

# Pipeline for compiling Noir programs and generating Solidity contracts
# This script should be run whenever main.nr is changed

set -e

echo "🔧 Starting build pipeline..."
rm -rf ./target

# Step 1: Compile Noir program
echo "📝 Compiling Noir program..."
nargo compile

# Step 2: Generate verification key
echo "🔑 Generating verification key..."
bb write_vk -b ./target/zface.json -o ./target

# Step 3: Generate Solidity verifier
echo "📄 Generating Solidity verifier contract..."
bb write_solidity_verifier -k ./target/vk -o ./contracts/Verifier.sol

echo "✅ Build complete! Contracts generated in ./contracts/"
echo ""
echo "Next steps:"
echo "1. Deploy contracts/Verifier.sol"
echo "2. Deploy contracts/ArrayVerifierEntry.sol with the Verifier address"
echo "3. Generate proofs with: nargo prove"

# Step 4: Regenerate entry contract (preserving the logic)
echo "📄 Regenerating entry contract..."
cat > ./contracts/ArrayVerifierEntry.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Verifier.sol";

contract ArrayVerifierEntry {
    HonkVerifier public immutable verifier;
    
    // The fixed array that inputs must match: [20, 5, 92]
    uint256[3] public targetArray = [20, 5, 92];
    
    constructor(address _verifier) {
        verifier = HonkVerifier(_verifier);
    }
    
    function verifyArraysMatch(
        bytes calldata proof,
        uint256[3] calldata inputArray
    ) external view returns (bool) {
        // Build public inputs array for the verifier
        // The public inputs are the target array values
        bytes32[] memory publicInputs = new bytes32[](3);
        publicInputs[0] = bytes32(targetArray[0]);
        publicInputs[1] = bytes32(targetArray[1]);
        publicInputs[2] = bytes32(targetArray[2]);
        
        // Verify the proof
        // The proof proves that the private input array equals the public target array
        return verifier.verify(proof, publicInputs);
    }
    
    function getTargetArray() external view returns (uint256[3] memory) {
        return targetArray;
    }
}
EOF
