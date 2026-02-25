const MetadataRegistry = artifacts.require("MetadataRegistry");
const GameAsset1155 = artifacts.require("GameAsset1155");

module.exports = async function (deployer) {
  await deployer.deploy(MetadataRegistry);
  const registry = await MetadataRegistry.deployed();

  await deployer.deploy(GameAsset1155, registry.address);
};
