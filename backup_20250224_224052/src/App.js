import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
          <MainContent handleDrawerToggle={handleDrawerToggle} />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 