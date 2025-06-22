# Array Verification ZK Proof System

## Overview
This project implements a zero-knowledge proof system that verifies two arrays of size 3 are identical.

## Components

1. **Noir Program** (`noir/main.nr`): Proves that two arrays are identical
2. **Solidity Verifier** (`noir/target/zface_verifier.sol`): On-chain verification contract
3. **Entry Contract** (`contracts/ZFace.sol`): Dapp logic, deployer contract and zface contract allowing the reciever to prove his identity and claim funds.

## Build Pipeline

### Compile and Generate Contracts
Run the build script whenever you modify `src/main.nr`:
```bash
./build.sh
```

This will:
1. Compile the Noir program
2. Generate the verification key
3. Create the Solidity verifier contract
4. Regenerate the entry contract

## Usage

### 1. Generate a proof that your array matches [20, 5, 92]

Create a file `Prover.toml` with your input array:
```toml
array1 = ["20", "5", "92"]
array2 = ["20", "5", "92"]
```

Generate the proof:
```bash
# Compile and generate witness
nargo compile
nargo execute

# Generate proof with Barretenberg
bb prove -b ./target/zFace.cash.json -w ./target/witness.gz -o ./proofs/proof
```