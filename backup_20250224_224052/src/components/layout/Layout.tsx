import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Login from '../pages/auth/Login';

const Layout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    alert(`Layout 路徑: ${location.pathname}`);
    alert(`登入狀態: ${isAuthenticated ? '已登入' : '未登入'}`);
  }, [location.pathname, isAuthenticated]);

  console.log('Layout rendering:', { 
    isAuthenticated, 
    user, 
    currentPath: location.pathname 
  });

  React.useEffect(() => {
    if (isAuthenticated && location.pathname === '/') {
      console.log('Redirecting to /member/users');
      navigate('/member/users', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  if (!isAuthenticated) {
    alert('未登入，顯示登入頁面');
    return <Login />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1976d2'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            資產管理系統
          </Typography>
          {user && (
            <Typography color="inherit">
              {user.name}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Sidebar open={sidebarOpen} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          mt: '64px',
          ml: sidebarOpen ? '240px' : 0,
          transition: theme =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 