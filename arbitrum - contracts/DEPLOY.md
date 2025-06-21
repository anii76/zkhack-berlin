# Deployment Guide

## Prerequisites

1. Install Foundry: https://book.getfoundry.sh/getting-started/installation
2. Install Noir: https://noir-lang.org/docs/getting_started/installation

## Setup

1. Copy `.env.example` to `.env` and fill in your configuration:
   ```bash
   cp .env.example .env
   ```

2. Add your private key and RPC URLs to the `.env` file

## Build

Generate the Solidity verifier contracts from your Noir circuit:

```bash
./build.sh
```

## Deploy

### Local deployment (Anvil)

1. Start a local Anvil node:
   ```bash
   anvil
   ```

2. In another terminal, deploy:
   ```bash
   ./deploy.sh local
   ```

### Testnet deployment

Deploy to Sepolia:
```bash
./deploy.sh sepolia
```

Deploy to other networks:
```bash
./deploy.sh mainnet
./deploy.sh arbitrum
./deploy.sh optimism
./deploy.sh polygon
```

## Manual deployment with Forge

```bash
# Deploy without verification
forge create contracts/Verifier.sol:HonkVerifier --rpc-url $RPC_URL --private-key $PRIVATE_KEY

# Deploy with verification
forge create contracts/Verifier.sol:HonkVerifier \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --verify

# Deploy ArrayVerifierEntry with verifier address
forge create contracts/ArrayVerifierEntry.sol:ArrayVerifierEntry \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args <VERIFIER_ADDRESS> \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --verify
```

## Verification

If contracts weren't verified during deployment:

```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> \
    --chain <CHAIN> \
    --etherscan-api-key $ETHERSCAN_API_KEY
```