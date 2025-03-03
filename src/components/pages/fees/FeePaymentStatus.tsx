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
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    SelectChangeEvent
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
    note?: string;
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
        paidDate: '2024-01-15',
        note: '準時繳費'
    },
    {
        id: '2',
        memberId: 'V001',
        memberName: '梁坤榮',
        memberType: '商務會員',
        amount: 300000,
        dueDate: '2024-12-31',
        status: 'pending',
        note: ''
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
    const [editingPayment, setEditingPayment] = useState<PaymentStatus | null>(null);
    const [open, setOpen] = useState(false);

    const handleEditClick = (payment: PaymentStatus) => {
        setEditingPayment({ ...payment });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingPayment(null);
    };

    const handleSave = () => {
        if (editingPayment) {
            setPayments(payments.map(payment =>
                payment.id === editingPayment.id ? editingPayment : payment
            ));
            handleClose();
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
    ) => {
        if (editingPayment) {
            const { name, value } = e.target;
            setEditingPayment({
                ...editingPayment,
                [name]: name === 'amount' ? Number(value) : value
            });
        }
    };

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
                                    <IconButton size="small" onClick={() => handleEditClick(payment)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    編輯收款資訊
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="會員編號"
                                name="memberId"
                                value={editingPayment?.memberId || ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="姓名"
                                name="memberName"
                                value={editingPayment?.memberName || ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="會員類型"
                                name="memberType"
                                value={editingPayment?.memberType || ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="金額"
                                name="amount"
                                type="number"
                                value={editingPayment?.amount || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="到期日"
                                name="dueDate"
                                type="date"
                                value={editingPayment?.dueDate || ''}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>狀態</InputLabel>
                                <Select
                                    name="status"
                                    value={editingPayment?.status || ''}
                                    onChange={handleChange}
                                    label="狀態"
                                >
                                    <MenuItem value="pending">待收款</MenuItem>
                                    <MenuItem value="paid">已收款</MenuItem>
                                    <MenuItem value="overdue">逾期</MenuItem>
                                    <MenuItem value="terminated">終止</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="繳費日期"
                                name="paidDate"
                                type="date"
                                value={editingPayment?.paidDate || ''}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="備註"
                                name="note"
                                multiline
                                rows={4}
                                value={editingPayment?.note || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button onClick={handleSave} variant="contained">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FeePaymentStatus; 