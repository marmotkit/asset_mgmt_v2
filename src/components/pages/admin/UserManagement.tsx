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
import { User, UserRole, UserStatus } from '../../../types/user';
import { ApiService } from '../../../services/api.service';
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

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ApiService.getUsers();
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
            const data = await ApiService.getCompanies();
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

    const handleSaveUser = async (userData: Partial<User>) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Saving user:', userData);

            let savedUser: User;
            if (userData.id) {
                // 更新現有會員
                savedUser = await ApiService.updateUser(userData as User);
                console.log('Updated user result:', savedUser);
            } else {
                // 建立新會員
                savedUser = await ApiService.createUser(userData as User);
                console.log('Created user result:', savedUser);
            }

            await loadUsers();
            setIsDialogOpen(false);
        } catch (err) {
            console.error('保存會員資料失敗:', err);
            setError(err instanceof Error ? err.message : '保存會員資料失敗');
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
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveUser}
                user={selectedUser}
            />
        </Box>
    );
};

export default UserManagement;