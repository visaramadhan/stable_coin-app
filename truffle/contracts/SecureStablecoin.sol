// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SecureStablecoin is ERC20, Ownable {
    mapping(address => bytes32) private hashedBalanceSHA512;
    mapping(address => bytes32) private hashedBalanceBLAKE3;
    mapping(address => bytes) private hashedBalanceCombined;

    event HashedTransfer(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        bytes hashValue,
        string hashType
    );

    constructor() ERC20("Secure Stablecoin", "SUSD") Ownable() {
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function hashSHA512(string memory data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("SHA512", data));
    }

    function hashBLAKE3(string memory data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("BLAKE3", data));
    }

    function transferWithSHA512Hash(address recipient, uint256 amount, bytes32 hash) public {
        _transfer(msg.sender, recipient, amount);
        hashedBalanceSHA512[recipient] = hash;
        emit HashedTransfer(msg.sender, recipient, amount, abi.encodePacked(hash), "SHA-512");
    }

    function transferWithBLAKE3Hash(address recipient, uint256 amount, bytes32 hash) public {
        _transfer(msg.sender, recipient, amount);
        hashedBalanceBLAKE3[recipient] = hash;
        emit HashedTransfer(msg.sender, recipient, amount, abi.encodePacked(hash), "BLAKE3");
    }

    function transferWithCombinedHash(address recipient, uint256 amount, bytes calldata combinedHash) public {
        require(combinedHash.length == 96, "Combined hash must be 96 bytes (64+32)");
        _transfer(msg.sender, recipient, amount);
        hashedBalanceCombined[recipient] = combinedHash;
        emit HashedTransfer(msg.sender, recipient, amount, combinedHash, "SHA512+BLAKE3");
    }

    function getSHA512Hash(address account) public view returns (bytes32) {
        return hashedBalanceSHA512[account];
    }

    function getBLAKE3Hash(address account) public view returns (bytes32) {
        return hashedBalanceBLAKE3[account];
    }

    function getCombinedHash(address account) public view returns (bytes memory) {
        return hashedBalanceCombined[account];
    }
}
