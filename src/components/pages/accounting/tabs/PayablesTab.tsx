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
    FormHelperText,
    TableSortLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Payment as PaymentIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { AccountPayable } from '../../../../types/payment';
import { payablesApiService } from '../../../../services/accountingApi.service';

// 排序類型定義
type Order = 'asc' | 'desc';
type OrderBy = 'supplier_name' | 'due_date' | 'amount' | 'payment_amount' | 'status' | 'description';

// 排序狀態介面
interface SortState {
    order: Order;
    orderBy: OrderBy;
}

// 應付帳款狀態選項
const statusOptions = [
    { value: 'pending', label: '待付款', color: 'warning' },
    { value: 'partially_paid', label: '部分付款', color: 'info' },
    { value: 'paid', label: '已付款', color: 'success' },
    { value: 'overdue', label: '逾期', color: 'error' }
];

// 付款方式選項
const paymentMethodOptions = [
    { value: 'cash', label: '現金' },
    { value: 'bank_transfer', label: '銀行轉帳' },
    { value: 'credit_card', label: '信用卡' },
    { value: 'check', label: '支票' },
    { value: 'transfer', label: '轉帳' },
    { value: 'other', label: '其他' }
];

// 初始表單數據
const initialFormData = {
    date: dayjs().format('YYYY-MM-DD'),
    dueDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    supplier_name: '',
    amount: 0,
    paidAmount: 0,
    status: 'pending' as 'pending' | 'partially_paid' | 'paid' | 'overdue',
    description: '',
    invoiceNumber: ''
};

const PayablesTab: React.FC = () => {
    // 狀態變數
    const [payables, setPayables] = useState<AccountPayable[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [editingPayable, setEditingPayable] = useState<AccountPayable | null>(null);
    const [formData, setFormData] = useState({
        supplier_name: '',
        invoiceNumber: '',
        date: dayjs().format('YYYY-MM-DD'),
        dueDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
        amount: 0,
        paidAmount: 0,
        description: '',
        status: 'pending' as 'pending' | 'partially_paid' | 'paid' | 'overdue'
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        method: 'bank_transfer' as string
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [payableToDelete, setPayableToDelete] = useState<string | null>(null);

    // 排序狀態
    const [sort, setSort] = useState<SortState>({
        order: 'asc',
        orderBy: 'due_date'
    });

    // 載入資料
    useEffect(() => {
        loadPayables();
    }, []);

    const loadPayables = async () => {
        setLoading(true);
        try {
            const data = await payablesApiService.getPayables();
            setPayables(data);
        } catch (error) {
            console.error('獲取應付帳款失敗:', error);
            setSnackbar({
                open: true,
                message: '獲取應付帳款失敗',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // 過濾和搜尋記錄
    const filteredPayables = payables.filter(payable => {
        // 狀態過濾
        if (filterStatus !== 'all' && payable.status !== filterStatus) {
            return false;
        }
        // 搜尋條件過濾，所有欄位都要先檢查是否存在
        const searchLower = (searchTerm || '').toLowerCase();
        return (
            (payable.supplier_name && payable.supplier_name.toLowerCase().includes(searchLower)) ||
            (payable.description && payable.description.toLowerCase().includes(searchLower)) ||
            (payable.invoice_number && payable.invoice_number.toLowerCase().includes(searchLower))
        );
    });

    // 排序邏輯
    const stableSort = <T extends { id: string }>(array: T[], comparator: (a: T, b: T) => number) => {
        const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) {
                return order;
            }
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    };

    const getComparator = (
        order: Order,
        orderBy: OrderBy,
    ): ((a: AccountPayable, b: AccountPayable) => number) => {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    };

    const descendingComparator = (a: AccountPayable, b: AccountPayable, orderBy: OrderBy) => {
        let aValue: any = a[orderBy];
        let bValue: any = b[orderBy];

        // 特殊處理日期和數值
        if (orderBy === 'due_date') {
            aValue = aValue ? new Date(aValue).getTime() : 0;
            bValue = bValue ? new Date(bValue).getTime() : 0;
        } else if (orderBy === 'amount' || orderBy === 'payment_amount') {
            aValue = aValue || 0;
            bValue = bValue || 0;
        } else {
            aValue = aValue || '';
            bValue = bValue || '';
        }

        if (bValue < aValue) {
            return -1;
        }
        if (bValue > aValue) {
            return 1;
        }
        return 0;
    };

    // 應用排序
    const sortedPayables = stableSort(filteredPayables, getComparator(sort.order, sort.orderBy));

    // 處理對話框
    const handleOpenDialog = (payable?: AccountPayable) => {
        if (payable) {
            setEditingPayable(payable);
            setFormData({
                supplier_name: payable.supplier_name,
                invoiceNumber: payable.invoice_number || '',
                date: payable.due_date,
                dueDate: payable.due_date,
                amount: payable.amount,
                paidAmount: payable.payment_amount || 0,
                description: payable.description,
                status: payable.status
            });
        } else {
            setEditingPayable(null);
            setFormData(initialFormData);
        }
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    // 處理付款對話框
    const handleOpenPaymentDialog = (payable: AccountPayable) => {
        setEditingPayable(payable);
        setPaymentData({
            amount: payable.amount - payable.payment_amount,
            method: 'bank_transfer'
        });
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

        if (!formData.supplier_name.trim()) {
            errors.supplier_name = '請輸入供應商名稱';
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
            if (editingPayable) {
                // 更新記錄
                const updatedPayable = await payablesApiService.updatePayable(editingPayable.id, formData);
                setPayables(prev => prev.map(item => item.id === updatedPayable.id ? updatedPayable : item));
                setSnackbar({
                    open: true,
                    message: '應付帳款已更新',
                    severity: 'success'
                });
            } else {
                // 新增記錄
                const newPayable = await payablesApiService.createPayable({
                    ...formData,
                    paidAmount: 0,
                    status: 'pending' as 'pending' | 'partially_paid' | 'paid' | 'overdue'
                });
                setPayables(prev => [...prev, newPayable]);
                setSnackbar({
                    open: true,
                    message: '應付帳款已新增',
                    severity: 'success'
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error('儲存應付帳款失敗:', error);
            setSnackbar({
                open: true,
                message: '儲存應付帳款失敗',
                severity: 'error'
            });
        }
    };

    // 處理付款提交
    const handlePaymentSubmit = async () => {
        if (!editingPayable) return;

        if (paymentData.amount <= 0 || paymentData.amount > (editingPayable.amount - editingPayable.payment_amount)) {
            setSnackbar({
                open: true,
                message: '請輸入有效的付款金額',
                severity: 'error'
            });
            return;
        }

        try {
            const newPaidAmount = editingPayable.payment_amount + paymentData.amount;
            const newStatus = (
                newPaidAmount >= editingPayable.amount ? 'paid' :
                    newPaidAmount > 0 ? 'partially_paid' : 'pending'
            ) as 'pending' | 'partially_paid' | 'paid' | 'overdue';

            // 這裡也可以添加會計記錄功能，記錄支出

            const updatedPayable = await payablesApiService.updatePayable(editingPayable.id, {
                payment_amount: newPaidAmount,
                status: newStatus
            });

            setPayables(prev => prev.map(item => item.id === updatedPayable.id ? updatedPayable : item));

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
        setPayableToDelete(id);
        setConfirmDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!payableToDelete) return;

        try {
            const success = await payablesApiService.deletePayable(payableToDelete);
            if (success) {
                setPayables(prev => prev.filter(item => item.id !== payableToDelete));
                setSnackbar({
                    open: true,
                    message: '應付帳款已刪除',
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error('刪除應付帳款失敗:', error);
            setSnackbar({
                open: true,
                message: '刪除應付帳款失敗',
                severity: 'error'
            });
        } finally {
            setConfirmDeleteOpen(false);
            setPayableToDelete(null);
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

    // 處理排序請求
    const handleRequestSort = (property: OrderBy) => {
        const isAsc = sort.orderBy === property && sort.order === 'asc';
        setSort({
            order: isAsc ? 'desc' : 'asc',
            orderBy: property
        });
    };

    // 渲染內容
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">應付帳款</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    新增應付帳款
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            placeholder="搜尋供應商、描述或發票號碼"
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
                            總計: {filteredPayables.reduce((sum, item) => sum + ((item.amount || 0) - (item.payment_amount || 0)), 0).toLocaleString()} 元
                        </Typography>
                        <Typography>
                            共 {filteredPayables.length} 筆記錄
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
                                <TableCell>
                                    <TableSortLabel
                                        active={sort.orderBy === 'supplier_name'}
                                        direction={sort.orderBy === 'supplier_name' ? sort.order : 'asc'}
                                        onClick={() => handleRequestSort('supplier_name')}
                                    >
                                        供應商
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sort.orderBy === 'due_date'}
                                        direction={sort.orderBy === 'due_date' ? sort.order : 'asc'}
                                        onClick={() => handleRequestSort('due_date')}
                                    >
                                        到期日
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sort.orderBy === 'description'}
                                        direction={sort.orderBy === 'description' ? sort.order : 'asc'}
                                        onClick={() => handleRequestSort('description')}
                                    >
                                        描述
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="right">
                                    <TableSortLabel
                                        active={sort.orderBy === 'amount'}
                                        direction={sort.orderBy === 'amount' ? sort.order : 'asc'}
                                        onClick={() => handleRequestSort('amount')}
                                    >
                                        金額
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="right">
                                    <TableSortLabel
                                        active={sort.orderBy === 'payment_amount'}
                                        direction={sort.orderBy === 'payment_amount' ? sort.order : 'asc'}
                                        onClick={() => handleRequestSort('payment_amount')}
                                    >
                                        已付金額
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="right">餘額</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sort.orderBy === 'status'}
                                        direction={sort.orderBy === 'status' ? sort.order : 'asc'}
                                        onClick={() => handleRequestSort('status')}
                                    >
                                        狀態
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedPayables.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        無符合條件的應付帳款
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedPayables.map(payable => {
                                    const balance = (payable.amount || 0) - (payable.payment_amount || 0);

                                    return (
                                        <TableRow
                                            key={payable.id}
                                            sx={balance > 0 ? { bgcolor: 'rgba(255, 152, 0, 0.05)' } : {}}
                                        >
                                            <TableCell>{payable.supplier_name || '-'}</TableCell>
                                            <TableCell>{payable.due_date ? dayjs(payable.due_date).format('YYYY/MM/DD') : '-'}</TableCell>
                                            <TableCell>{payable.description || '-'}</TableCell>
                                            <TableCell align="right">{(payable.amount || 0).toLocaleString()}</TableCell>
                                            <TableCell align="right">{(payable.payment_amount || 0).toLocaleString()}</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: balance > 0 ? 'error.main' : 'success.main'
                                                }}
                                            >
                                                {(balance || 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{getStatusChip(payable.status)}</TableCell>
                                            <TableCell align="right">
                                                {balance > 0 && (
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleOpenPaymentDialog(payable)}
                                                        title="執行付款"
                                                    >
                                                        <PaymentIcon />
                                                    </IconButton>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleOpenDialog(payable)}
                                                    title="編輯"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(payable.id)}
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
                    {editingPayable ? '編輯應付帳款' : '新增應付帳款'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="供應商名稱"
                                value={formData.supplier_name}
                                onChange={e => handleFormChange('supplier_name', e.target.value)}
                                margin="normal"
                                error={!!formErrors.supplier_name}
                                helperText={formErrors.supplier_name}
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
                        {editingPayable && (
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
                        {editingPayable && (
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>狀態</InputLabel>
                                    <Select
                                        value={formData.status}
                                        onChange={e => handleFormChange('status', e.target.value)}
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
                <DialogTitle>執行付款</DialogTitle>
                <DialogContent>
                    {editingPayable && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1">
                                    供應商: {editingPayable.supplier_name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {editingPayable.description}
                                </Typography>
                                {editingPayable.invoice_number && (
                                    <Typography variant="body2" color="textSecondary">
                                        發票號碼: {editingPayable.invoice_number}
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    總金額: {(editingPayable.amount || 0).toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    已付金額: {(editingPayable.payment_amount || 0).toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    尚欠金額: {((editingPayable.amount || 0) - (editingPayable.payment_amount || 0)).toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <TextField
                                    fullWidth
                                    label="付款金額"
                                    type="number"
                                    value={paymentData.amount}
                                    onChange={e => setPaymentData({
                                        ...paymentData,
                                        amount: parseFloat(e.target.value) || 0
                                    })}
                                    inputProps={{
                                        min: 0,
                                        max: editingPayable.amount - editingPayable.payment_amount
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>付款方式</InputLabel>
                                    <Select
                                        value={paymentData.method}
                                        onChange={e => setPaymentData({
                                            ...paymentData,
                                            method: e.target.value as string
                                        })}
                                        label="付款方式"
                                    >
                                        {paymentMethodOptions.map(option => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
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
                            !editingPayable ||
                            paymentData.amount <= 0 ||
                            paymentData.amount > (editingPayable?.amount - editingPayable?.payment_amount)
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
                    <Typography>確定要刪除此筆應付帳款嗎？此操作無法復原。</Typography>
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

export default PayablesTab; 