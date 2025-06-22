import "hardhat/types/config";
import "hardhat/types/runtime";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: typeof import("ethers");
    noir: {
      getCircuit(name: string): Promise<{
        noir: {
          execute(input: any): Promise<{ witness: Uint8Array }>;
        };
        backend: {
          generateProof(witness: Uint8Array, options?: { keccak?: boolean }): Promise<{
            proof: Uint8Array;
            publicInputs: string[];
          }>;
          verifyProof(
            data: {
              proof: Uint8Array;
              publicInputs: string[];
            },
            options?: { keccak?: boolean }
          ): Promise<boolean>;
        };
      }>;
    };
  }
}