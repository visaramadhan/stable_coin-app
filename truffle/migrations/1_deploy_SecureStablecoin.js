const SecureStablecoin = artifacts.require("SecureStablecoin");

module.exports = function (deployer) {
  deployer.deploy(SecureStablecoin); 
};