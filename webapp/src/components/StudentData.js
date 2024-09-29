import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Card, CardContent, Grid } from '@mui/material';

function StudentData() {
  const [studentData, setStudentData] = useState({
    did: '',
    name: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    nationality: '',
  });
  const [credentialHash, setCredentialHash] = useState('');
  const [registered, setRegistered] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchDID, setSearchDID] = useState('');
  const [message, setMessage] = useState('');

  // Handle student registration
  const handleRegister = async () => {
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3001/register-student', studentData);
      setMessage(`Student registered successfully with transaction hash: ${response.data.sensitiveDataTransactionHash}`);
      setRegistered(true);
    } catch (error) {
      console.error('Error registering student:', error);
      setMessage('Error registering student');
    }
  };

  // Handle credential assignment
  const handleAssignCredential = async () => {
    setMessage('');
    if (!studentData.did || !credentialHash) {
      setMessage('Please provide both DID and Credential Hash.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3001/assign-credential', {
        did: studentData.did,
        credentialHash: credentialHash,
      });
      setMessage('Credential assigned successfully!');
      setAssigned(true);
    } catch (error) {
      console.error('Error assigning credential:', error);
      setMessage('Error assigning credential');
    }
  };

  // Handle student search by DID
  const handleSearchStudent = async () => {
    setMessage('');
    try {
      const response = await axios.get(`http://localhost:3001/get-student/${searchDID}`);
      setSearchResult(response.data);
      setStudentData({
        did: response.data.did,
        name: response.data.name,
        email: response.data.email,
        dateOfBirth: response.data.dateOfBirth,
        phoneNumber: response.data.phoneNumber,
        nationality: response.data.nationality,
      });
      setMessage('Student found successfully!');
    } catch (error) {
      console.error('Error searching student:', error);
      setMessage('Student not found or an error occurred.');
    }
  };

  // Reset form
  const handleNewStudent = () => {
    setRegistered(false);
    setAssigned(false);
    setSearchResult(null);
    setStudentData({
      did: '',
      name: '',
      email: '',
      dateOfBirth: '',
      phoneNumber: '',
      nationality: '',
    });
    setCredentialHash('');
    setMessage('');
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Manage Student Data
      </Typography>

      {/* Search Student Section */}
      <Card sx={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Search Student by DID
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="DID"
                value={searchDID}
                onChange={(e) => setSearchDID(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button fullWidth variant="contained" color="primary" onClick={handleSearchStudent}>
                Search Student
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Display Search Result and Allow Credential Assignment */}
      {searchResult && (
        <Card sx={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Student Details
            </Typography>
            <Typography variant="body1">
              <strong>DID:</strong> {searchResult.did}
            </Typography>
            <Typography variant="body1">
              <strong>Name:</strong> {searchResult.name}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {searchResult.email}
            </Typography>
            <Typography variant="body1">
              <strong>Date of Birth:</strong> {searchResult.dateOfBirth}
            </Typography>
            <Typography variant="body1">
              <strong>Phone:</strong> {searchResult.phoneNumber}
            </Typography>
            <Typography variant="body1">
              <strong>Nationality:</strong> {searchResult.nationality}
            </Typography>

            {/* Assign Credential */}
            <Typography variant="h6" gutterBottom sx={{ marginTop: '20px' }}>
              Assign Credential to Student
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Credential Hash"
                  value={credentialHash}
                  onChange={(e) => setCredentialHash(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" color="secondary" onClick={handleAssignCredential}>
                  Assign Credential
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Register New Student Section */}
      {!registered && !searchResult && (
        <Card sx={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Register New Student
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="DID (if provided)"
                  value={studentData.did}
                  onChange={(e) => setStudentData({ ...studentData, did: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={studentData.name}
                  onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={studentData.email}
                  onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  InputLabelProps={{ shrink: true }}
                  value={studentData.dateOfBirth}
                  onChange={(e) => setStudentData({ ...studentData, dateOfBirth: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={studentData.phoneNumber}
                  onChange={(e) => setStudentData({ ...studentData, phoneNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nationality"
                  value={studentData.nationality}
                  onChange={(e) => setStudentData({ ...studentData, nationality: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" color="primary" onClick={handleRegister}>
                  Register Student
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Display message */}
      {message && (
        <Typography variant="body1" sx={{ marginTop: '20px', color: 'green' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default StudentData;
