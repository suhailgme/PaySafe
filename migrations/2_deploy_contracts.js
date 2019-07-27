var PaySafe = artifacts.require("./PaySafe.sol");

module.exports = function(deployer) {
  deployer.deploy(PaySafe);
};
