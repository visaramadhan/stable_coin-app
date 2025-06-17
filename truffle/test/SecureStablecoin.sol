// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecureStablecoin {
    string public name = "Secure Stablecoin";
    string public symbol = "SUSD";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    mapping(address => bytes32) private hashedBalanceSHA512;
    mapping(address => bytes32) private hashedBalanceBLAKE3;
    mapping(address => bytes) private hashedBalanceCombined;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event HashedTransfer(address indexed sender, address indexed recipient, uint256 amount, bytes hashValue, string hashType);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        uint256 initialSupply = 1_000_000 * (10 ** decimals);
        balanceOf[owner] = initialSupply;
        totalSupply = initialSupply;
        emit Transfer(address(0), owner, initialSupply);
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] >= value, "Balance too low");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "Balance too low");
        require(allowance[from][msg.sender] >= value, "Allowance too low");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 value) external onlyOwner {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function hashSHA512(string memory data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("SHA512", data));
    }

    function hashBLAKE3(string memory data) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("BLAKE3", data));
    }

    function transferWithSHA512Hash(address recipient, uint256 amount, bytes32 hash) external {
        require(transfer(recipient, amount), "Transfer failed");
        hashedBalanceSHA512[recipient] = hash;
        emit HashedTransfer(msg.sender, recipient, amount, abi.encodePacked(hash), "SHA-512");
    }

    function transferWithBLAKE3Hash(address recipient, uint256 amount, bytes32 hash) external {
        require(transfer(recipient, amount), "Transfer failed");
        hashedBalanceBLAKE3[recipient] = hash;
        emit HashedTransfer(msg.sender, recipient, amount, abi.encodePacked(hash), "BLAKE3");
    }

    function transferWithCombinedHash(address recipient, uint256 amount, bytes calldata combinedHash) external {
        require(combinedHash.length == 96, "Combined hash must be 96 bytes (64+32)");
        require(transfer(recipient, amount), "Transfer failed");
        hashedBalanceCombined[recipient] = combinedHash;
        emit HashedTransfer(msg.sender, recipient, amount, combinedHash, "SHA512+BLAKE3");
    }

    function getSHA512Hash(address account) external view returns (bytes32) {
        return hashedBalanceSHA512[account];
    }

    function getBLAKE3Hash(address account) external view returns (bytes32) {
        return hashedBalanceBLAKE3[account];
    }

    function getCombinedHash(address account) external view returns (bytes memory) {
        return hashedBalanceCombined[account];
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }
}
