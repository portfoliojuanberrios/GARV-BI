const DIDDocument = artifacts.require("DIDDocument");
const SensitiveDataStorage = artifacts.require("SensitiveDataStorage");
const truffleAssert = require('truffle-assertions');
const assert = require('assert');

contract("DIDDocument and SensitiveDataStorage", (accounts) => {
  const issuer = accounts[0];
  const nonIssuer = accounts[1];

  // Common variables
  const did = "did:example:123456789abcdefghi";
  const nonExistentDID = "did:example:nonexistent";

  // Variables for DIDDocument tests
  const publicKey = "PublicKeyExample";
  const controller = "ControllerExample";
  const verificationMethod = "VerificationMethodExample";

  const updatedPublicKey = "UpdatedPublicKeyExample";
  const updatedController = "UpdatedControllerExample";
  const updatedVerificationMethod = "UpdatedVerificationMethodExample";

  // Variables for SensitiveDataStorage tests
  const name = "Alice";
  const email = "alice@example.com";
  const dateOfBirth = "1990-01-01";
  const phoneNumber = "+1234567890";
  const nationality = "Wonderland";

  const updatedName = "Alice Smith";
  const updatedEmail = "alice.smith@example.com";
  const updatedDateOfBirth = "1990-02-02";
  const updatedPhoneNumber = "+0987654321";
  const updatedNationality = "Wonderland";

  const credentialHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const updatedCredentialHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

  let didDocumentInstance;
  let sensitiveDataStorageInstance;

  beforeEach(async () => {
    // Deploy DIDDocument and SensitiveDataStorage contracts
    didDocumentInstance = await DIDDocument.new({ from: issuer });
    sensitiveDataStorageInstance = await SensitiveDataStorage.new(didDocumentInstance.address, { from: issuer });

    // Register the DID in DIDDocument for testing
    await didDocumentInstance.createDID(
      did,
      publicKey,
      controller,
      verificationMethod,
      { from: issuer }
    );
  });

  describe("DIDDocument Tests", () => {
    it("should allow the issuer to create a new DID Document", async () => {
      // Use a new DID for this test
      const newDID = "did:example:newDID";
      const tx = await didDocumentInstance.createDID(
        newDID,
        publicKey,
        controller,
        verificationMethod,
        { from: issuer }
      );

      // Verify the event emission
      truffleAssert.eventEmitted(tx, 'DIDCreated', (ev) => {
        return ev.did === newDID && ev.publicKey === publicKey;
      });

      // Retrieve and verify the DID Document
      const result = await didDocumentInstance.getDIDDocument(newDID);
      assert.strictEqual(result[0], newDID, "The DID should match");
      assert.strictEqual(result[1], publicKey, "The public key should match");
      assert.strictEqual(result[2], controller, "The controller should match");
      assert.strictEqual(result[3], verificationMethod, "The verification method should match");
    });

    it("should prevent creating a DID Document that already exists", async () => {
      await truffleAssert.reverts(
        didDocumentInstance.createDID(
          did,
          publicKey,
          controller,
          verificationMethod,
          { from: issuer }
        ),
        "DID already exists"
      );
    });

    it("should allow the issuer to update an existing DID Document", async () => {
      const tx = await didDocumentInstance.updateDID(
        did,
        updatedPublicKey,
        updatedController,
        updatedVerificationMethod,
        { from: issuer }
      );

      // Verify the event emission
      truffleAssert.eventEmitted(tx, 'DIDUpdated', (ev) => {
        return ev.did === did && ev.publicKey === updatedPublicKey;
      });

      // Retrieve and verify the updated DID Document
      const result = await didDocumentInstance.getDIDDocument(did);
      assert.strictEqual(result[0], did, "The DID should match");
      assert.strictEqual(result[1], updatedPublicKey, "The public key should be updated");
      assert.strictEqual(result[2], updatedController, "The controller should be updated");
      assert.strictEqual(result[3], updatedVerificationMethod, "The verification method should be updated");
    });

    it("should prevent updating a non-existent DID Document", async () => {
      await truffleAssert.reverts(
        didDocumentInstance.updateDID(
          nonExistentDID,
          updatedPublicKey,
          updatedController,
          updatedVerificationMethod,
          { from: issuer }
        ),
        "DID does not exist"
      );
    });

    it("should prevent a non-issuer from creating a DID Document", async () => {
      await truffleAssert.reverts(
        didDocumentInstance.createDID(
          "did:example:anotherDID",
          publicKey,
          controller,
          verificationMethod,
          { from: nonIssuer }
        ),
        "Only the issuer can perform this action"
      );
    });

    it("should prevent a non-issuer from updating a DID Document", async () => {
      await truffleAssert.reverts(
        didDocumentInstance.updateDID(
          did,
          updatedPublicKey,
          updatedController,
          updatedVerificationMethod,
          { from: nonIssuer }
        ),
        "Only the issuer can perform this action"
      );
    });

    it("should retrieve an existing DID Document", async () => {
      const result = await didDocumentInstance.getDIDDocument(did);
      assert.strictEqual(result[0], did, "The DID should match");
      assert.strictEqual(result[1], publicKey, "The public key should match");
      assert.strictEqual(result[2], controller, "The controller should match");
      assert.strictEqual(result[3], verificationMethod, "The verification method should match");
    });

    it("should prevent retrieving a non-existent DID Document", async () => {
      await truffleAssert.reverts(
        didDocumentInstance.getDIDDocument(nonExistentDID),
        "DID does not exist"
      );
    });
  });

  describe("SensitiveDataStorage Tests", () => {
    it("should allow the issuer to set sensitive data for an existing DID", async () => {
      const tx = await sensitiveDataStorageInstance.setSensitiveData(
        did,
        name,
        email,
        dateOfBirth,
        phoneNumber,
        nationality,
        '0x0000000000000000000000000000000000000000000000000000000000000000', // Empty credential hash
        { from: issuer }
      );

      truffleAssert.eventEmitted(tx, 'SensitiveDataUpdated', (ev) => {
        return ev.did === did && ev.name === name && ev.email === email;
      });

      const result = await sensitiveDataStorageInstance.getSensitiveData(did);
      assert.strictEqual(result[0], name, "The name should match");
      assert.strictEqual(result[1], email, "The email should match");
      assert.strictEqual(result[2], dateOfBirth, "The date of birth should match");
      assert.strictEqual(result[3], phoneNumber, "The phone number should match");
      assert.strictEqual(result[4], nationality, "The nationality should match");
      assert.strictEqual(result[5], '0x0000000000000000000000000000000000000000000000000000000000000000', "The credential hash should be empty");
    });

    it("should prevent setting data for a non-existent DID", async () => {
      await truffleAssert.reverts(
        sensitiveDataStorageInstance.setSensitiveData(
          nonExistentDID,
          name,
          email,
          dateOfBirth,
          phoneNumber,
          nationality,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          { from: issuer }
        ),
        "DID does not exist in DIDDocument"
      );
    });

    it("should allow the issuer to update sensitive data for an existing DID", async () => {
      await sensitiveDataStorageInstance.setSensitiveData(
        did,
        name,
        email,
        dateOfBirth,
        phoneNumber,
        nationality,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        { from: issuer }
      );

      const tx = await sensitiveDataStorageInstance.setSensitiveData(
        did,
        updatedName,
        updatedEmail,
        updatedDateOfBirth,
        updatedPhoneNumber,
        updatedNationality,
        credentialHash,
        { from: issuer }
      );

      truffleAssert.eventEmitted(tx, 'SensitiveDataUpdated', (ev) => {
        return ev.did === did && ev.name === updatedName && ev.email === updatedEmail;
      });

      const result = await sensitiveDataStorageInstance.getSensitiveData(did);
      assert.strictEqual(result[0], updatedName, "The name should be updated");
      assert.strictEqual(result[1], updatedEmail, "The email should be updated");
      assert.strictEqual(result[2], updatedDateOfBirth, "The date of birth should be updated");
      assert.strictEqual(result[3], updatedPhoneNumber, "The phone number should be updated");
      assert.strictEqual(result[4], updatedNationality, "The nationality should be updated");
      assert.strictEqual(result[5], credentialHash, "The credential hash should be updated");
    });

    it("should allow the issuer to update the credential hash separately", async () => {
      await sensitiveDataStorageInstance.setSensitiveData(
        did,
        name,
        email,
        dateOfBirth,
        phoneNumber,
        nationality,
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        { from: issuer }
      );

      const tx = await sensitiveDataStorageInstance.updateCredentialHash(
        did,
        credentialHash,
        { from: issuer }
      );

      truffleAssert.eventEmitted(tx, 'CredentialHashUpdated', (ev) => {
        return ev.did === did && ev.newCredentialHash === credentialHash;
      });

      const result = await sensitiveDataStorageInstance.getSensitiveData(did);
      assert.strictEqual(result[5], credentialHash, "The credential hash should be updated");
    });

    it("should prevent a non-issuer from setting sensitive data", async () => {
      await truffleAssert.reverts(
        sensitiveDataStorageInstance.setSensitiveData(
          did,
          name,
          email,
          dateOfBirth,
          phoneNumber,
          nationality,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          { from: nonIssuer }
        ),
        "Only the issuer can perform this action"
      );
    });

    it("should retrieve sensitive data for an existing DID", async () => {
      await sensitiveDataStorageInstance.setSensitiveData(
        did,
        name,
        email,
        dateOfBirth,
        phoneNumber,
        nationality,
        credentialHash,
        { from: issuer }
      );

      const result = await sensitiveDataStorageInstance.getSensitiveData(did);
      assert.strictEqual(result[0], name, "The name should match");
      assert.strictEqual(result[1], email, "The email should match");
      assert.strictEqual(result[2], dateOfBirth, "The date of birth should match");
      assert.strictEqual(result[3], phoneNumber, "The phone number should match");
      assert.strictEqual(result[4], nationality, "The nationality should match");
      assert.strictEqual(result[5], credentialHash, "The credential hash should match");
    });

    it("should prevent retrieving data for a DID with no stored data", async () => {
      await truffleAssert.reverts(
        sensitiveDataStorageInstance.getSensitiveData(nonExistentDID),
        "No sensitive data found for this DID"
      );
    });
  });
});
