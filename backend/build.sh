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
bb prove -b ./target/zface.json -w ./target/zface.gz -o ./target/proof

echo "✅ Build complete! Contracts generated in ./contracts/"
echo ""
echo "Next steps:"
echo "1. Deploy contracts/Verifier.sol"
echo "2. Deploy contracts/ArrayVerifierEntry.sol with the Verifier address"
