// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.20;

interface IVerifyProofAggregation {
    function verifyProofAggregation(
        uint256 _domainId,
        uint256 _aggregationId,
        bytes32 _leaf,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) external view returns (bool);
}

contract ProofVerifier {
    bytes32 public constant PROVING_SYSTEM_ID = keccak256(abi.encodePacked("ultraplonk"));
    bytes32 public constant VERSION_HASH = sha256(abi.encodePacked(""));

    // zkVerify contract
    address public zkVerify;

    // vkey for our circuit
    bytes32 public vkey;

    constructor(address _zkVerify, bytes32 _vkey) {
        zkVerify = _zkVerify;
        vkey = _vkey;
    }

    function checkHash(
        bytes32 _hash,
        uint256 _aggregationId,
        uint256 _domainId,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(PROVING_SYSTEM_ID, vkey, VERSION_HASH, keccak256(abi.encodePacked(_hash))));

        return IVerifyProofAggregation(zkVerify).verifyProofAggregation(
            _domainId,
            _aggregationId,
            leaf,
            _merklePath,
            _leafCount,
            _index
        );
    }
} 