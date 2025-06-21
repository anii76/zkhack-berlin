// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EphemeralWallet {
    address public owner;

    constructor(address _owner) payable {
        owner = _owner;
    }

    receive() external payable {}

    function withdraw(address payable to) external {
        require(msg.sender == owner, "Not authorized");
        selfdestruct(to);
    }
}

contract Deployer {
    event Deployed(address addr);

    function getAddress(bytes32 salt, address owner) external view returns (address) {
        bytes memory bytecode = getBytecode(owner);
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode))
        );
        return address(uint160(uint256(hash)));
    }

    function deploy(bytes32 salt, address owner) external payable returns (address addr) {
        bytes memory bytecode = getBytecode(owner);
        assembly {
            addr := create2(callvalue(), add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        emit Deployed(addr);
    }

    function getBytecode(address owner) public pure returns (bytes memory) {
        return abi.encodePacked(
            type(EphemeralWallet).creationCode,
            abi.encode(owner)
        );
    }
}
