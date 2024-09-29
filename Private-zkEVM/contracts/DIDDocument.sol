// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DIDDocument {

    // Structure to store the DID Document details
    struct DIDDocumentStruct {
        string did;
        string publicKey;
        string controller;           // The controller that can manage this DID
        string verificationMethod;   // Verification method for the DID
        bool exists;                 // Check if DID Document exists
    }

    // Mapping to associate DID with its corresponding DID Document
    mapping(string => DIDDocumentStruct) private didDocuments;

    address public issuer; // Address of the institution managing the DIDs

    // Events triggered when a new DID is created or updated
    event DIDCreated(string did, string publicKey);
    event DIDUpdated(string did, string publicKey);

    // Modifier to restrict functions to only the issuer
    modifier onlyIssuer() {
        require(msg.sender == issuer, "Only the issuer can perform this action");
        _;
    }

    // Constructor to set the authorized issuer
    constructor() {
        issuer = msg.sender;
    }

    /**
     * @dev Creates a new DID Document
     * @param did The unique DID identifier
     * @param publicKey The public key associated with the DID
     * @param controller The controller of the DID
     * @param verificationMethod The verification method for the DID
     */
    function createDID(
        string memory did,
        string memory publicKey,
        string memory controller,
        string memory verificationMethod
    ) public onlyIssuer {
        require(!didDocuments[did].exists, "DID already exists");

        didDocuments[did] = DIDDocumentStruct({
            did: did,
            publicKey: publicKey,
            controller: controller,
            verificationMethod: verificationMethod,
            exists: true
        });

        emit DIDCreated(did, publicKey);
    }

    /**
     * @dev Updates an existing DID Document
     * @param did The unique DID identifier
     * @param publicKey The new public key associated with the DID
     * @param controller The new controller of the DID
     * @param verificationMethod The new verification method for the DID
     */
    function updateDID(
        string memory did,
        string memory publicKey,
        string memory controller,
        string memory verificationMethod
    ) public onlyIssuer {
        require(didDocuments[did].exists, "DID does not exist");

        didDocuments[did] = DIDDocumentStruct({
            did: did,
            publicKey: publicKey,
            controller: controller,
            verificationMethod: verificationMethod,
            exists: true
        });

        emit DIDUpdated(did, publicKey);
    }

    /**
     * @dev Retrieves a DID Document by its DID
     * @param did The unique DID identifier
     * @return The DID Document details
     */
    function getDIDDocument(string memory did) public view returns (
        string memory, string memory, string memory, string memory
    ) {
        require(didDocuments[did].exists, "DID does not exist");

        DIDDocumentStruct memory doc = didDocuments[did];
        return (doc.did, doc.publicKey, doc.controller, doc.verificationMethod);
    }

    /**
     * @dev Checks if a DID exists
     * @param did The unique DID identifier
     * @return True if the DID exists, false otherwise
     */
    function didExists(string memory did) public view returns (bool) {
        return didDocuments[did].exists;
    }
}
