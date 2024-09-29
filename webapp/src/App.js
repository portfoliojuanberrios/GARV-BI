import React, { useState } from 'react';
import Credentials from './components/Credentials';
import StudentData from './components/StudentData';
import Files from './components/Files';
import './App.css';
import { AppBar, Toolbar, Typography, Box, Container, Tabs, Tab } from '@mui/material';

function App() {
  const [section, setSection] = useState('credentials'); // Default section is Credentials

  const handleChange = (event, newValue) => {
    setSection(newValue);
  };

  return (
    <div className="App">
      {/* Top AppBar with logo and navigation */}
      <AppBar position="fixed" color="default"> {/* Set position to 'fixed' */}
        <Toolbar>
          {/* Logo */}
          <img src={require('./logo.png')} alt="App Logo" style={{ width: '150px'}} />
          
          {/* Title */}
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            GARV-BI 1.0
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Spacer to prevent content overlap with AppBar */}
      <Toolbar /> {/* This creates a spacer the same height as the AppBar */}

      {/* Second spacer to ensure the Tabs are not hidden */}
      <Container maxWidth="lg" sx={{ marginTop: '80px' }}> {/* Add a larger marginTop */}
        {/* Tabs for navigation */}
        <Tabs
          value={section}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Credentials" value="credentials" />
          <Tab label="Student Data" value="students" />
          <Tab label="Files" value="files" />
        </Tabs>

        {/* Content Area */}
        <Box sx={{ marginTop: '20px' }}>
          {section === 'credentials' && <Credentials />} {/* Credentials Section */}
          {section === 'students' && <StudentData />}    {/* Student Data Section */}
          {section === 'files' && <Files />}             {/* Files Section */}
        </Box>
      </Container>
    </div>
  );
}

export default App;
