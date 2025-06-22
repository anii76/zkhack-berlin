#!/bin/bash

echo "🧪 Testing ArrayVerifierEntry contract..."

# Step 1: Generate a proof with Noir
echo "📝 Creating Prover.toml with test inputs..."
cat > Prover.toml << EOF
array1 = ["20", "5", "92"]
array2 = ["20", "5", "92"]
x = "3"
y = "3"
EOF

echo "🔨 Compiling circuit..."
nargo compile

echo "🎯 Generating witness..."
nargo execute

echo "🔐 Generating proof with Barretenberg..."
bb prove -b ./target/zface.json -w ./target/zface.gz -o ./out/proof

echo "📄 Proof generated at ./out/proof"

# Step 2: Convert the proof to hex format for Solidity
echo "🔄 Converting proof to hex..."
export PROOF_HEX=0x$(xxd -p -c 10000 ./out/proof | tr -d '\n')
echo "Proof (hex): ${PROOF_HEX:0:100}..."  # Display first 100 chars for brevity

# Step 3: Extract ArrayVerifierEntry address from latest deployment
echo "📍 Getting ArrayVerifierEntry address from latest deployment..."
ARRAY_VERIFIER_ENTRY=$(jq -r '.transactions[] | select(.contractName == "ArrayVerifierEntry") | .contractAddress' ./broadcast/Deploy.s.sol/31337/run-latest.json)

if [ -z "$ARRAY_VERIFIER_ENTRY" ]; then
    echo "❌ Error: Could not find ArrayVerifierEntry address in deployment"
    exit 1
fi

echo "ArrayVerifierEntry deployed at: $ARRAY_VERIFIER_ENTRY"

# Step 4: Run the TestProof script
echo "🧪 Running proof verification..."
ARRAY_VERIFIER_ENTRY=$ARRAY_VERIFIER_ENTRY PROOF_HEX=$PROOF_HEX forge script script/TestProof.s.sol:TestProofScript --rpc-url local
