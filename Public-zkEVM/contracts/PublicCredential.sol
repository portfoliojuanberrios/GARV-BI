// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PublicCredential {
    struct Credential {
        string studentName;
        string courseName;
        string issueDate;
        string courseId;
        string institutionName;
        string institutionSignature;
        string studentDID;
        bool revoked;
    }
    mapping(bytes32 => Credential) public credentialsByHash;
    address public issuer;
    event CredentialIssued(bytes32 indexed hashId, string courseId);
    event CredentialRevoked(bytes32 indexed hashId, string courseId);
    modifier onlyIssuer() {
        require(msg.sender == issuer, "Only issuer can call this function");
        _;
    }
    constructor() {
        issuer = msg.sender;
    }
    function issueCredential(
        string memory studentName, 
        string memory courseName, 
        string memory issueDate,
        string memory courseId,
        string memory institutionName,
        string memory institutionSignature,
        string memory studentDID
    ) public onlyIssuer {
        bytes32 hashId = keccak256(abi.encodePacked(studentName, courseName, issueDate, courseId, institutionName, institutionSignature, studentDID));
        credentialsByHash[hashId] = Credential(
            studentName, 
            courseName, 
            issueDate, 
            courseId,
            institutionName, 
            institutionSignature, 
            studentDID, 
            false
        );
        
        emit CredentialIssued(hashId, courseId);
    }
    function revokeCredential(bytes32 hashId) public onlyIssuer {
        credentialsByHash[hashId].revoked = true;
        emit CredentialRevoked(hashId, credentialsByHash[hashId].courseId);
    }
    function verifyCredential(bytes32 hashId) public view returns (
        string memory, string memory, string memory, 
        string memory, string memory, string memory, string memory, bool) {
        Credential memory cred = credentialsByHash[hashId];
        return (
            cred.studentName, 
            cred.courseName, 
            cred.issueDate, 
            cred.courseId, 
            cred.institutionName, 
            cred.institutionSignature, 
            cred.studentDID, 
            cred.revoked
        );
    }
}
