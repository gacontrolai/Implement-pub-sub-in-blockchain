const PubSub = artifacts.require("PubSub");

module.exports = function async(deployer) {
	deployer.deploy(PubSub);
};
