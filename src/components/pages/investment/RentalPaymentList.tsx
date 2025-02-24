import React, { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Box,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Edit as EditIcon } from '@mui/icons-material';
import { RentalPayment, PaymentStatus, PaymentMethod } from '../../../types/investment';
import { parseISO } from 'date-fns';

interface RentalPaymentListProps {
    payments: RentalPayment[];
    onUpdatePayment: (payment: RentalPayment) => Promise<void>;
}

const statusColors: Record<PaymentStatus, 'success' | 'warning' | 'error'> = {
    paid: 'success',
    pending: 'warning',
    overdue: 'error',
};

const statusLabels: Record<PaymentStatus, string> = {
    paid: '已收',
    pending: '未收',
    overdue: '催收',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
    transfer: '轉賬匯款',
    cash: '現金支付',
    linepay: 'Line Pay',
    other: '其他',
};

const RentalPaymentList: React.FC<RentalPaymentListProps> = ({
    payments,
    onUpdatePayment,
}) => {
    const [editingPayment, setEditingPayment] = useState<RentalPayment | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<RentalPayment>>({});

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('zh-TW');
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const ensureDate = (date: Date | string | undefined): Date | undefined => {
        if (!date) return undefined;
        if (date instanceof Date) return date;
        try {
            return parseISO(date);
        } catch {
            return undefined;
        }
    };

    const handleStatusChange = async (payment: RentalPayment, newStatus: PaymentStatus) => {
        const updatedPayment = {
            ...payment,
            status: newStatus,
            paidDate: ensureDate(payment.paidDate),
        };

        if (newStatus === 'paid' && !updatedPayment.paidDate) {
            updatedPayment.paidDate = new Date();
        } else if (newStatus !== 'paid') {
            updatedPayment.paidDate = undefined;
        }

        await onUpdatePayment(updatedPayment);
    };

    const handlePaidDateChange = async (payment: RentalPayment, newDate: Date | null) => {
        const updatedPayment = {
            ...payment,
            status: payment.status,
            paidDate: newDate ? ensureDate(newDate) : undefined,
        };

        if (newDate) {
            updatedPayment.status = 'paid';
        } else {
            updatedPayment.status = 'pending';
        }

        await onUpdatePayment(updatedPayment);
    };

    const handleEditClick = (payment: RentalPayment) => {
        setEditingPayment(payment);
        setEditFormData(payment);
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
        setEditingPayment(null);
        setEditFormData({});
    };

    const handleEditSave = async () => {
        if (editingPayment && editFormData) {
            await onUpdatePayment({
                ...editingPayment,
                ...editFormData,
            });
            handleEditClose();
        }
    };

    // 計算統計資訊
    const statistics = useMemo(() => {
        const totalContractAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalPaidAmount = payments
            .filter(payment => payment.status === 'paid')
            .reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = totalContractAmount - totalPaidAmount;

        return {
            totalContractAmount,
            totalPaidAmount,
            remainingAmount,
        };
    }, [payments]);

    return (
        <>
            {/* 統計資訊區塊 */}
            <Box sx={{
                display: 'flex',
                gap: 4,
                mb: 2,
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 1
            }}>
                <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                        累計已收租金
                    </Typography>
                    <Typography variant="h6" color="success.main">
                        {formatAmount(statistics.totalPaidAmount)}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                        合約內可收租金
                    </Typography>
                    <Typography variant="h6">
                        {formatAmount(statistics.totalContractAmount)}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                        待收租金
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                        {formatAmount(statistics.remainingAmount)}
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>應收月份</TableCell>
                            <TableCell>應收金額</TableCell>
                            <TableCell>收款狀態</TableCell>
                            <TableCell>收款日期</TableCell>
                            <TableCell>收款方式</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>{formatDate(payment.dueDate)}</TableCell>
                                <TableCell>{formatAmount(payment.amount)}</TableCell>
                                <TableCell>
                                    <TextField
                                        select
                                        value={payment.status}
                                        onChange={(e) => handleStatusChange(payment, e.target.value as PaymentStatus)}
                                        size="small"
                                    >
                                        {Object.entries(statusLabels).map(([value, label]) => (
                                            <MenuItem key={value} value={value}>
                                                <Chip
                                                    label={label}
                                                    color={statusColors[value as PaymentStatus]}
                                                    size="small"
                                                />
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
                                <TableCell>
                                    <DatePicker
                                        value={payment.paidDate ? ensureDate(payment.paidDate) : null}
                                        onChange={(date) => handlePaidDateChange(payment, date)}
                                        disabled={payment.status !== 'paid'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        select
                                        size="small"
                                        value={payment.paymentMethod || ''}
                                        onChange={(e) => onUpdatePayment({
                                            ...payment,
                                            paymentMethod: e.target.value as PaymentMethod,
                                        })}
                                        disabled={payment.status !== 'paid'}
                                    >
                                        <MenuItem value="">
                                            <em>請選擇</em>
                                        </MenuItem>
                                        {Object.entries(paymentMethodLabels).map(([value, label]) => (
                                            <MenuItem key={value} value={value}>
                                                {label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEditClick(payment)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 編輯對話框 */}
            <Dialog open={editDialogOpen} onClose={handleEditClose}>
                <DialogTitle>編輯收款記錄</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="應收金額"
                                type="number"
                                value={editFormData.amount || ''}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    amount: parseFloat(e.target.value),
                                })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="收款狀態"
                                value={editFormData.status || 'pending'}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    status: e.target.value as PaymentStatus,
                                    paidDate: e.target.value === 'paid' ? new Date() : undefined,
                                })}
                            >
                                {Object.entries(statusLabels).map(([value, label]) => (
                                    <MenuItem key={value} value={value}>
                                        <Chip
                                            label={label}
                                            color={statusColors[value as PaymentStatus]}
                                            size="small"
                                        />
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <DatePicker
                                label="收款日期"
                                value={editFormData.paidDate ? ensureDate(editFormData.paidDate) : null}
                                onChange={(date) => setEditFormData({
                                    ...editFormData,
                                    paidDate: date ? ensureDate(date) : undefined,
                                })}
                                disabled={editFormData.status !== 'paid'}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="收款方式"
                                value={editFormData.paymentMethod || ''}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    paymentMethod: e.target.value as PaymentMethod,
                                })}
                                disabled={editFormData.status !== 'paid'}
                            >
                                <MenuItem value="">
                                    <em>請選擇</em>
                                </MenuItem>
                                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                                    <MenuItem key={value} value={value}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="備註"
                                value={editFormData.notes || ''}
                                onChange={(e) => setEditFormData({
                                    ...editFormData,
                                    notes: e.target.value,
                                })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>取消</Button>
                    <Button onClick={handleEditSave} variant="contained">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RentalPaymentList; 