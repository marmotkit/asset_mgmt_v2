<<<<<<< Updated upstream
import React, { useEffect } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppRoutes from './routes';
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import AppRoutes from './routes';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhTW } from 'date-fns/locale';
import MainLayout from './components/layout/MainLayout';
>>>>>>> Stashed changes

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// 認證檢查組件
const AuthCheck: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return null;
};

const App = () => {
  return (
<<<<<<< Updated upstream
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AuthCheck />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
=======
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
            <MainLayout>
              <AppRoutes />
            </MainLayout>
          </LocalizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
>>>>>>> Stashed changes
  );
};

export default App; 