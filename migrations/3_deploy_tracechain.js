const TraceChain = artifacts.require("TraceChain");

module.exports = function (deployer) {
  deployer.deploy(TraceChain);
};
