// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SensitiveDataStorage {

    struct SensitiveData {
        string name;
        string email;
        string dateOfBirth;
        string phoneNumber;
        string nationality;
        string credentialHash;
    }

    mapping(string => SensitiveData) private sensitiveDataByDID;

    event SensitiveDataRegistered(
        string indexed did,
        string name,
        string email,
        string dateOfBirth,
        string phoneNumber,
        string nationality,
        string credentialHash
    );

    event SensitiveDataUpdated(
        string indexed did,
        string name,
        string email,
        string dateOfBirth,
        string phoneNumber,
        string nationality,
        string credentialHash
    );

    // Function to set sensitive data (No DID existence check)
    function setSensitiveData(
        string memory did,
        string memory name,
        string memory email,
        string memory dateOfBirth,
        string memory phoneNumber,
        string memory nationality,
        string memory credentialHash
    ) public {
        sensitiveDataByDID[did] = SensitiveData(name, email, dateOfBirth, phoneNumber, nationality, credentialHash);
        emit SensitiveDataRegistered(did, name, email, dateOfBirth, phoneNumber, nationality, credentialHash);
    }

    // Function to update existing sensitive data
    function updateSensitiveData(
        string memory did,
        string memory name,
        string memory email,
        string memory dateOfBirth,
        string memory phoneNumber,
        string memory nationality,
        string memory credentialHash
    ) public {
        require(bytes(sensitiveDataByDID[did].name).length != 0, "Data for this DID does not exist");
        sensitiveDataByDID[did] = SensitiveData(name, email, dateOfBirth, phoneNumber, nationality, credentialHash);
        emit SensitiveDataUpdated(did, name, email, dateOfBirth, phoneNumber, nationality, credentialHash);
    }

    // Function to retrieve sensitive data by DID
    function getSensitiveData(string memory did)
        public
        view
        returns (
            string memory name,
            string memory email,
            string memory dateOfBirth,
            string memory phoneNumber,
            string memory nationality,
            string memory credentialHash
        )
    {
        SensitiveData memory data = sensitiveDataByDID[did];
        require(bytes(data.name).length != 0, "Data for this DID does not exist");

        return (data.name, data.email, data.dateOfBirth, data.phoneNumber, data.nationality, data.credentialHash);
    }
}
