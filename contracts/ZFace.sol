// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import {HonkVerifier} from "../noir/target/my_noir.sol";

contract ZFace {
    HonkVerifier public verifier;
    bytes32[128] public faceEncoding;

    constructor(address _verifier, bytes32[128] memory _faceEncoding) {
        verifier = HonkVerifier(_verifier);
        faceEncoding = _faceEncoding;
    }

    function verify(
        bytes calldata proof
    ) external view returns (bool) {
        bytes32[] memory publicInputs = new bytes32[](128);
        for (uint256 i = 0; i < 128; i++) {
            publicInputs[i] = faceEncoding[i];
        }
        bool result = verifier.verify(proof, publicInputs);
        return result;
    }
}
