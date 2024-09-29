import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Card, CardContent, Grid } from '@mui/material';

function Files() {
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [manualHash, setManualHash] = useState('');
  const [retrievedFileUrl, setRetrievedFileUrl] = useState('');
  const [studentDid, setStudentDid] = useState(''); // State for storing the student's DID

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3001/upload-ipfs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const { ipfsHash } = response.data; // Extract the IPFS hash from the response
      setIpfsHash(ipfsHash);
      setRetrievedFileUrl(`http://localhost:8080/ipfs/${ipfsHash}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  // Handle retrieving a file from IPFS based on hash
  const handleRetrieveFile = async () => {
    if (!manualHash) {
      alert('Please enter a valid IPFS hash');
      return;
    }
    setRetrievedFileUrl(`http://localhost:8080/ipfs/${manualHash}`);
  };

  // Handle inspecting the file in IPFS web UI with the updated inspect URL format
  const handleInspectFile = () => {
    if (!manualHash) {
      alert('Please enter a valid IPFS hash');
      return;
    }

    const inspectUrl = `http://localhost:5001/ipfs/bafybeihatzsgposbr3hrngo42yckdyqcc56yean2rynnwpzxstvdlphxf4/#/explore/${manualHash}`;
    window.open(inspectUrl, '_blank');
  };

  // Handle associating a file with a DID
  const handleAssociateToDid = async () => {
    if (!studentDid || !ipfsHash) {
      alert('Please enter both the student DID and ensure a file has been uploaded.');
      return;
    }

    try {
      // Replace this API endpoint with your actual backend endpoint that handles the DID association
      const response = await axios.post('http://localhost:3001/associate-did', {
        did: studentDid,
        ipfsHash: ipfsHash,
      });

      alert('File associated with DID successfully!');
    } catch (error) {
      console.error('Error associating file with DID:', error);
      alert('Error associating file with DID');
    }
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Manage Files
      </Typography>

      {/* Upload Section */}
      <Card sx={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload File to IPFS
          </Typography>
          <form onSubmit={handleFileUpload}>
            <TextField
              fullWidth
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              sx={{ marginBottom: '20px' }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button type="submit" variant="contained" color="primary">
              Upload File
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Display IPFS Hash */}
      {ipfsHash && (
        <Card sx={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6">File uploaded successfully!</Typography>
            <Typography>
              This file is now stored on IPFS with the following hash:
              <strong> {ipfsHash}</strong>.
            </Typography>
            <Typography>
              <strong>Access your file locally:</strong> 
              <br />
              <a href={retrievedFileUrl} target="_blank" rel="noopener noreferrer">{retrievedFileUrl}</a>
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Retrieve or Inspect File */}
      <Card sx={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Retrieve or Inspect a File by IPFS Hash
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Enter IPFS Hash"
                variant="outlined"
                value={manualHash}
                onChange={(e) => setManualHash(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button fullWidth variant="contained" color="secondary" onClick={handleRetrieveFile}>
                Retrieve File
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button fullWidth variant="outlined" color="primary" onClick={handleInspectFile}>
                Inspect File
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Associate file with DID */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Associate File with Student DID
          </Typography>
          <TextField
            fullWidth
            label="Enter Student DID"
            variant="outlined"
            value={studentDid}
            onChange={(e) => setStudentDid(e.target.value)}
            sx={{ marginBottom: '20px' }}
          />
          <Button fullWidth variant="contained" color="success" onClick={handleAssociateToDid}>
            Associate to DID Student
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Files;
