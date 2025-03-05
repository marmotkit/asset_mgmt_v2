import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
    Alert,
    InputAdornment,
    TablePagination,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { RentalPayment, PaymentStatus, PaymentMethod } from '../../../types/investment';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';
import { SelectChangeEvent } from '@mui/material';

interface RentalPaymentListProps {
    payments: RentalPayment[];
    onUpdatePayment: (payment: RentalPayment) => Promise<void>;
}

const statusColors: Record<PaymentStatus, 'success' | 'error' | 'warning'> = {
    received: 'success',
    pending: 'warning',
    paid: 'success',
    overdue: 'error',
    cancelled: 'error',
    delayed: 'error'
};

const statusLabels: Record<PaymentStatus, string> = {
    received: '已收',
    pending: '待收',
    paid: '已付',
    overdue: '逾期',
    cancelled: '已取消',
    delayed: '延遲'
};

const paymentMethodOptions = {
    cash: '現金',
    bank_transfer: '銀行轉帳',
    credit_card: '信用卡',
    check: '支票',
    transfer: '匯款',
    other: '其他'
};

const validMethods: PaymentMethod[] = ['transfer', 'cash', 'check'];

const methodLabels: Record<PaymentMethod, string> = {
    cash: '現金',
    bank_transfer: '銀行轉帳',
    credit_card: '信用卡',
    check: '支票',
    transfer: '轉帳',
    other: '其他'
};

const RentalPaymentList: React.FC<RentalPaymentListProps> = ({
    payments = [],
    onUpdatePayment,
}) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [editingPayment, setEditingPayment] = useState<RentalPayment | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<RentalPayment>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updateKey, setUpdateKey] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        console.log('RentalPaymentList 收到的 payments:', payments);
    }, [payments]);

    const formatDate = (date: string): string => {
        return dayjs(date).format('YYYY/MM');
    };

    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const toDateString = (date: string | Date | Dayjs | null | undefined): string | undefined => {
        if (!date) return undefined;
        return dayjs(date).format('YYYY-MM-DD');
    };

    const handleStatusChange = async (payment: RentalPayment, newStatus: PaymentStatus) => {
        try {
            const updatedPayment = { ...payment };
            updatedPayment.status = newStatus;

            if (newStatus === 'received') {
                // 如果改為已收且沒有收款日期，設定為今天
                if (!updatedPayment.paidDate) {
                    updatedPayment.paidDate = dayjs().format('YYYY-MM-DD');
                }
                // 如果改為已收且沒有收款方式，設定預設值
                if (!updatedPayment.paymentMethod) {
                    updatedPayment.paymentMethod = 'transfer' as PaymentMethod;
                }
            } else {
                // 如果改為未收，清除收款相關資訊
                updatedPayment.paidDate = undefined;
                updatedPayment.paymentMethod = undefined as unknown as PaymentMethod;
            }

            console.log('更新付款狀態:', updatedPayment);
            await onUpdatePayment(updatedPayment);
        } catch (error) {
            console.error('更新狀態失敗:', error);
            setError('更新狀態失敗');
        }
    };

    const handleDateChange = async (payment: RentalPayment, newDate: dayjs.Dayjs | null) => {
        try {
            if (!newDate) return;

            const updatedPayment = { ...payment };
            updatedPayment.paidDate = newDate.format('YYYY-MM-DD');

            // 確保狀態為已收
            updatedPayment.status = 'received';

            // 如果沒有收款方式，設定預設值
            if (!updatedPayment.paymentMethod) {
                updatedPayment.paymentMethod = 'transfer';
            }

            console.log('更新收款日期:', updatedPayment);
            await onUpdatePayment(updatedPayment);
        } catch (error) {
            console.error('更新收款日期失敗:', error);
            setError('更新收款日期失敗');
        }
    };

    const handlePaymentMethodChange = async (payment: RentalPayment, newMethod: PaymentMethod) => {
        try {
            const updatedPayment = { ...payment };
            updatedPayment.paymentMethod = newMethod;

            // 確保狀態為已收
            updatedPayment.status = 'received';

            // 如果沒有收款日期，設定為今天
            if (!updatedPayment.paidDate) {
                updatedPayment.paidDate = dayjs().format('YYYY-MM-DD');
            }

            console.log('更新付款方式:', updatedPayment);
            await onUpdatePayment(updatedPayment);
        } catch (error) {
            console.error('更新付款方式失敗:', error);
            setError('更新付款方式失敗');
        }
    };

    const handleEditClick = (payment: RentalPayment) => {
        setEditingPayment(payment);
        setEditFormData({ ...payment });
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
        setEditingPayment(null);
        setEditFormData({});
    };

    const handleEditSubmit = async () => {
        if (!editFormData.id) return;
        setError(null);

        if (!editFormData.dueDate) {
            setError('應收日期不能為空');
            return;
        }

        if (!editFormData.amount || editFormData.amount <= 0) {
            setError('應收金額必須大於 0');
            return;
        }

        setSubmitting(true);
        try {
            const updatedPayment: RentalPayment = {
                id: editFormData.id,
                leaseItemId: editFormData.leaseItemId || '',
                dueDate: editFormData.dueDate,
                amount: editFormData.amount,
                status: editFormData.status || 'pending',
                paidDate: editFormData.status === 'received' ?
                    (editFormData.paidDate || dayjs().format('YYYY-MM-DD')) :
                    undefined,
                paymentMethod: editFormData.status === 'received' ?
                    (editFormData.paymentMethod || 'transfer' as PaymentMethod) :
                    'transfer' as PaymentMethod,
                notes: editFormData.notes,
                createdAt: editFormData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            console.log('更新的租金收款記錄:', updatedPayment);
            await onUpdatePayment(updatedPayment);

            setUpdateKey(prev => prev + 1);
            handleEditClose();
        } catch (error) {
            console.error('更新租金收款記錄失敗:', error);
            setError('更新租金收款記錄失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditDateChange = (
        newDate: Dayjs | null,
        isPaymentDate: boolean
    ) => {
        if (!editingPayment) return;

        const formattedDate = toDateString(newDate);
        const updatedFormData = {
            ...editFormData,
            dueDate: !isPaymentDate ? formattedDate : editFormData.dueDate,
            paidDate: isPaymentDate ? formattedDate : editFormData.paidDate,
            status: isPaymentDate && formattedDate ? 'received' : editFormData.status,
            paymentMethod: isPaymentDate && formattedDate ?
                (editFormData.paymentMethod || 'transfer' as PaymentMethod) :
                editFormData.paymentMethod
        };
        console.log('更新表單數據:', updatedFormData);
        setEditFormData(updatedFormData);
    };

    const statistics = useMemo(() => {
        const totalContractAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalPaidAmount = payments
            .filter(payment => payment.status === 'received')
            .reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = totalContractAmount - totalPaidAmount;

        return {
            totalContractAmount,
            totalPaidAmount,
            remainingAmount,
        };
    }, [payments]);

    const handleEdit = (payment: RentalPayment) => {
        setEditingId(payment.id);
        setEditingPayment({ ...payment });
    };

    const handleSave = async () => {
        if (!editingPayment || !editingId) return;

        try {
            await onUpdatePayment(editingPayment);
            setEditingId(null);
            setEditingPayment(null);
        } catch (error) {
            console.error('更新失敗:', error);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditingPayment(null);
    };

    const handleChange = (field: keyof RentalPayment, value: any) => {
        if (!editingPayment) return;

        const updatedPayment: RentalPayment = {
            ...editingPayment,
            [field]: value,
            status: field === 'status' ? (value as PaymentStatus) : editingPayment.status
        };

        // 如果狀態改為已收款，自動設定收款日期為今天
        if (field === 'status' && value === 'received' && !updatedPayment.paidDate) {
            updatedPayment.paidDate = dayjs().format('YYYY-MM-DD');
            updatedPayment.paymentMethod = updatedPayment.paymentMethod || 'transfer' as PaymentMethod;
        }

        // 如果狀態改為待收或延遲，清除收款日期和方式
        if (field === 'status' && (value === 'pending' || value === 'delayed')) {
            updatedPayment.paidDate = undefined;
            updatedPayment.paymentMethod = 'transfer' as PaymentMethod;
        }

        setEditingPayment(updatedPayment);
    };

    const handleMethodChange = (event: SelectChangeEvent<PaymentMethod>) => {
        if (!editingPayment) return;

        const newPayment: RentalPayment = {
            ...editingPayment,
            paymentMethod: event.target.value as PaymentMethod
        };
        setEditingPayment(newPayment);
    };

    return (
        <div key={updateKey}>
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

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

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
                        {payments.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>{formatDate(payment.dueDate)}</TableCell>
                                <TableCell>{formatAmount(payment.amount)}</TableCell>
                                <TableCell>
                                    {editingId === payment.id ? (
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={editingPayment?.status || 'pending'}
                                                onChange={(e) => handleChange('status', e.target.value as PaymentStatus)}
                                            >
                                                <MenuItem value="pending">待收款</MenuItem>
                                                <MenuItem value="received">已收款</MenuItem>
                                                <MenuItem value="delayed">延遲</MenuItem>
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <Chip
                                            label={statusLabels[payment.status]}
                                            color={statusColors[payment.status]}
                                            size="small"
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === payment.id ? (
                                        <DatePicker
                                            value={editingPayment?.paidDate ? dayjs(editingPayment.paidDate) : null}
                                            onChange={(newDate) => handleChange('paidDate', newDate?.toISOString())}
                                            disabled={editingPayment?.status !== 'received'}
                                            format="YYYY/MM/DD"
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    fullWidth: true
                                                }
                                            }}
                                        />
                                    ) : (
                                        payment.paidDate && dayjs(payment.paidDate).format('YYYY-MM-DD')
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === payment.id ? (
                                        <FormControl fullWidth>
                                            <InputLabel>付款方式</InputLabel>
                                            <Select
                                                value={editingPayment?.paymentMethod || 'transfer'}
                                                onChange={handleMethodChange}
                                                label="付款方式"
                                            >
                                                {Object.entries(methodLabels).map(([method, label]) => (
                                                    <MenuItem key={method} value={method}>
                                                        {label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        methodLabels[payment.paymentMethod] || payment.paymentMethod
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === payment.id ? (
                                        <>
                                            <IconButton onClick={handleSave} size="small" color="primary">
                                                <SaveIcon />
                                            </IconButton>
                                            <IconButton onClick={handleCancel} size="small" color="error">
                                                <CancelIcon />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <IconButton onClick={() => handleEdit(payment)} size="small">
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={payments.length}
                page={currentPage}
                onPageChange={(e, newPage) => setCurrentPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setCurrentPage(0);
                }}
                labelRowsPerPage="每頁筆數"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 筆`}
            />

            <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
                <DialogTitle>編輯收款記錄</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <DatePicker
                                label="應收日期"
                                value={editFormData.dueDate ? dayjs(editFormData.dueDate) : null}
                                onChange={(newDate) => handleEditDateChange(newDate, false)}
                                format="YYYY/MM/DD"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: false
                                    }
                                }}
                            />
                        </Grid>
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
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">NT$</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="收款狀態"
                                value={editFormData.status || 'pending'}
                                onChange={(e) => {
                                    const value = e.target.value as PaymentStatus;
                                    setEditFormData({
                                        ...editFormData,
                                        status: value,
                                        paidDate: value === 'received' ? dayjs().format('YYYY-MM-DD') : undefined,
                                        paymentMethod: value === 'received' ?
                                            (editFormData.paymentMethod || 'transfer' as PaymentMethod) :
                                            'transfer' as PaymentMethod
                                    });
                                }}
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
                                value={editFormData.paidDate ? dayjs(editFormData.paidDate as string) : null}
                                onChange={(newDate: Dayjs | null) => handleEditDateChange(newDate, true)}
                                disabled={editFormData.status !== 'received'}
                                format="YYYY/MM/DD"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: false
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>付款方式</InputLabel>
                                <Select
                                    value={editFormData.paymentMethod || ''}
                                    onChange={(e) => {
                                        const value = e.target.value as PaymentMethod;
                                        if (typeof value === 'string' && validMethods.includes(value)) {
                                            setEditFormData({
                                                ...editFormData,
                                                paymentMethod: value,
                                            });
                                        }
                                    }}
                                    label="付款方式"
                                >
                                    {Object.entries(methodLabels).map(([method, label]) => (
                                        <MenuItem key={method} value={method}>
                                            {label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                    <Button onClick={handleEditClose} disabled={submitting}>取消</Button>
                    <Button
                        onClick={handleEditSubmit}
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? '儲存中...' : '儲存'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RentalPaymentList; 