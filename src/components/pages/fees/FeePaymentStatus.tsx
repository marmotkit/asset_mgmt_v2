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
    Chip,
    IconButton,
    Typography,
    TextField,
    InputAdornment
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon } from '@mui/icons-material';

interface PaymentStatus {
    id: string;
    memberId: string;
    memberName: string;
    memberType: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue' | 'terminated';
    paidDate?: string;
}

const mockPayments: PaymentStatus[] = [
    {
        id: '1',
        memberId: 'A001',
        memberName: '系統管理員',
        memberType: '一般會員',
        amount: 30000,
        dueDate: '2024-12-31',
        status: 'paid',
        paidDate: '2024-01-15'
    },
    {
        id: '2',
        memberId: 'V001',
        memberName: '梁坤榮',
        memberType: '商務會員',
        amount: 300000,
        dueDate: '2024-12-31',
        status: 'pending'
    }
];

const getStatusChip = (status: PaymentStatus['status']) => {
    const statusConfig = {
        paid: { label: '已收款', color: 'success' },
        pending: { label: '待收款', color: 'warning' },
        overdue: { label: '逾期', color: 'error' },
        terminated: { label: '終止', color: 'default' }
    } as const;

    const config = statusConfig[status];
    return <Chip label={config.label} color={config.color} size="small" />;
};

const FeePaymentStatus: React.FC = () => {
    const [payments, setPayments] = useState<PaymentStatus[]>(mockPayments);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPayments = payments.filter(payment =>
        payment.memberName.includes(searchTerm) ||
        payment.memberId.includes(searchTerm)
    );

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    收款狀況
                </Typography>
                <TextField
                    size="small"
                    placeholder="搜尋會員編號或姓名"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 250 }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>會員編號</TableCell>
                            <TableCell>姓名</TableCell>
                            <TableCell>會員類型</TableCell>
                            <TableCell align="right">金額</TableCell>
                            <TableCell>到期日</TableCell>
                            <TableCell>繳費日期</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPayments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>{payment.memberId}</TableCell>
                                <TableCell>{payment.memberName}</TableCell>
                                <TableCell>{payment.memberType}</TableCell>
                                <TableCell align="right">{payment.amount.toLocaleString()}</TableCell>
                                <TableCell>{payment.dueDate}</TableCell>
                                <TableCell>{payment.paidDate || '-'}</TableCell>
                                <TableCell>{getStatusChip(payment.status)}</TableCell>
                                <TableCell>
                                    <IconButton size="small">
                                        <EditIcon />
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

export default FeePaymentStatus; 