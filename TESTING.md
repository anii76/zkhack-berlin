# Testing the ArrayVerifierEntry Contract

## Quick Test Flow

1. **Generate a proof with Barretenberg:**
   ```bash
   # Create input file
   echo 'array1 = ["20", "5", "92"]' > Prover.toml
   echo 'array2 = ["20", "5", "92"]' >> Prover.toml
   
   # Compile and generate witness
   nargo compile
   nargo execute
   
   # Generate proof with bb
   bb prove -b ./target/zface_cash.json -w ./target/witness.gz -o ./proofs/proof
   ```

2. **Deploy contracts locally:**
   ```bash
   # Start Anvil in one terminal
   anvil
   
   # Deploy in another terminal
   ./deploy.sh local
   ```

3. **Test with Cast (manual):**
   ```bash
   # Get the proof in hex format
   PROOF_HEX=$(xxd -p -c 10000 ./proofs/proof | tr -d '\n')
   
   # Call the contract (replace ADDRESS with deployed ArrayVerifierEntry address)
   cast call ADDRESS "verifyArraysMatch(bytes)" "0x$PROOF_HEX" --rpc-url localhost:8545
   ```

## Using the Test Script

Run the automated test script:
```bash
./test_proof.sh
```

## Foundry Tests

Run unit tests:
```bash
forge test
```

Run with verbosity:
```bash
forge test -vvv
```

## Expected Behavior

- If you provide a proof for arrays [20, 5, 92], verification should succeed (return true)
- If you provide a proof for different arrays, verification should fail (return false)
- The contract only accepts proofs that match the hardcoded target array [20, 5, 92]

## Troubleshooting

1. **"Proof verification failed"**: Make sure your Prover.toml has the correct values [20, 5, 92]
2. **"Contract not found"**: Deploy the contracts first with `./deploy.sh local`
3. **"Invalid proof format"**: Ensure the proof is properly hex-encoded with 0x prefix