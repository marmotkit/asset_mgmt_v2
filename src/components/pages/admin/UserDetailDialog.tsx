import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { companyService } from '../../../services/companyService';
import { User, UserRole, UserStatus } from '../../../types/user';
import { Company } from '../../../types/company';

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => Promise<void>;
  user: User | null;
}

const defaultFormData = {
  username: '',
  name: '',
  email: '',
  role: 'normal' as UserRole,
  status: 'active' as UserStatus,
  companyId: '',
};

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
  open,
  onClose,
  onSave,
  user
}) => {
  const [formData, setFormData] = useState<Partial<User>>(defaultFormData);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const resetForm = () => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({ ...defaultFormData });
    }
    setErrors({});
    setPassword('');
    setPasswordError('');
  };

  // 當對話框開啟或傳入的使用者變更時，重設表單資料
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [user, open]);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('載入公司資料失敗:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = '請輸入會員帳號';
    }
    if (!formData.name) {
      newErrors.name = '請輸入姓名';
    }
    if (!formData.email) {
      newErrors.email = '請輸入電子郵件';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件地址';
    }
    // 新增會員時檢查密碼
    if (!user) {
      if (!password) {
        setPasswordError('請輸入密碼');
      } else if (password.length < 6) {
        setPasswordError('密碼至少6碼');
      } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
        setPasswordError('密碼需包含英文與數字');
      } else {
        setPasswordError('');
      }
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }
    setErrors(newErrors);
    // 修正: 只要是編輯模式(user存在)就不檢查密碼錯誤
    if (!user && passwordError) return false;
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    const userData: Partial<User> = {
      ...user,
      username: formData.username!,
      name: formData.name!,
      email: formData.email!,
      role: formData.role as UserRole,
      status: formData.status as UserStatus,
      companyId: formData.companyId,
      updatedAt: new Date().toISOString()
    };
    // 新增會員時帶入密碼
    if (!user) {
      (userData as any).password = password;
    }
    await onSave(userData as Partial<User>);
    onClose();
  };

  // 處理關閉對話框
  const handleClose = () => {
    // 清空表單數據
    setFormData({ ...defaultFormData });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography>
          {user ? '編輯會員' : '新增會員'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="會員帳號"
              value={formData.username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              error={!!errors.username}
              helperText={errors.username}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="姓名"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="電子郵件"
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              required
            />
          </Grid>

          {!user && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="密碼"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={!!passwordError}
                helperText={passwordError || '密碼至少6碼，需包含英文與數字'}
                required
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>角色</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleFieldChange('role', e.target.value)}
                label="角色"
              >
                <MenuItem value="admin">管理員</MenuItem>
                <MenuItem value="normal">一般會員</MenuItem>
                <MenuItem value="business">商務會員</MenuItem>
                <MenuItem value="lifetime">永久會員</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>狀態</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                label="狀態"
              >
                <MenuItem value="active">啟用</MenuItem>
                <MenuItem value="inactive">停用</MenuItem>
                <MenuItem value="suspended">暫停</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>所屬公司</InputLabel>
              <Select
                value={formData.companyId || ''}
                onChange={(e) => handleFieldChange('companyId', e.target.value)}
                label="所屬公司"
              >
                <MenuItem value="">無</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    {company.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailDialog;