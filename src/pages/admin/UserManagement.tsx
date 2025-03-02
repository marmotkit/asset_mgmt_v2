import React, { useState } from 'react';
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
    IconButton,
    TextField,
    Chip,
    Typography,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

interface User {
    id: string;
    account: string;
    name: string;
    email: string;
    company: string;
    role: string;
    status: '啟用' | '停用';
}

const mockUsers: User[] = [
    {
        id: 'A001',
        account: 'admin',
        name: '系統管理員',
        email: 'admin@example.com',
        company: '-',
        role: '終身會員',
        status: '啟用',
    },
    {
        id: 'V001',
        account: 'kt',
        name: '梁坤榮',
        email: 'y134679@hotmail.com',
        company: '方正公司',
        role: '終身會員',
        status: '啟用',
    },
];

const UserManagement: React.FC = () => {
    const [users] = useState<User[]>(mockUsers);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        Object.values(user).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                會員管理
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {/* 處理新增會員 */ }}
                >
                    新增會員
                </Button>
                <TextField
                    placeholder="搜尋會員編號、帳號、姓名或信箱"
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 300 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox"></TableCell>
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
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell padding="checkbox">
                                    <input type="checkbox" />
                                </TableCell>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.account}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.company}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role}
                                        color="primary"
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.status}
                                        color={user.status === '啟用' ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={() => {/* 處理編輯 */ }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => {/* 處理刪除 */ }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UserManagement; 