import React from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Login from '../pages/auth/Login';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: '240px',  // 固定側邊欄寬度
          marginTop: '64px',    // 固定頂部欄高度
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 