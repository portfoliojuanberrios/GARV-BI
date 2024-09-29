import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Card, CardContent, Grid } from '@mui/material';

function Credentials() {
  const [credentialData, setCredentialData] = useState({
    studentName: '',
    courseName: '',
    issueDate: '',
    courseId: '',
    institutionName: '',
    institutionSignature: '',
    studentDID: ''
  });
  const [hashId, setHashId] = useState('');
  const [issued, setIssued] = useState(false);
  const [verified, setVerified] = useState(false);  // For displaying verification result
  const [revoked, setRevoked] = useState(false);  // For tracking revocation status
  const [verifyResult, setVerifyResult] = useState(null);

  // Handle verifying the credential
  const handleVerify = async () => {
    if (!hashId) {
      alert('Please provide a valid Hash ID to verify the credential.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/verify-credential/${hashId}`);
      setVerifyResult(response.data);
      setRevoked(response.data.revoked); // Check if credential is revoked
      setVerified(true); // Show the verification result in certificate format
    } catch (error) {
      console.error('Error verifying credential:', error);
      alert('Error verifying credential');
    }
  };

  // Handle revoking the credential
  const handleRevoke = async () => {
    if (!hashId) {
      alert('Please provide a valid Hash ID to revoke the credential.');
      return;
    }
    try {
      await axios.post('http://localhost:3001/revoke-credential', { hashId });
      setRevoked(true);  // Show the revoked message in red
    } catch (error) {
      console.error('Error revoking credential:', error);
      alert('Error revoking credential');
    }
  };

  // Handle issuing the credential
  const handleIssue = async () => {
    try {
      const response = await axios.post('http://localhost:3001/issue-credential', credentialData);
      setHashId(response.data.hashId);
      setIssued(true);  // Show the issued certificate
    } catch (error) {
      console.error('Error issuing credential:', error);
      alert('Error issuing credential');
    }
  };

  // Handle issuing a new credential
  const handleNewCredential = () => {
    setIssued(false);
    setVerified(false);
    setRevoked(false);
    setCredentialData({
      studentName: '',
      courseName: '',
      issueDate: '',
      courseId: '',
      institutionName: '',
      institutionSignature: '',
      studentDID: ''
    });
    setHashId('');
    setVerifyResult(null);
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
      Manage Credentials
      </Typography>

      {/* Verify Credential Section */}
      <Card sx={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Verify Credential
          </Typography>
          <TextField
            fullWidth
            label="Hash ID"
            value={hashId}
            onChange={(e) => setHashId(e.target.value)}
            sx={{ marginBottom: '20px' }}
          />
          <Button fullWidth variant="outlined" color="primary" onClick={handleVerify}>
            Verify Credential
          </Button>

          {verified && verifyResult && (
            <Card sx={{ padding: '20px', textAlign: 'center', marginTop: '20px' }}>
              <Typography variant="h5" gutterBottom>
                {revoked ? 'Revoked Credential' : 'Verified Credential'}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Student: {verifyResult.studentName}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Course: {verifyResult.courseName}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Issue Date: {verifyResult.issueDate}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Course ID: {verifyResult.courseId}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Institution: {verifyResult.institutionName}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Institution Signature: {verifyResult.institutionSignature}
              </Typography>
              <Typography variant="h6" color="textSecondary" sx={{ marginTop: '20px' }}>
                Credential Hash ID: {hashId}
              </Typography>
              {revoked && (
                <Typography variant="h6" sx={{ marginTop: '20px', color: 'red' }}>
                  Credential Revoked
                </Typography>
              )}
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Revoke Credential Section */}
      <Card sx={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Revoke Credential
          </Typography>
          <TextField
            fullWidth
            label="Hash ID"
            value={hashId}
            onChange={(e) => setHashId(e.target.value)}
            sx={{ marginBottom: '20px' }}
          />
          <Button fullWidth variant="contained" color="secondary" onClick={handleRevoke}>
            Revoke Credential
          </Button>

          {revoked && (
            <Card sx={{ padding: '20px', textAlign: 'center', marginTop: '20px' }}>
              <Typography variant="h5" gutterBottom>
                Revoked Credential
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Student: {verifyResult?.studentName || "Unknown"}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Course: {verifyResult?.courseName || "Unknown"}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Issue Date: {verifyResult?.issueDate || "Unknown"}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Course ID: {verifyResult?.courseId || "Unknown"}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Institution: {verifyResult?.institutionName || "Unknown"}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Institution Signature: {verifyResult?.institutionSignature || "Unknown"}
              </Typography>
              <Typography variant="h6" color="textSecondary" sx={{ marginTop: '20px', color: 'red' }}>
                Credential Revoked
              </Typography>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Issue New Credential Section */}
      {!issued ? (
        <Card sx={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Issue Credential
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={credentialData.studentName}
                  onChange={(e) => setCredentialData({ ...credentialData, studentName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Course Name"
                  value={credentialData.courseName}
                  onChange={(e) => setCredentialData({ ...credentialData, courseName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Issue Date"
                  InputLabelProps={{ shrink: true }}
                  value={credentialData.issueDate}
                  onChange={(e) => setCredentialData({ ...credentialData, issueDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Course ID"
                  value={credentialData.courseId}
                  onChange={(e) => setCredentialData({ ...credentialData, courseId: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Institution Name"
                  value={credentialData.institutionName}
                  onChange={(e) => setCredentialData({ ...credentialData, institutionName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Institution Signature"
                  value={credentialData.institutionSignature}
                  onChange={(e) => setCredentialData({ ...credentialData, institutionSignature: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student DID"
                  value={credentialData.studentDID}
                  onChange={(e) => setCredentialData({ ...credentialData, studentDID: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button fullWidth variant="contained" color="primary" onClick={handleIssue}>
                  Issue Credential
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        // Display simulated credential certificate after issuance
        <Card sx={{ padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
          <Typography variant="h5" gutterBottom>
            Credential Issued
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Student: {credentialData.studentName}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Course: {credentialData.courseName}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Issue Date: {credentialData.issueDate}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Course ID: {credentialData.courseId}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Institution: {credentialData.institutionName}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Institution Signature: {credentialData.institutionSignature}
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ marginTop: '20px' }}>
            Credential Hash ID: {hashId}
          </Typography>
          <Button sx={{ marginTop: '20px' }} variant="contained" color="primary" onClick={handleNewCredential}>
            Issue New Credential
          </Button>
        </Card>
      )}
    </Box>
  );
}

export default Credentials;
