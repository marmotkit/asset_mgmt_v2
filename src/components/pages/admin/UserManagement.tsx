import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Chip,
    Alert,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { User, UserRole, UserStatus } from '../../../types/user';
import { userService } from '../../../services/userService';
import { companyService } from '../../../services/companyService';
import UserDetailDialog from './UserDetailDialog';
import { Company } from '../../../types/company';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [resetPwdDialogOpen, setResetPwdDialogOpen] = useState(false);
    const [resetPwdUser, setResetPwdUser] = useState<User | null>(null);
    const [resetPwd, setResetPwd] = useState('');
    const [resetPwdError, setResetPwdError] = useState('');
    const [viewPwdDialogOpen, setViewPwdDialogOpen] = useState(false);
    const [viewPwdUser, setViewPwdUser] = useState<User | null>(null);
    const [viewPwd, setViewPwd] = useState('');
    const [viewPwdLoading, setViewPwdLoading] = useState(false);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.getUsers();
            setUsers(data || []);
        } catch (err) {
            setError('載入會員資料失敗');
            console.error('載入會員資料失敗:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadCompanies = async () => {
        try {
            const data = await companyService.getCompanies();
            setCompanies(data);
        } catch (error) {
            console.error('載入公司資料失敗:', error);
        }
    };

    useEffect(() => {
        loadUsers();
        loadCompanies();
    }, []);

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedUser(null);
    };

    const handleSaveUser = async (userData: Partial<User>) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Saving user:', userData);

            let savedUser: User;
            if (userData.id) {
                // 更新現有會員
                savedUser = await userService.updateUser(userData.id, userData);
                console.log('Updated user result:', savedUser);
            } else {
                // 建立新會員
                savedUser = await userService.createUser(userData);
                console.log('Created user result:', savedUser);
            }

            await loadUsers();
            setIsDialogOpen(false);
            setSelectedUser(null);
        } catch (err) {
            console.error('保存會員資料失敗:', err);
            setError(err instanceof Error ? err.message : '保存會員資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenResetPwd = (user: User) => {
        setResetPwdUser(user);
        setResetPwdDialogOpen(true);
        setResetPwd('');
        setResetPwdError('');
    };
    const handleCloseResetPwd = () => {
        setResetPwdDialogOpen(false);
        setResetPwdUser(null);
        setResetPwd('');
        setResetPwdError('');
    };

    const handleOpenViewPwd = (user: User) => {
        setViewPwdUser(user);
        setViewPwdDialogOpen(true);
        setViewPwd('');
        setViewPwdLoading(false);
    };

    const handleCloseViewPwd = () => {
        setViewPwdDialogOpen(false);
        setViewPwdUser(null);
        setViewPwd('');
        setViewPwdLoading(false);
    };

    const handleViewPwd = async () => {
        if (!viewPwdUser) return;

        try {
            setViewPwdLoading(true);
            const password = await userService.getUserPassword(viewPwdUser.id);
            setViewPwd(password);
        } catch (err) {
            console.error('查詢密碼失敗:', err);
            setError(err instanceof Error ? err.message : '查詢密碼失敗');
        } finally {
            setViewPwdLoading(false);
        }
    };
    const handleResetPwd = async () => {
        // 驗證密碼
        if (!resetPwd) {
            setResetPwdError('請輸入新密碼');
            return;
        } else if (resetPwd.length < 6) {
            setResetPwdError('密碼至少6碼');
            return;
        } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(resetPwd)) {
            setResetPwdError('密碼需包含英文與數字');
            return;
        }
        setResetPwdError('');
        try {
            setLoading(true);
            setError(null);
            await userService.resetUserPassword(resetPwdUser!.id, resetPwd);
            setResetPwdDialogOpen(false);
            setResetPwdUser(null);
            setResetPwd('');
            await loadUsers();
        } catch (err) {
            setError('重設密碼失敗');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role: UserRole): string => {
        switch (role) {
            case 'admin':
                return '管理員';
            case 'normal':
                return '一般會員';
            case 'business':
                return '商務會員';
            case 'lifetime':
                return '永久會員';
            default:
                return role;
        }
    };

    const getRoleColor = (role: UserRole): "success" | "info" | "default" => {
        switch (role) {
            case 'admin':
                return 'success';
            case 'business':
                return 'info';
            case 'normal':
                return 'info';
            case 'lifetime':
                return 'info';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: UserStatus): string => {
        switch (status) {
            case 'active':
                return '啟用';
            case 'inactive':
                return '停用';
            case 'suspended':
                return '暫停';
            default:
                return status;
        }
    };

    const getStatusColor = (status: UserStatus): "success" | "error" | "warning" | "default" => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'error';
            case 'suspended':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getCompanyName = (companyId?: string) => {
        if (!companyId) return '-';
        const company = companies.find(c => c.id === companyId);
        return company ? company.name : '-';
    };

    // 更新角色選項
    const roleOptions = [
        { value: 'admin', label: '管理員' },
        { value: 'normal', label: '一般會員' },
        { value: 'business', label: '商務會員' },
        { value: 'lifetime', label: '永久會員' }
    ];

    // 更新狀態選項
    const statusOptions = [
        { value: 'active', label: '啟用' },
        { value: 'inactive', label: '停用' },
        { value: 'suspended', label: '暫停' }
    ];

    // 更新狀態篩選邏輯
    const filteredUsers = users.filter(user => {
        const matchesSearch = (
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading && users.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                    會員管理
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddUser}
                >
                    新增會員
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>會員編號</TableCell>
                            <TableCell>姓名</TableCell>
                            <TableCell>電子郵件</TableCell>
                            <TableCell>角色</TableCell>
                            <TableCell>所屬公司</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.memberNo}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={getRoleLabel(user.role)}
                                        color={getRoleColor(user.role)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{getCompanyName(user.companyId)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={getStatusLabel(user.status)}
                                        color={user.status === 'active' ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="編輯">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditUser(user)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="重設密碼">
                                        <IconButton size="small" color="primary" onClick={() => handleOpenResetPwd(user)}>
                                            <LockResetIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="查詢密碼">
                                        <IconButton size="small" color="secondary" onClick={() => handleOpenViewPwd(user)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    尚無會員資料
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <UserDetailDialog
                open={isDialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveUser}
                user={selectedUser}
            />

            <Dialog open={resetPwdDialogOpen} onClose={handleCloseResetPwd}>
                <DialogTitle>重設密碼</DialogTitle>
                <DialogContent>
                    <TextField
                        label="新密碼"
                        type="password"
                        value={resetPwd}
                        onChange={e => setResetPwd(e.target.value)}
                        error={!!resetPwdError}
                        helperText={resetPwdError || '密碼至少6碼，需包含英文與數字'}
                        fullWidth
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseResetPwd}>取消</Button>
                    <Button onClick={handleResetPwd} variant="contained">儲存</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={viewPwdDialogOpen} onClose={handleCloseViewPwd}>
                <DialogTitle>查詢密碼</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            會員：{viewPwdUser?.name} ({viewPwdUser?.username})
                        </Typography>
                    </Box>
                    <TextField
                        label="密碼"
                        type="text"
                        value={viewPwd}
                        InputProps={{
                            readOnly: true,
                        }}
                        fullWidth
                        placeholder={viewPwdLoading ? '載入中...' : '點擊查詢按鈕查看密碼'}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseViewPwd}>關閉</Button>
                    <Button
                        onClick={handleViewPwd}
                        variant="contained"
                        disabled={viewPwdLoading}
                        startIcon={viewPwdLoading ? <CircularProgress size={16} /> : null}
                    >
                        {viewPwdLoading ? '查詢中...' : '查詢密碼'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;