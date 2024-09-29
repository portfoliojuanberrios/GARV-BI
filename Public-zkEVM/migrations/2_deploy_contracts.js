const PublicCredential = artifacts.require("PublicCredential");

module.exports = function(deployer) {
  deployer.deploy(PublicCredential);
};
