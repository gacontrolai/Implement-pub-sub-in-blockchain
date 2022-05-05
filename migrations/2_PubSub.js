const PubSub = artifacts.require("PubSub");

module.exports = function (deployer) {
  deployer.deploy(PubSub);
};
