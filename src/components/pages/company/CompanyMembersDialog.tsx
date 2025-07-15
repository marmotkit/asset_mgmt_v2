import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    CircularProgress,
    Box,
    Alert,
} from '@mui/material';
import { User, UserRole, UserStatus } from '../../../types/user';
import { userService } from '../../../services/userService';

interface CompanyMembersDialogProps {
    open: boolean;
    onClose: () => void;
    companyId: string;
    companyName: string;
}

const CompanyMembersDialog: React.FC<CompanyMembersDialogProps> = ({
    open,
    onClose,
    companyId,
    companyName
}) => {
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && companyId) {
            loadCompanyMembers();
        }
    }, [open, companyId]);

    const loadCompanyMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const allUsers = await userService.getUsers();
            // 篩選出屬於該公司的會員
            const companyMembers = allUsers.filter(user => user.companyId === companyId);
            setMembers(companyMembers);
        } catch (err) {
            setError('載入會員資料失敗');
            console.error('載入公司會員失敗:', err);
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

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h6">
                    {companyName} - 所屬會員
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    共 {members.length} 位會員
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : members.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <Typography variant="body1" color="text.secondary">
                            此公司目前沒有所屬會員
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>會員編號</TableCell>
                                    <TableCell>姓名</TableCell>
                                    <TableCell>帳號</TableCell>
                                    <TableCell>電子郵件</TableCell>
                                    <TableCell>角色</TableCell>
                                    <TableCell>狀態</TableCell>
                                    <TableCell>建立時間</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>{member.memberNo}</TableCell>
                                        <TableCell>{member.name}</TableCell>
                                        <TableCell>{member.username}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getRoleLabel(member.role)}
                                                color={getRoleColor(member.role)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(member.status)}
                                                color={getStatusColor(member.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(member.createdAt).toLocaleDateString('zh-TW')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    關閉
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CompanyMembersDialog; 