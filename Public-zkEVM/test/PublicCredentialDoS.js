const PublicCredential = artifacts.require("PublicCredential");

contract("PublicCredential", (accounts) => {
    let instance;
    const studentName = "Juan Berrios";
    const courseName = "Master of Applied Information Technology";
    const issueDate = "2024-09-09";
    const courseId = "MAIT123";
    const institutionName = "Victoria University";
    const institutionSignature = "SignatureOfInstitution";
    const studentDID = "did:example:123456789abcdefghi";
    let hashId;

    // Before the tests, issue the credential
    before(async () => {
        instance = await PublicCredential.deployed();
        hashId = web3.utils.soliditySha3(
            studentName, courseName, issueDate, courseId, institutionName, institutionSignature, studentDID
        );
        // Issue the credential before running tests
        await instance.issueCredential(
            studentName, courseName, issueDate, courseId, institutionName, institutionSignature, studentDID,
            { from: accounts[0] }
        );
    });

    it("should verify credentials with increasing load and measure processing time", async () => {
        const maxRequests = 1000;  // Maximum number of simultaneous requests
        const increment = 10;  // Increment of requests at each step
        let batchSize = increment;
        
        while (batchSize <= maxRequests) {
            console.log(`Testing with ${batchSize} simultaneous requests...`);

            // Create an array of promises for verification requests
            const promises = [];
            const startTime = new Date().getTime();  // Start time

            for (let i = 0; i < batchSize; i++) {
                promises.push(instance.verifyCredential(hashId));
            }

            try {
                // Execute all verifications simultaneously
                await Promise.all(promises);
            } catch (error) {
                // If the system crashes, catch the error
                console.log(`System crashed at ${batchSize} requests. Error: ${error.message}`);
                break;  // Stop the test if it fails
            }

            const endTime = new Date().getTime();  // End time
            const duration = endTime - startTime;  // Duration in milliseconds

            console.log(`Processed ${batchSize} requests in ${duration} ms`);

            // Increment the number of requests for the next batch
            batchSize += increment;
        }
    });
});
