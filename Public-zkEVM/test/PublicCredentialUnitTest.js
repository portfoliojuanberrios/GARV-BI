const PublicCredential = artifacts.require("PublicCredential");
contract("PublicCredential", (accounts) => {
    let instance;
    // Before each test, retrieve the deployed contract instance
    before(async () => {
        instance = await PublicCredential.deployed();
    });
    it("should issue a credential", async () => {
        // Test data for the credential
        const studentName = "Juan Berrios";
        const courseName = "Master of Applied Information Technology";
        const issueDate = "2024-09-09";
        const courseId = "MAIT123";
        const institutionName = "Victoria University";
        const institutionSignature = "SignatureOfInstitution";
        const studentDID = "did:example:123456789abcdefghi";
        // Generate the hash based on credential details
        const hashId = web3.utils.soliditySha3(
            studentName, courseName, issueDate, courseId, institutionName, institutionSignature, studentDID
        );
        // Call the contract to issue the credential
        await instance.issueCredential(
            studentName, courseName, issueDate, courseId, institutionName, institutionSignature, studentDID,
            { from: accounts[0] }
        );
        // Verify that the credential was issued correctly
        const credential = await instance.credentialsByHash(hashId);
        assert.equal(credential.studentName, studentName, "Student name does not match");
        assert.equal(credential.courseName, courseName, "Course name does not match");
        assert.equal(credential.issueDate, issueDate, "Issue date does not match");
        assert.equal(credential.revoked, false, "Credential should not be revoked");
    });
    it("should verify a credential", async () => {
        // Reuse the same data from the previous test
        const studentName = "Juan Berrios";
        const courseName = "Master of Applied Information Technology";
        const issueDate = "2024-09-09";
        const courseId = "MAIT123";
        const institutionName = "Victoria University";
        const institutionSignature = "SignatureOfInstitution";
        const studentDID = "did:example:123456789abcdefghi";
        // Generate the hash
        const hashId = web3.utils.soliditySha3(
            studentName, courseName, issueDate, courseId, institutionName, institutionSignature, studentDID
        );
        // Call the contract to verify the credential
        const credential = await instance.verifyCredential(hashId);
        // Verify the returned data
        assert.equal(credential[0], studentName, "Student name does not match");
        assert.equal(credential[1], courseName, "Course name does not match");
        assert.equal(credential[2], issueDate, "Issue date does not match");
        assert.equal(credential[7], false, "Credential should not be revoked");
    });
    it("should revoke a credential", async () => {
        // Reuse the same data from the previous tests
        const studentName = "Juan Berrios";
        const courseName = "Master of Applied Information Technology";
        const issueDate = "2024-09-09";
        const courseId = "MAIT123";
        const institutionName = "Victoria University";
        const institutionSignature = "SignatureOfInstitution";
        const studentDID = "did:example:123456789abcdefghi";
        // Generate the hash
        const hashId = web3.utils.soliditySha3(
            studentName, courseName, issueDate, courseId, institutionName, institutionSignature, studentDID
        );
        // Call the contract to revoke the credential
        await instance.revokeCredential(hashId, { from: accounts[0] });
        // Verify that the credential was revoked
        const credential = await instance.verifyCredential(hashId);
        assert.equal(credential[7], true, "Credential should be revoked");
    });
});
