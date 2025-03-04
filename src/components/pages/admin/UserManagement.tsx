import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Toolbar,
  TablePagination,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Menu,
  Checkbox,
  Tooltip,
  DialogContentText,
  Grid,
  ButtonGroup,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  GetApp as ExportIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Upload as UploadIcon,
  PersonAdd as PersonAddIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { User, UserRole, UserStatus } from '../../../types/user';
import { ApiService } from '../../../services';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import UserDetailDialog from './UserDetailDialog';
import { exportToExcel, exportToCsv } from '../../../utils/exportUtils';
import ImportDialog from './ImportDialog';
import { SelectChangeEvent } from '@mui/material/Select';
import { Company } from '../../../types/company';

interface UserDialogData {
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  phone: string;
}

interface BatchOperationDialogProps {
  open: boolean;
  title: string;
  content: string;
  onConfirm: () => void;
  onClose: () => void;
}

const BatchOperationDialog: React.FC<BatchOperationDialogProps> = ({
  open,
  title,
  content,
  onConfirm,
  onClose,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{content}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>取消</Button>
      <Button onClick={onConfirm} color="primary" variant="contained">
        確認
      </Button>
    </DialogActions>
  </Dialog>
);

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string>('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMenuAnchor, setImportMenuAnchor] = useState<null | HTMLElement>(null);
  const [companies, setCompanies] = useState<Record<string, Company>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadUsers();
    loadCompanies();
  }, [page, pageSize, sortBy, sortOrder, searchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getUsersPaginated({
        page,
        pageSize,
        sortBy,
        sortOrder,
        search: searchQuery,
      });

      const filteredItems = response.items.filter(user => {
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        return (
          user.memberNo.toLowerCase().includes(searchLower) ||
          user.username.toLowerCase().includes(searchLower) ||
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      });

      setUsers(filteredItems);
      setTotal(filteredItems.length);
    } catch (err) {
      setError('載入使用者資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const companiesList = await ApiService.getCompanies();
      const companiesMap = companiesList.reduce((acc, company) => {
        acc[company.id] = company;
        return acc;
      }, {} as Record<string, Company>);
      setCompanies(companiesMap);
    } catch (error) {
      console.error('載入公司資料失敗:', error);
    }
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (userData.id) {
        await ApiService.updateUser(userData.id, userData);
      } else {
        await ApiService.createUser(userData);
      }
      await loadUsers();
    } catch (error) {
      setError('儲存使用者資料失敗');
      throw error;
    }
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    setLoading(true);
    try {
      await ApiService.updateUserStatus(userId, newStatus);
      await loadUsers();
    } catch (err) {
      setError('更新使用者狀態失敗');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!selectedUser) return false;

    const errors: string[] = [];

    if (!selectedUser.username) errors.push('帳號為必填');
    if (!selectedUser.email) errors.push('電子郵件為必填');
    if (!selectedUser.firstName) errors.push('名字為必填');
    if (!selectedUser.lastName) errors.push('姓氏為必填');

    // 電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (selectedUser.email && !emailRegex.test(selectedUser.email)) {
      errors.push('電子郵件格式不正確');
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return false;
    }

    return true;
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    setLoading(true);
    try {
      // 取得所有使用者資料
      const response = await ApiService.getUsersPaginated({
        page: 0,
        pageSize: 1000, // 取得較大數量的資料
      });

      if (format === 'excel') {
        exportToExcel(response.items, '會員資料.xlsx');
      } else {
        exportToCsv(response.items, '會員資料.csv');
      }
    } catch (error) {
      setError('匯出資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Implementation of handleSelectAll
  };

  const handleSelect = (id: string) => {
    // Implementation of handleSelect
  };

  const handleBatchOperation = async (
    operation: 'activate' | 'deactivate' | 'delete',
  ) => {
    // Implementation of handleBatchOperation
  };

  const handleConfirmOperation = async () => {
    // Implementation of handleConfirmOperation
  };

  const handleImport = async (users: Partial<User>[]) => {
    // Implementation of handleImport
  };

  const handleBatchEnable = () => {
    // Implementation of handleBatchEnable
  };

  const handleBatchDisable = () => {
    // Implementation of handleBatchDisable
  };

  const handleBatchDelete = () => {
    // Implementation of handleBatchDelete
  };

  const handleImportUsers = () => {
    setImportDialogOpen(true);
  };

  const handleImportConfirm = async (users: Partial<User>[]) => {
    // Implementation of handleImportConfirm
  };

  const handleExportUsers = () => {
    // Implementation of handleExportUsers
  };

  const handleDownloadTemplate = (format: 'excel' | 'csv') => {
    const templateData: Partial<User>[] = [{
      memberNo: 'C001',
      username: 'user001',
      name: '王小明',
      email: 'user001@example.com',
      role: 'normal',
      status: 'active',
    }];

    if (format === 'excel') {
      exportToExcel(templateData as User[], '會員匯入範本.xlsx');
    } else {
      exportToCsv(templateData as User[], '會員匯入範本.csv');
    }
    setImportMenuAnchor(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setLoading(true);
      await ApiService.deleteUser(userId);
      await loadUsers();
      setSnackbar({
        open: true,
        message: '刪除成功',
        severity: 'success'
      });
    } catch (error) {
      console.error('刪除失敗:', error);
      setSnackbar({
        open: true,
        message: '刪除失敗',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <Box sx={{ p: 3 }}>
      <Toolbar sx={{ mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          會員管理
        </Typography>

        <ButtonGroup variant="contained" sx={{ mr: 2 }}>
          <Button
            startIcon={<PersonAddIcon />}
            onClick={() => {
              setSelectedUser(null);
              setDialogOpen(true);
            }}
          >
            新增會員
          </Button>

          <Button
            startIcon={<FileDownloadIcon />}
            onClick={() => handleExport('excel')}
          >
            匯出會員
          </Button>

          <Button
            startIcon={<FileUploadIcon />}
            onClick={handleImportUsers}
          >
            匯入會員
          </Button>

          <Button
            startIcon={<MoreVertIcon />}
            onClick={(e) => setImportMenuAnchor(e.currentTarget)}
          >
            下載範本
          </Button>
        </ButtonGroup>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="搜尋會員編號、帳號、姓名或信箱..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>
      </Toolbar>

      <Menu
        anchorEl={importMenuAnchor}
        open={Boolean(importMenuAnchor)}
        onClose={() => setImportMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleDownloadTemplate('excel')}>
          Excel 範本
        </MenuItem>
        <MenuItem onClick={() => handleDownloadTemplate('csv')}>
          CSV 範本
        </MenuItem>
      </Menu>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedUsers.length > 0 && selectedUsers.length === users.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>會員編號</TableCell>
              <TableCell>帳號</TableCell>
              <TableCell>姓名</TableCell>
              <TableCell>電子郵件</TableCell>
              <TableCell>所屬公司</TableCell>
              <TableCell>會員等級</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(users || []).map((user) => (
              <TableRow
                key={user.id}
                selected={selectedUsers.indexOf(user.id) !== -1}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedUsers.indexOf(user.id) !== -1}
                    onChange={() => handleSelect(user.id)}
                  />
                </TableCell>
                <TableCell>{user.memberNo}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.companyId ? companies[user.companyId]?.name : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      user.role === 'admin' ? '管理員' :
                        user.role === 'normal' ? '一般會員' :
                          user.role === 'lifetime' ? '終身會員' :
                            '商務會員'
                    }
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      user.status === 'active' ? '啟用' :
                        user.status === 'pending' ? '待審核' :
                          '停用'
                    }
                    color={
                      user.status === 'active' ? 'success' :
                        user.status === 'pending' ? 'warning' :
                          'error'
                    }
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEditUser(user)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteUser(user.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="每頁顯示筆數"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} 筆，共 ${count} 筆`
          }
        />
      </TableContainer>

      <UserDetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        userData={selectedUser}
        onSave={handleSaveUser}
        existingUsers={users}
      />

      <BatchOperationDialog
        open={false}
        title=""
        content=""
        onConfirm={handleConfirmOperation}
        onClose={() => { }}
      />

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImportConfirm}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement; 