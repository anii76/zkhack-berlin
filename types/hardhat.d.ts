import "hardhat/types/config";
import "hardhat/types/runtime";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    ethers: {
      getContractFactory: any;
      getContractAt: any;
      getSigner: any;
      getSigners: any;
      provider: any;
      keccak256: any;
      zeroPadValue: any;
      toBeHex: any;
    };
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