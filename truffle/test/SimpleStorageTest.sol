// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../contracts/SecureStablecoin.sol";
// These files are dynamically created at test time
import "truffle/Assert.sol";
// import "truffle/DeployedAddresses.sol";

contract SimpleStorageTest {

  function testWriteValue() public {
    SecureStablecoin secureStablecoin = new SecureStablecoin();

    Assert.equal(secureStablecoin.read(), 0, "Contract should have 0 stored");
    secureStablecoin.write(1);
    Assert.equal(secureStablecoin.read(), 1, "Contract should have 1 stored");
    secureStablecoin.write(2);
    Assert.equal(secureStablecoin.read(), 2, "Contract should have 2 stored");
  }
}
