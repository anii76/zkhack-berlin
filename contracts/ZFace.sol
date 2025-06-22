// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import {HonkVerifier} from "../noir/target/zface_verifier.sol";

contract ZFace {
    HonkVerifier public verifier;
    bytes32[128] faceEncoding;
    bytes32 threshold;

    constructor(address _verifier, bytes32[128] memory _faceEncoding, bytes32 _threshold) payable {
        verifier = HonkVerifier(_verifier);
        faceEncoding = _faceEncoding;
        threshold = _threshold;
    }

    function verify(
        bytes calldata proof
    ) public view returns (bool) {
        // Public inputs: 128 face encoding values + 1 threshold
        bytes32[] memory publicInputs = new bytes32[](129);
        for (uint256 i = 0; i < 128; i++) {
            publicInputs[i] = faceEncoding[i];
        }
        publicInputs[128] = threshold;
        
        bool result = verifier.verify(proof, publicInputs);
        return result;
    }
    
    receive() external payable {}

    function withdraw(address payable to, bytes calldata proof) external {
        require(verify(proof), "Not authorized"); // require reciever to prove identity using face 
        selfdestruct(to);
    }
}


contract Deployer {
    event Deployed(address addr);

    function getAddress(bytes32 salt, address owner, bytes32[128] memory faceEncoding, bytes32 threshold) external view returns (address) {
        bytes memory bytecode = getBytecode(owner, faceEncoding, threshold);
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode))
        );
        return address(uint160(uint256(hash)));
    }

    function deploy(bytes32 salt, address owner, bytes32[128] memory faceEncoding, bytes32 threshold) external payable returns (address addr) {
        bytes memory bytecode = getBytecode(owner, faceEncoding, threshold);
        assembly {
            addr := create2(callvalue(), add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        emit Deployed(addr);
    }

    function getBytecode(address owner, bytes32[128] memory faceEncoding, bytes32 threshold) public pure returns (bytes memory) {
        return abi.encodePacked(
            type(ZFace).creationCode,
            abi.encode(owner, faceEncoding, threshold)
        );
    }
}