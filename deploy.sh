#!/bin/bash

# Load environment variables
source .env

# Default to local network if not specified
NETWORK=${1:-local}

echo "🚀 Deploying to $NETWORK..."

# Check if deploying locally
if [ "$NETWORK" = "local" ]; then
    # Local deployment without verification
    forge script script/Deploy.s.sol:DeployScript \
        --rpc-url $NETWORK \
        --broadcast \
        -vvvv
else
    # Other networks with verification
    forge script script/Deploy.s.sol:DeployScript \
        --rpc-url $NETWORK \
        --broadcast \
        --verify \
        -vvvv
fi

echo "✅ Deployment complete!"