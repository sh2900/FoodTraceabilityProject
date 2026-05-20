const FoodTraceability = artifacts.require("FoodTraceability");

module.exports = function (deployer) {
  deployer.deploy(FoodTraceability);
};