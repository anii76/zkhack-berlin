// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {HonkVerifier} from "../contracts/Verifier.sol";
import {ArrayVerifierEntry} from "../contracts/ArrayVerifierEntry.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the HonkVerifier contract
        HonkVerifier verifier = new HonkVerifier();
        console.log("HonkVerifier deployed at:", address(verifier));

        // Deploy the ArrayVerifierEntry contract with the verifier address
        ArrayVerifierEntry entry = new ArrayVerifierEntry(address(verifier));
        console.log("ArrayVerifierEntry deployed at:", address(entry));

        vm.stopBroadcast();
    }
}