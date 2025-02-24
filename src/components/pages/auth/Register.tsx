import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Grid,
  Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const RegisterContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  padding: theme.spacing(4),
}));

const RegisterBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  maxWidth: 600,
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
}));

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const Register = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 基本驗證
    if (formData.password !== formData.confirmPassword) {
      setError('密碼與確認密碼不符');
      return;
    }

    if (formData.password.length < 8) {
      setError('密碼長度必須至少8個字元');
      return;
    }

    try {
      // TODO: 實作註冊邏輯
      console.log('Register attempt:', formData);
      // 註冊成功後導向登入頁面
    } catch (err) {
      setError('註冊失敗，請稍後再試');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <RegisterContainer>
      <RegisterBox elevation={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          會員註冊
        </Typography>
        
        {error && <Alert severity="error">{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="lastName"
                label="姓"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="firstName"
                label="名"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="username"
                label="帳號"
                value={formData.username}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="email"
                label="電子郵件"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="phone"
                label="聯絡電話"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="密碼"
                type="password"
                value={formData.password}
                onChange={handleChange}
                helperText="密碼長度至少8個字元"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="確認密碼"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            註冊
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Link href="/login" variant="body2">
              已有帳號？返回登入
            </Link>
          </Box>
        </Box>
      </RegisterBox>
    </RegisterContainer>
  );
};

export default Register; 