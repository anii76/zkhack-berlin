// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import {HonkVerifier} from "../noir/target/zface_verifier.sol";

contract ZFace {
    HonkVerifier public verifier;
    bytes32[128] public faceEncoding;
    bytes32 public threshold;

    constructor(address _verifier, bytes32[128] memory _faceEncoding, bytes32 _threshold) {
        verifier = HonkVerifier(_verifier);
        faceEncoding = _faceEncoding;
        threshold = _threshold;
    }

    function verify(
        bytes calldata proof
    ) external view returns (bool) {
        // Public inputs: 128 face encoding values + 1 threshold
        bytes32[] memory publicInputs = new bytes32[](129);
        for (uint256 i = 0; i < 128; i++) {
            publicInputs[i] = faceEncoding[i];
        }
        publicInputs[128] = threshold;
        
        bool result = verifier.verify(proof, publicInputs);
        return result;
    }
}
