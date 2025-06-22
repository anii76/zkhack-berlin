// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

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
    ) public view returns (bool) {
        bytes32[] memory publicInputs = new bytes32[](128);
        for (uint256 i = 0; i < 128; i++) {
            publicInputs[i] = faceEncoding[i];
        }
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

    function getAddress(bytes32 salt, address owner, bytes32[128] memory faceEncoding) external view returns (address) {
        bytes memory bytecode = getBytecode(owner, faceEncoding);
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode))
        );
        return address(uint160(uint256(hash)));
    }

    function deploy(bytes32 salt, address owner, bytes32[128] memory faceEncoding) external payable returns (address addr) {
        bytes memory bytecode = getBytecode(owner, faceEncoding);
        assembly {
            addr := create2(callvalue(), add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        emit Deployed(addr);
    }

    function getBytecode(address owner, bytes32[128] memory faceEncoding) public pure returns (bytes memory) {
        return abi.encodePacked(
            type(ZFace).creationCode,
            abi.encode(owner, faceEncoding)
        );
    }
}
