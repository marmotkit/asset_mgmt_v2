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
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Typography,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    CircularProgress,
    InputAdornment,
    FormHelperText
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { AccountReceivable } from '../../../../types/payment';
import { accountingService } from '../../../../services/accounting.service';

// 應收帳款狀態選項
const statusOptions = [
    { value: 'pending', label: '待付款', color: 'warning' },
    { value: 'partially_paid', label: '部分付款', color: 'info' },
    { value: 'paid', label: '已付款', color: 'success' },
    { value: 'overdue', label: '逾期', color: 'error' }
];

// 初始表單數據
const initialFormData = {
    date: dayjs().format('YYYY-MM-DD'),
    dueDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    clientName: '',
    amount: 0,
    paidAmount: 0,
    status: 'pending' as 'pending' | 'partially_paid' | 'paid' | 'overdue',
    description: '',
    invoiceNumber: ''
};

const ReceivablesTab: React.FC = () => {
    // 狀態變數
    const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [editingReceivable, setEditingReceivable] = useState<AccountReceivable | null>(null);
    const [formData, setFormData] = useState<typeof initialFormData>(initialFormData);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [receivableToDelete, setReceivableToDelete] = useState<string | null>(null);

    // 載入資料
    useEffect(() => {
        loadReceivables();
    }, []);

    const loadReceivables = async () => {
        setLoading(true);
        try {
            const data = await accountingService.getReceivables();
            setReceivables(data);
        } catch (error) {
            console.error('獲取應收帳款失敗:', error);
            setSnackbar({
                open: true,
                message: '獲取應收帳款失敗',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // 過濾和搜尋記錄
    const filteredReceivables = receivables.filter(receivable => {
        // 依照狀態過濾
        if (filterStatus !== 'all' && receivable.status !== filterStatus) {
            return false;
        }

        // 依照搜尋條件過濾
        const searchLower = searchTerm.toLowerCase();
        return (
            receivable.clientName.toLowerCase().includes(searchLower) ||
            receivable.description.toLowerCase().includes(searchLower) ||
            (receivable.invoiceNumber && receivable.invoiceNumber.toLowerCase().includes(searchLower))
        );
    });

    // 處理對話框
    const handleOpenDialog = (receivable?: AccountReceivable) => {
        if (receivable) {
            setEditingReceivable(receivable);
            setFormData({
                date: receivable.date,
                dueDate: receivable.dueDate,
                clientName: receivable.clientName,
                amount: receivable.amount,
                paidAmount: receivable.paidAmount,
                status: receivable.status,
                description: receivable.description,
                invoiceNumber: receivable.invoiceNumber || ''
            });
        } else {
            setEditingReceivable(null);
            setFormData(initialFormData);
        }
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    // 處理付款對話框
    const handleOpenPaymentDialog = (receivable: AccountReceivable) => {
        setEditingReceivable(receivable);
        setPaymentAmount(receivable.amount - receivable.paidAmount);
        setPaymentDialogOpen(true);
    };

    const handleClosePaymentDialog = () => {
        setPaymentDialogOpen(false);
    };

    // 處理表單變更
    const handleFormChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));

        // 清除錯誤
        if (formErrors[field]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // 表單驗證
    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!formData.date) {
            errors.date = '請選擇日期';
        }

        if (!formData.dueDate) {
            errors.dueDate = '請選擇到期日';
        }

        if (!formData.clientName.trim()) {
            errors.clientName = '請輸入客戶名稱';
        }

        if (!formData.amount || formData.amount <= 0) {
            errors.amount = '請輸入有效金額';
        }

        if (!formData.description.trim()) {
            errors.description = '請輸入描述';
        }

        if (dayjs(formData.dueDate).isBefore(dayjs(formData.date))) {
            errors.dueDate = '到期日不能早於建立日期';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 處理提交
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            if (editingReceivable) {
                // 更新記錄
                const updatedReceivable = await accountingService.updateReceivable(editingReceivable.id, formData);
                setReceivables(prev => prev.map(item => item.id === updatedReceivable.id ? updatedReceivable : item));
                setSnackbar({
                    open: true,
                    message: '應收帳款已更新',
                    severity: 'success'
                });
            } else {
                // 新增記錄
                const newReceivable = await accountingService.addReceivable({
                    ...formData,
                    paidAmount: 0,
                    status: 'pending' as 'pending' | 'partially_paid' | 'paid' | 'overdue'
                });
                setReceivables(prev => [...prev, newReceivable]);
                setSnackbar({
                    open: true,
                    message: '應收帳款已新增',
                    severity: 'success'
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error('儲存應收帳款失敗:', error);
            setSnackbar({
                open: true,
                message: '儲存應收帳款失敗',
                severity: 'error'
            });
        }
    };

    // 處理付款提交
    const handlePaymentSubmit = async () => {
        if (!editingReceivable) return;

        if (paymentAmount <= 0 || paymentAmount > (editingReceivable.amount - editingReceivable.paidAmount)) {
            setSnackbar({
                open: true,
                message: '請輸入有效的付款金額',
                severity: 'error'
            });
            return;
        }

        try {
            const newPaidAmount = editingReceivable.paidAmount + paymentAmount;
            const newStatus = (
                newPaidAmount >= editingReceivable.amount ? 'paid' :
                    newPaidAmount > 0 ? 'partially_paid' : 'pending'
            ) as 'pending' | 'partially_paid' | 'paid' | 'overdue';

            const updatedReceivable = await accountingService.updateReceivable(editingReceivable.id, {
                paidAmount: newPaidAmount,
                status: newStatus
            });

            setReceivables(prev => prev.map(item => item.id === updatedReceivable.id ? updatedReceivable : item));

            setSnackbar({
                open: true,
                message: '付款已記錄',
                severity: 'success'
            });

            handleClosePaymentDialog();
        } catch (error) {
            console.error('記錄付款失敗:', error);
            setSnackbar({
                open: true,
                message: '記錄付款失敗',
                severity: 'error'
            });
        }
    };

    // 處理刪除
    const handleDeleteClick = (id: string) => {
        setReceivableToDelete(id);
        setConfirmDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!receivableToDelete) return;

        try {
            const success = await accountingService.deleteReceivable(receivableToDelete);
            if (success) {
                setReceivables(prev => prev.filter(item => item.id !== receivableToDelete));
                setSnackbar({
                    open: true,
                    message: '應收帳款已刪除',
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error('刪除應收帳款失敗:', error);
            setSnackbar({
                open: true,
                message: '刪除應收帳款失敗',
                severity: 'error'
            });
        } finally {
            setConfirmDeleteOpen(false);
            setReceivableToDelete(null);
        }
    };

    // 計算帳齡
    const calculateAge = (dueDate: string) => {
        const today = dayjs();
        const due = dayjs(dueDate);

        if (due.isAfter(today)) {
            return 0; // 未到期
        }

        return today.diff(due, 'day');
    };

    // 取得狀態顯示樣式
    const getStatusChip = (status: string) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return (
            <Chip
                label={statusOption?.label || status}
                color={statusOption?.color as any || 'default'}
                size="small"
            />
        );
    };

    // 渲染內容
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">應收帳款</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    新增應收帳款
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            placeholder="搜尋客戶、描述或發票號碼"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>狀態</InputLabel>
                            <Select
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                                label="狀態"
                            >
                                <MenuItem value="all">全部</MenuItem>
                                {statusOptions.map(status => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                        <Typography>
                            總計: {filteredReceivables.reduce((sum, item) => sum + (item.amount - item.paidAmount), 0).toLocaleString()} 元
                        </Typography>
                        <Typography>
                            共 {filteredReceivables.length} 筆記錄
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>客戶</TableCell>
                                <TableCell>日期</TableCell>
                                <TableCell>到期日</TableCell>
                                <TableCell>描述</TableCell>
                                <TableCell align="right">金額</TableCell>
                                <TableCell align="right">已付金額</TableCell>
                                <TableCell align="right">餘額</TableCell>
                                <TableCell>狀態</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredReceivables.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        無符合條件的應收帳款
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReceivables.map(receivable => {
                                    const age = calculateAge(receivable.dueDate);
                                    const balance = receivable.amount - receivable.paidAmount;

                                    return (
                                        <TableRow
                                            key={receivable.id}
                                            sx={age > 0 && receivable.status !== 'paid' ? { bgcolor: 'rgba(255, 0, 0, 0.05)' } : {}}
                                        >
                                            <TableCell>{receivable.clientName}</TableCell>
                                            <TableCell>{receivable.date}</TableCell>
                                            <TableCell>
                                                {receivable.dueDate}
                                                {age > 0 && receivable.status !== 'paid' && (
                                                    <Typography variant="caption" color="error" component="div">
                                                        逾期 {age} 天
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>{receivable.description}</TableCell>
                                            <TableCell align="right">{receivable.amount.toLocaleString()}</TableCell>
                                            <TableCell align="right">{receivable.paidAmount.toLocaleString()}</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: balance > 0 ? 'error.main' : 'success.main'
                                                }}
                                            >
                                                {balance.toLocaleString()}
                                            </TableCell>
                                            <TableCell>{getStatusChip(receivable.status)}</TableCell>
                                            <TableCell align="right">
                                                {balance > 0 && (
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleOpenPaymentDialog(receivable)}
                                                        title="記錄付款"
                                                    >
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenDialog(receivable)}
                                                    title="編輯"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(receivable.id)}
                                                    title="刪除"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* 新增/編輯對話框 */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingReceivable ? '編輯應收帳款' : '新增應收帳款'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="客戶名稱"
                                value={formData.clientName}
                                onChange={e => handleFormChange('clientName', e.target.value)}
                                margin="normal"
                                error={!!formErrors.clientName}
                                helperText={formErrors.clientName}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="發票號碼"
                                value={formData.invoiceNumber}
                                onChange={e => handleFormChange('invoiceNumber', e.target.value)}
                                margin="normal"
                                placeholder="選填"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="建立日期"
                                    value={dayjs(formData.date)}
                                    onChange={(value: Dayjs | null) =>
                                        handleFormChange('date', value ? value.format('YYYY-MM-DD') : '')
                                    }
                                    format="YYYY/MM/DD"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            margin: 'normal',
                                            error: !!formErrors.date,
                                            helperText: formErrors.date
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="到期日"
                                    value={dayjs(formData.dueDate)}
                                    onChange={(value: Dayjs | null) =>
                                        handleFormChange('dueDate', value ? value.format('YYYY-MM-DD') : '')
                                    }
                                    format="YYYY/MM/DD"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            margin: 'normal',
                                            error: !!formErrors.dueDate,
                                            helperText: formErrors.dueDate
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="金額"
                                type="number"
                                value={formData.amount}
                                onChange={e => handleFormChange('amount', parseFloat(e.target.value) || 0)}
                                margin="normal"
                                error={!!formErrors.amount}
                                helperText={formErrors.amount}
                            />
                        </Grid>
                        {editingReceivable && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="已付金額"
                                    type="number"
                                    value={formData.paidAmount}
                                    onChange={e => handleFormChange('paidAmount', parseFloat(e.target.value) || 0)}
                                    margin="normal"
                                    inputProps={{ readOnly: true }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="描述"
                                value={formData.description}
                                onChange={e => handleFormChange('description', e.target.value)}
                                margin="normal"
                                multiline
                                rows={2}
                                error={!!formErrors.description}
                                helperText={formErrors.description}
                            />
                        </Grid>
                        {editingReceivable && (
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>狀態</InputLabel>
                                    <Select
                                        value={formData.status}
                                        onChange={e => handleFormChange('status', e.target.value as 'pending' | 'partially_paid' | 'paid' | 'overdue')}
                                        label="狀態"
                                    >
                                        {statusOptions.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>取消</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 付款對話框 */}
            <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
                <DialogTitle>記錄付款</DialogTitle>
                <DialogContent>
                    {editingReceivable && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1">
                                    客戶: {editingReceivable.clientName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {editingReceivable.description}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    總金額: {editingReceivable.amount.toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    已付金額: {editingReceivable.paidAmount.toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    尚欠金額: {(editingReceivable.amount - editingReceivable.paidAmount).toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    label="本次付款金額"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                    inputProps={{
                                        min: 0,
                                        max: editingReceivable.amount - editingReceivable.paidAmount
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePaymentDialog}>取消</Button>
                    <Button
                        onClick={handlePaymentSubmit}
                        variant="contained"
                        color="primary"
                        disabled={
                            !editingReceivable ||
                            paymentAmount <= 0 ||
                            paymentAmount > (editingReceivable?.amount - editingReceivable?.paidAmount)
                        }
                    >
                        確認付款
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 刪除確認對話框 */}
            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    <Typography>確定要刪除此筆應收帳款嗎？此操作無法復原。</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)}>取消</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        刪除
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 通知訊息 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ReceivablesTab; 