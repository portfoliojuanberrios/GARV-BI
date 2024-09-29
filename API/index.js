const express = require('express');
const Web3 = require('web3');
const axios = require('axios');
const multer = require('multer'); // For handling file uploads
const FormData = require('form-data'); // To handle multipart form-data
const crypto = require('crypto');
const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());

// Contract configuration
const contractAddresses = require('./contractAddresses.json');

// Configure Web3 for private and public networks
const web3Private = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8546')); // Private network
const web3Public = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545')); // Public network

// Load contract ABIs
const DIDDocumentJSON = require('../Private-zkEVM/build/contracts/DIDDocument.json');
const SensitiveDataStorageJSON = require('../Private-zkEVM/build/contracts/SensitiveDataStorage.json');
const PublicCredentialJSON = require('../Public-zkEVM/build/contracts/PublicCredential.json');

// Initialize contracts
const didDocumentContract = new web3Private.eth.Contract(DIDDocumentJSON.abi, contractAddresses.DIDDocumentAddress);
const sensitiveDataStorageContract = new web3Private.eth.Contract(SensitiveDataStorageJSON.abi, contractAddresses.SensitiveDataStorageAddress);
const publicCredentialContract = new web3Public.eth.Contract(PublicCredentialJSON.abi, contractAddresses.PublicCredentialAddress);



// Middleware to handle JSON
app.use(express.json());

// Multer middleware for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// AES-256 encryption function
const encryptionKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encryptData(data) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

// AES-256 decryption function
function decryptData(encryptedData) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
    let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// ----------- Endpoint to upload file to IPFS -----------

app.post('/upload-ipfs', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            console.error("No file received");
            return res.status(400).send('No file received');
        }

        console.log("File received:", req.file.originalname);

        // Prepare form-data for the file upload
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // Use Axios to post the file to IPFS API
        const response = await axios.post('http://localhost:5001/api/v0/add', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        console.log("File uploaded to IPFS with hash:", response.data.Hash);

        // Send the IPFS hash as a response
        res.json({
            message: 'File uploaded to IPFS successfully!',
            ipfsHash: response.data.Hash
        });
    } catch (error) {
        console.error("Error uploading file to IPFS:", error);
        res.status(500).json({ error: 'Error uploading file to IPFS', details: error.message });
    }
});

app.get('/retrieve-ipfs/:hash', async (req, res) => {
    const { hash } = req.params;

    try {
        // Construct the local IPFS gateway URL
        const ipfsUrl = `http://localhost:8080/ipfs/${hash}`;
        
        // Use Axios to fetch the file from your local IPFS node
        const response = await axios.get(ipfsUrl, {
            responseType: 'arraybuffer', // Retrieve binary data (files)
        });

        // Send the file back to the client
        res.setHeader('Content-Type', response.headers['content-type']);
        res.send(response.data);
        
    } catch (error) {
        console.error("Error retrieving file from IPFS:", error);
        res.status(500).json({ error: 'Error retrieving file from IPFS', details: error.message });
    }
});
// ----------- Endpoint to register a DID in DIDDocument -----------

app.post('/register-did', async (req, res) => {
    const { did, publicKey, controller, verificationMethod } = req.body;

    try {
        console.log("Data to register DID:", { did, publicKey, controller, verificationMethod });

        const accounts = await web3Private.eth.getAccounts();
        console.log("Account used for transaction:", accounts[0]);

        const receipt = await didDocumentContract.methods.createDID(did, publicKey, controller, verificationMethod)
            .send({ from: accounts[0], gas: 500000 });

        console.log("Transaction completed, receipt:", receipt);

        res.json({ message: 'DID registered successfully', receipt });
    } catch (error) {
        console.error("Error registering DID:", error);
        res.status(400).json({ error: error.message });
    }
});

// Register a new student (DID and Sensitive Data)
app.post('/register-student', async (req, res) => {
    const { did, name, email, dateOfBirth, phoneNumber, nationality } = req.body;

    try {
        const accounts = await web3Private.eth.getAccounts();
        const account = accounts[0]; // Use the first available account

        let didToUse = did;

        // If DID is not provided, generate a new DID and register it in DIDDocument
        if (!did) {
            didToUse = `did:example:${crypto.randomBytes(8).toString('hex')}`;
            // Register the DID in DIDDocument contract
            const didReceipt = await didDocumentContract.methods.createDID(didToUse, account, account, "ECDSA")
                .send({ from: account, gas: 500000 });
            console.log("Generated DID registered:", didReceipt.transactionHash);
        }

        // Store sensitive data in the SensitiveDataStorage contract
        const sensitiveDataReceipt = await sensitiveDataStorageContract.methods.setSensitiveData(
            didToUse, name, email, dateOfBirth, phoneNumber, nationality, "0x0000000000000000000000000000000000000000000000000000000000000000" // Credential hash is empty
        ).send({ from: account, gas: 500000 });

        console.log("Sensitive data registered:", sensitiveDataReceipt.transactionHash);

        res.json({
            message: "Student registered successfully.",
            did: didToUse,
            sensitiveDataTransactionHash: sensitiveDataReceipt.transactionHash
        });
    } catch (error) {
        console.error("Error registering student:", error);
        res.status(500).json({ error: 'Error registering student', details: error.message });
    }
});
// Endpoint to retrieve student data by DID
app.get('/get-student/:did', async (req, res) => {
    const { did } = req.params;

    try {
        const studentData = await sensitiveDataStorageContract.methods.getSensitiveData(did).call();
        
        res.json({
            did: did,
            name: studentData[0],
            email: studentData[1],
            dateOfBirth: studentData[2],
            phoneNumber: studentData[3],
            nationality: studentData[4],
            credentialHash: studentData[5] || "No credential assigned"
        });
    } catch (error) {
        console.error('Error retrieving student data:', error);
        res.status(500).json({ error: 'Error retrieving student data', details: error.message });
    }
});


// Endpoint to assign a credential to an existing student
app.post('/assign-credential', async (req, res) => {
    const { did, credentialHash } = req.body;

    try {
        // Get available accounts from Ganache
        const accounts = await web3Private.eth.getAccounts();
        
        // Get the current student data from the contract
        const studentData = await sensitiveDataStorageContract.methods.getSensitiveData(did).call();
        const { name, email, dateOfBirth, phoneNumber, nationality } = studentData;

        // Update the credential hash, keeping other fields the same
        const receipt = await sensitiveDataStorageContract.methods.setSensitiveData(
            did,
            name,
            email,
            dateOfBirth,
            phoneNumber,
            nationality,
            credentialHash
        ).send({ from: accounts[0], gas: 500000 });

        res.json({
            message: 'Credential assigned successfully',
            did: did,
            credentialHash: credentialHash,
            transactionHash: receipt.transactionHash
        });
    } catch (error) {
        console.error('Error assigning credential:', error);
        res.status(500).json({ error: 'Error assigning credential', details: error.message });
    }
});

// ----------- Endpoint to issue credentials on Ethereum -----------

app.post("/issue-credential", async (req, res) => {
    const { studentName, courseName, issueDate, courseId, institutionName, institutionSignature, studentDID } = req.body;

    try {
        const accounts = await web3Public.eth.getAccounts();

        // Encrypt sensitive data before sending to blockchain
        const encryptedStudentName = encryptData(studentName);
        const encryptedCourseName = encryptData(courseName);
        const encryptedInstitutionSignature = encryptData(institutionSignature);

        // Generate credential hash
        const hashId = web3Public.utils.soliditySha3(
            { type: 'string', value: encryptedStudentName },
            { type: 'string', value: encryptedCourseName },
            { type: 'string', value: issueDate },
            { type: 'string', value: courseId },
            { type: 'string', value: institutionName },
            { type: 'string', value: encryptedInstitutionSignature },
            { type: 'string', value: studentDID }
        );

        // Issue the credential
        const receipt = await publicCredentialContract.methods.issueCredential(
            encryptedStudentName, encryptedCourseName, issueDate, courseId, institutionName, encryptedInstitutionSignature, studentDID
        ).send({ from: accounts[0], gas: 3000000 });

        console.log("Credential issued successfully, receipt:", receipt);

        res.json({
            message: "Credential issued on Ethereum with encryption!",
            hashId: hashId
        });
    } catch (error) {
        console.error("Error issuing the credential:", error);
        res.status(500).send("Error issuing the credential");
    }
});

// ----------- Endpoint to revoke credentials -----------

app.post("/revoke-credential", async (req, res) => {
    const { hashId } = req.body;

    try {
        const accounts = await web3Public.eth.getAccounts();

        // Revoke the credential based on the hash
        const receipt = await publicCredentialContract.methods.revokeCredential(hashId).send({ from: accounts[0], gas: 3000000 });

        console.log("Credential revoked successfully, receipt:", receipt);

        res.json({
            message: "Credential revoked on Ethereum",
            hashId: hashId
        });
    } catch (error) {
        console.error("Error revoking the credential:", error);
        res.status(500).send("Error revoking the credential");
    }
});

// ----------- Endpoint to verify credentials -----------

app.get("/verify-credential/:hashId", async (req, res) => {
    const { hashId } = req.params;

    try {
        // Verify the credential based on the hash
        const credential = await publicCredentialContract.methods.verifyCredential(hashId).call();

        console.log("Credential verified:", credential);

        // Decrypt the sensitive data
        const decryptedStudentName = decryptData(credential[0]);
        const decryptedCourseName = decryptData(credential[1]);
        const decryptedInstitutionSignature = decryptData(credential[5]);

        res.json({
            studentName: decryptedStudentName,
            courseName: decryptedCourseName,
            issueDate: credential[2],
            courseId: credential[3],
            institutionName: credential[4],
            institutionSignature: decryptedInstitutionSignature,
            studentDID: credential[6],
            revoked: credential[7],
            hashId: hashId
        });
    } catch (error) {
        console.error("Error verifying the credential:", error);
        res.status(500).send("Error verifying the credential");
    }
});

// ----------- Start the server -----------

app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
});
