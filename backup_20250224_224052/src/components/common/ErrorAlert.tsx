import React from 'react';
import { Alert, AlertProps } from '@mui/material';

interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => (
  <Alert 
    severity="error" 
    onClose={onClose}
    sx={{ mb: 2 }}
  >
    {message}
  </Alert>
);

export default ErrorAlert; 