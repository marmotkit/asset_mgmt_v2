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
} from '@mui/icons-material';
import { User, UserRole, UserStatus, UserFormData } from '../../../types/user';
import { ApiService } from '../../../services/api.service';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import UserDetailDialog from './UserDetailDialog';
import { exportToExcel, exportToCsv } from '../../../utils/exportUtils';
import ImportDialog from './ImportDialog';
import { SelectChangeEvent } from '@mui/material/Select';

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

  const loadUsers = async () => {
    try {
      alert('開始載入使用者資料');
      setLoading(true);
      const response = await ApiService.getUsersPaginated({
        page: 0,
        pageSize: 10,
        sortBy: 'username',
        sortOrder: 'asc'
      });
      alert(`載入成功: ${response.items.length} 筆資料`);
      setUsers(response.items);
      setTotal(response.total);
    } catch (err) {
      alert(`載入失敗: ${err}`);
      setError('載入使用者資料失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    alert('UserManagement 組件載入');
    loadUsers();
  }, []);

  console.log('UserManagement rendering:', { loading, users, error });

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

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'disabled') => {
    try {
      await ApiService.updateUserStatus(userId, newStatus);
      await loadUsers();
    } catch (err) {
      setError('更新使用者狀態失敗');
    }
  };

  const validateUser = (selectedUser: UserFormData) => {
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

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    // Implementation of handleExportClick
  };

  const handleExportClose = () => {
    // Implementation of handleExportClose
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    setLoading(true);
    try {
      // Implementation of handleExport
    } catch (error) {
      setError('匯出資料失敗');
    } finally {
      setLoading(false);
      handleExportClose();
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

  if (loading) {
    console.log('Showing loading spinner');
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <ErrorAlert
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <Box sx={{ p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <ButtonGroup>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSelectedUser(null);
                setDialogOpen(true);
              }}
              startIcon={<PersonAddIcon />}
            >
              新增會員
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleImportUsers}
              startIcon={<FileUploadIcon />}
            >
              匯入會員
            </Button>
          </ButtonGroup>

          {selectedUsers.length > 0 && (
            <ButtonGroup>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleBatchEnable}
                startIcon={<ActivateIcon />}
              >
                批次啟用
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleBatchDisable}
                startIcon={<BlockIcon />}
              >
                批次停用
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleBatchDelete}
                startIcon={<DeleteIcon />}
              >
                批次刪除
              </Button>
            </ButtonGroup>
          )}

          <Button
            variant="outlined"
            color="primary"
            onClick={handleExportUsers}
            startIcon={<ExportIcon />}
          >
            匯出會員
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>會員等級</InputLabel>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              label="會員等級"
            >
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="normal">一般會員</MenuItem>
              <MenuItem value="lifetime">終生會員</MenuItem>
              <MenuItem value="business">商務會員</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>狀態</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="狀態"
            >
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="active">啟用</MenuItem>
              <MenuItem value="pending">待審核</MenuItem>
              <MenuItem value="disabled">停用</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="搜尋"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <Menu
        anchorEl={null}
        open={false}
      >
        <MenuItem onClick={() => handleExport('excel')}>
          匯出為 Excel
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          匯出為 CSV
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
              <TableCell>會員等級</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
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
                <TableCell>{`${user.lastName || ''}${user.firstName || ''}`}</TableCell>
                <TableCell>{user.email}</TableCell>
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
                    label={user.status === 'active' ? '啟用' : '停用'}
                    color={user.status === 'active' ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditUser(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  {user.status === 'active' ? (
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleStatusChange(user.id, 'disabled')}
                    >
                      <CloseIcon />
                    </IconButton>
                  ) : (
                    <IconButton 
                      size="small" 
                      color="success"
                      onClick={() => handleStatusChange(user.id, 'active')}
                    >
                      <CheckIcon />
                    </IconButton>
                  )}
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
        onClose={() => {}}
      />

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImportConfirm}
      />
    </Box>
  );
};

export default UserManagement; 