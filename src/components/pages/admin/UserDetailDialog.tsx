import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { User, UserRole, UserStatus } from '../../../types/user';
import PreferencesManager from '../user/PreferencesManager';
import UserActivityLog from './UserActivityLog';
import { SelectChangeEvent } from '@mui/material/Select';
import { generateMemberNo } from '../../../utils/memberNoGenerator';
import { Company } from '../../../types/company';
import ApiService from '../../../services/api.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  userData: Partial<User> | null;
  onSave: (userData: Partial<User>) => Promise<void>;
  existingUsers: User[];
}

const defaultUserData: Partial<User> = {
  role: 'normal',
  status: 'active',
  preferences: [],
  isFirstLogin: true,
};

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({
  open,
  onClose,
  userData: initialUserData,
  onSave,
  existingUsers,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState<Partial<User>>(defaultUserData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    setUserData(initialUserData || defaultUserData);
    loadCompanies();
  }, [initialUserData]);

  const loadCompanies = async () => {
    try {
      const data = await ApiService.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('載入公司資料失敗:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (field: keyof User) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUserData((prev: Partial<User>) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleRoleChange = async (event: SelectChangeEvent) => {
    const newRole = event.target.value as UserRole;
    try {
      const existingNumbers = existingUsers.map(user => user.memberNo);
      const newMemberNo = !initialUserData?.memberNo
        ? await generateMemberNo(newRole, existingNumbers)
        : userData.memberNo;

      setUserData(prev => ({
        ...prev,
        role: newRole,
        memberNo: newMemberNo,
      }));
    } catch (err) {
      setError('生成會員編號時發生錯誤');
    }
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setUserData((prev: Partial<User>) => ({
      ...prev,
      status: event.target.value as UserStatus,
    }));
  };

  const handleCompanyChange = (event: SelectChangeEvent) => {
    setUserData((prev: Partial<User>) => ({
      ...prev,
      companyId: event.target.value as string,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSave(userData);
      onClose();
    } catch (err) {
      setError('儲存失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {initialUserData?.id ? '編輯會員資料' : '新增會員'}
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="基本資料" />
          <Tab label="投資偏好" />
          <Tab label="活動記錄" />
        </Tabs>
      </Box>

      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="會員編號"
                value={userData.memberNo || ''}
                disabled
                helperText="會員編號將根據會員等級自動生成"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="帳號"
                value={userData.username || ''}
                onChange={handleInputChange('username')}
              />
            </Grid>
            {!initialUserData?.id && (
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="password"
                  label="密碼"
                  value={userData.password || ''}
                  onChange={(e) => setUserData(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="姓名"
                value={userData.name || ''}
                onChange={handleInputChange('name')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="電子郵件"
                type="email"
                value={userData.email || ''}
                onChange={handleInputChange('email')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>會員等級</InputLabel>
                <Select
                  value={userData.role || 'normal'}
                  onChange={handleRoleChange}
                  label="會員等級"
                >
                  <MenuItem value="normal">一般會員</MenuItem>
                  <MenuItem value="lifetime">終身會員</MenuItem>
                  <MenuItem value="business">商務會員</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>狀態</InputLabel>
                <Select
                  value={userData.status || 'active'}
                  onChange={handleStatusChange}
                  label="狀態"
                >
                  <MenuItem value="active">啟用</MenuItem>
                  <MenuItem value="disabled">停用</MenuItem>
                  <MenuItem value="pending">待審核</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>所屬公司</InputLabel>
                <Select
                  value={userData.companyId || ''}
                  onChange={handleCompanyChange}
                >
                  <MenuItem value="">
                    <em>無</em>
                  </MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {userData.id && (
            <PreferencesManager
              userId={userData.id}
              onUpdate={() => {
                // 可以在這裡處理偏好更新後的操作
              }}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {userData.id && <UserActivityLog userId={userData.id} />}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : '儲存'}
        </Button>
      </DialogActions>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Dialog>
  );
};

export default UserDetailDialog; 