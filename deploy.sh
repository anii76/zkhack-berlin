#!/bin/bash

# Load environment variables
source .env

# Default to local network if not specified
NETWORK=${1:-local}

echo "🚀 Deploying to $NETWORK..."

# Run the deployment script
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url $NETWORK \
    --broadcast \
    --verify \
    -vvvv

echo "✅ Deployment complete!"