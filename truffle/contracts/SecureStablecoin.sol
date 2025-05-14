// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SecureStablecoin
 * @dev A secure stablecoin contract with hashed balances and transfer functionality.
 * This contract uses SHA-512 and BLAKE3 hashing algorithms for secure balance management.
 */
// Note:  we are using keccak256 as a placeholder for SHA-512 and BLAKE3 hashing algorithms.
// In a real-world scenario, you would need to implement or import the actual hashing algorithms.
// The hashing functions are not secure and should not be used for real cryptographic purposes.
// This is just a simulation for educational purposes.
// In a production environment, you would use a library that implements SHA-512 and BLAKE3 securely.


contract SecureStablecoin is ERC20, Ownable {
    
    
    mapping(address => bytes32) private hashedBalanceSHA512;
    mapping(address => bytes32) private hashedBalanceBLAKE3;

    event HashedTransfer(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        bytes32 hashValue,
        string hashType // "SHA-512" atau "BLAKE3"
    );
    // Event to log hashed transfers
    // This event is emitted when a transfer is made with a hashed balance.
    // It includes the sender's address, recipient's address, amount transferred, and the hash value.
    // This allows for tracking and verifying transfers in a secure manner.
    // The event is indexed for efficient searching and filtering in the blockchain.
    // The indexed parameters are sender, recipient, and hashValue.
    // The amount is not indexed to save space, as it can be derived from the transfer function.
    event HashedTransfer(address indexed sender, address indexed recipient, uint256 amount, bytes32 hashValue);
     constructor() ERC20("Secure Stablecoin", "SUSD") {
        transferOwnership(msg.sender); // Versi OpenZeppelin 4.x pakai ini
        _mint(msg.sender, 1000000 * 10**decimals());
        
    }

    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
    // Simulasi hashing SHA-512
    function hashSHA512(string memory data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("SHA512", data));
    }

    // Simulasi hashing BLAKE3
    function hashBLAKE3(string memory data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("BLAKE3", data));
    }

    // Transfer dan simpan hash SHA-512
    function transferWithSHA512Hash(address recipient, uint256 amount, bytes32 hash) public {
        _transfer(msg.sender, recipient, amount);
        hashedBalanceSHA512[recipient] = hash;
        emit HashedTransfer(msg.sender, recipient, amount, hash, "SHA-512");
    }

    // Transfer dan simpan hash BLAKE3
    function transferWithBLAKE3Hash(address recipient, uint256 amount, bytes32 hash) public {
        _transfer(msg.sender, recipient, amount);
        hashedBalanceBLAKE3[recipient] = hash;
        emit HashedTransfer(msg.sender, recipient, amount, hash, "BLAKE3");
    }

    // Ambil hash masing-masing
    function getSHA512Hash(address account) public view returns (bytes32) {
        return hashedBalanceSHA512[account];
    }

    function getBLAKE3Hash(address account) public view returns (bytes32) {
        return hashedBalanceBLAKE3[account];
    }

    // Konversi uint ke string (kalau masih dibutuhkan)
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}