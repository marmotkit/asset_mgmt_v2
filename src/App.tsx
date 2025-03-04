import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { zhTW } from 'date-fns/locale';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import { storageService } from './services/storageService';
import AppRoutes from './routes';

const App: React.FC = () => {
  useEffect(() => {
    // 初始化資料儲存
    storageService.initialize();
  }, []);

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
            <AppRoutes />
          </LocalizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App; 