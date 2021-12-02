const TrodlIDO = artifacts.require("TrodlIDO");

module.exports = function (deployer, networks, accounts) {
  deployer.deploy(TrodlIDO);
};
