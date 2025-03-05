import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { RentalPayment, PaymentStatus, PaymentMethod } from '../../../types/investment';
import dayjs from 'dayjs';

interface PaymentManagerProps {
    open: boolean;
    onClose: () => void;
    investmentName: string;
    startDate: string;
    endDate: string;
    monthlyRental: number;
    payments: RentalPayment[];
    onUpdatePayment: (payment: RentalPayment) => Promise<void>;
    onUpdateProfitSharing: (percentage: number) => Promise<void>;
}

const statusColors: Record<PaymentStatus, 'success' | 'warning' | 'error'> = {
    received: 'success',
    pending: 'warning',
    delayed: 'error'
};

const statusLabels: Record<PaymentStatus, string> = {
    received: '已收',
    pending: '待收',
    delayed: '延遲'
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
    transfer: '轉帳匯款',
    cash: '現金',
    check: '支票'
};

const PaymentManager: React.FC<PaymentManagerProps> = ({
    open,
    onClose,
    investmentName,
    startDate,
    endDate,
    monthlyRental,
    payments,
    onUpdatePayment,
    onUpdateProfitSharing,
}) => {
    const [editingPayment, setEditingPayment] = useState<RentalPayment | null>(null);
    const [profitSharingPercentage, setProfitSharingPercentage] = useState(0);

    // 計算統計數據
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const receivedAmount = payments
        .filter(p => p.status === 'received')
        .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = totalAmount - receivedAmount;

    const handleStatusChange = async (payment: RentalPayment, newStatus: PaymentStatus) => {
        const updatedPayment = { ...payment, status: newStatus };

        if (newStatus === 'received' && !updatedPayment.paidDate) {
            updatedPayment.paidDate = dayjs().format('YYYY-MM-DD');
            updatedPayment.paymentMethod = updatedPayment.paymentMethod || 'transfer';
        } else if (newStatus !== 'received') {
            updatedPayment.paidDate = undefined;
            updatedPayment.paymentMethod = undefined;
        }

        await onUpdatePayment(updatedPayment);
    };

    const handlePaymentMethodChange = async (payment: RentalPayment, method: PaymentMethod) => {
        const updatedPayment = {
            ...payment,
            paymentMethod: method,
            status: 'received' as PaymentStatus,
            paidDate: payment.paidDate || dayjs().format('YYYY-MM-DD')
        };
        await onUpdatePayment(updatedPayment);
    };

    const handlePaidDateChange = async (payment: RentalPayment, date: dayjs.Dayjs | null) => {
        if (!date) return;

        const updatedPayment = {
            ...payment,
            paidDate: date.format('YYYY-MM-DD'),
            status: 'received' as PaymentStatus,
            paymentMethod: payment.paymentMethod || 'transfer'
        };
        await onUpdatePayment(updatedPayment);
    };

    const handleAmountChange = async (payment: RentalPayment, amount: number) => {
        const updatedPayment = { ...payment, amount };
        await onUpdatePayment(updatedPayment);
    };

    const handleProfitSharingUpdate = async () => {
        await onUpdateProfitSharing(profitSharingPercentage);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                {investmentName} - 租金與分潤管理
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    {/* 統計資訊 */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        已收租金
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        NT$ {receivedAmount.toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        待收租金
                                    </Typography>
                                    <Typography variant="h4" color="warning.main">
                                        NT$ {pendingAmount.toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        總計租金
                                    </Typography>
                                    <Typography variant="h4">
                                        NT$ {totalAmount.toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* 租金收款列表 */}
                    <Grid item xs={12}>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>收款月份</TableCell>
                                        <TableCell align="right">應收金額</TableCell>
                                        <TableCell>收款狀態</TableCell>
                                        <TableCell>收款日期</TableCell>
                                        <TableCell>收款方式</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {dayjs(payment.dueDate).format('YYYY-MM')}
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number"
                                                    value={payment.amount}
                                                    onChange={(e) => handleAmountChange(payment, Number(e.target.value))}
                                                    size="small"
                                                    sx={{ width: 120 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                                    <Select
                                                        value={payment.status}
                                                        onChange={(e) => handleStatusChange(payment, e.target.value as PaymentStatus)}
                                                    >
                                                        {Object.entries(statusLabels).map(([value, label]) => (
                                                            <MenuItem key={value} value={value}>
                                                                <Chip
                                                                    label={label}
                                                                    size="small"
                                                                    color={statusColors[value as PaymentStatus]}
                                                                />
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>
                                                <DatePicker
                                                    value={payment.paidDate ? dayjs(payment.paidDate) : null}
                                                    onChange={(date) => handlePaidDateChange(payment, date)}
                                                    disabled={payment.status !== 'received'}
                                                    format="YYYY-MM-DD"
                                                    slotProps={{
                                                        textField: { size: 'small' }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                                    <Select
                                                        value={payment.paymentMethod || ''}
                                                        onChange={(e) => handlePaymentMethodChange(payment, e.target.value as PaymentMethod)}
                                                        disabled={payment.status !== 'received'}
                                                    >
                                                        <MenuItem value="">
                                                            <em>請選擇</em>
                                                        </MenuItem>
                                                        {Object.entries(paymentMethodLabels).map(([value, label]) => (
                                                            <MenuItem key={value} value={value}>
                                                                {label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    {/* 分潤設定 */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                分潤設定
                            </Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="分潤比例"
                                        type="number"
                                        value={profitSharingPercentage}
                                        onChange={(e) => setProfitSharingPercentage(Number(e.target.value))}
                                        InputProps={{
                                            endAdornment: '%'
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Button
                                        variant="contained"
                                        onClick={handleProfitSharingUpdate}
                                    >
                                        更新分潤設定
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>關閉</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentManager; 