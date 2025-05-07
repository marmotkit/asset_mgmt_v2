import React, { useEffect } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import zhTW from 'date-fns/locale/zh-TW';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import { storageService } from './services/storageService';
import AppRoutes from './routes';
import { SnackbarProvider } from 'notistack';

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
            <SnackbarProvider maxSnack={3}>
              <AppRoutes />
            </SnackbarProvider>
          </LocalizationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App; 