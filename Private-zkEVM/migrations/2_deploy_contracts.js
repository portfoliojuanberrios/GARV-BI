const DIDDocument = artifacts.require("DIDDocument");
const SensitiveDataStorage = artifacts.require("SensitiveDataStorage");

module.exports = async function (deployer) {
  await deployer.deploy(DIDDocument);
  const didDocumentInstance = await DIDDocument.deployed();
  await deployer.deploy(SensitiveDataStorage, didDocumentInstance.address);
  const sensitiveDataStorageInstance = await SensitiveDataStorage.deployed();
  console.log("DIDDocument deployed at address:", didDocumentInstance.address);
  console.log("SensitiveDataStorage deployed at address:", sensitiveDataStorageInstance.address);
};
