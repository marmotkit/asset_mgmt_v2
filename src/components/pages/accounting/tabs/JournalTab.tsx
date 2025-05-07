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
    FilterList as FilterIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { AccountRecord, PaymentMethod, TransactionType } from '../../../../types/payment';
import { accountingService } from '../../../../services/accounting.service';

const paymentMethodOptions = [
    { value: 'cash', label: '現金' },
    { value: 'bank_transfer', label: '銀行轉帳' },
    { value: 'credit_card', label: '信用卡' },
    { value: 'check', label: '支票' },
    { value: 'transfer', label: '轉帳' },
    { value: 'other', label: '其他' }
];

// 交易類型選項
const transactionTypeOptions = [
    { value: 'income', label: '收入' },
    { value: 'expense', label: '支出' }
];

// 類別選項
const categoryOptions = {
    income: [
        '會費收入',
        '投資收入',
        '利息收入',
        '租金收入',
        '服務收入',
        '其他收入'
    ],
    expense: [
        '辦公用品',
        '水電費',
        '通訊費',
        '租金支出',
        '人事費用',
        '差旅費',
        '會議費',
        '廣告費',
        '專業服務費',
        '維修費',
        '其他支出'
    ]
};

// 初始表單數據
const initialFormData = {
    date: dayjs().format('YYYY-MM-DD'),
    amount: 0,
    type: 'income' as TransactionType,
    category: '',
    paymentMethod: 'bank_transfer' as PaymentMethod,
    description: '',
    relatedParty: '',
    invoiceNumber: ''
};

const JournalTab: React.FC = () => {
    // 狀態變數
    const [records, setRecords] = useState<AccountRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<AccountRecord | null>(null);
    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

    // 載入資料
    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        setLoading(true);
        try {
            const data = await accountingService.getAccountRecords();
            setRecords(data);
        } catch (error) {
            console.error('獲取帳務記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '獲取帳務記錄失敗',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // 過濾和搜尋記錄
    const filteredRecords = records.filter(record => {
        // 依照類型過濾
        if (filterType !== 'all' && record.type !== filterType) {
            return false;
        }

        // 依照搜尋條件過濾
        const searchLower = searchTerm.toLowerCase();
        return (
            record.description.toLowerCase().includes(searchLower) ||
            record.category.toLowerCase().includes(searchLower) ||
            (record.relatedParty && record.relatedParty.toLowerCase().includes(searchLower)) ||
            (record.invoiceNumber && record.invoiceNumber.toLowerCase().includes(searchLower))
        );
    });

    // 處理對話框
    const handleOpenDialog = (record?: AccountRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                date: record.date,
                amount: record.amount,
                type: record.type,
                category: record.category,
                paymentMethod: record.paymentMethod,
                description: record.description,
                relatedParty: record.relatedParty || '',
                invoiceNumber: record.invoiceNumber || ''
            });
        } else {
            setEditingRecord(null);
            setFormData(initialFormData);
        }
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
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

        if (!formData.amount || formData.amount <= 0) {
            errors.amount = '請輸入有效金額';
        }

        if (!formData.category) {
            errors.category = '請選擇類別';
        }

        if (!formData.description.trim()) {
            errors.description = '請輸入描述';
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
            if (editingRecord) {
                // 更新記錄
                const updatedRecord = await accountingService.updateAccountRecord(editingRecord.id, formData);
                setRecords(prev => prev.map(record => record.id === updatedRecord.id ? updatedRecord : record));
                setSnackbar({
                    open: true,
                    message: '帳務記錄已更新',
                    severity: 'success'
                });
            } else {
                // 新增記錄
                const newRecord = await accountingService.addAccountRecord(formData);
                setRecords(prev => [...prev, newRecord]);
                setSnackbar({
                    open: true,
                    message: '帳務記錄已新增',
                    severity: 'success'
                });
            }
            handleCloseDialog();
        } catch (error) {
            console.error('儲存帳務記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '儲存帳務記錄失敗',
                severity: 'error'
            });
        }
    };

    // 處理刪除
    const handleDeleteClick = (id: string) => {
        setRecordToDelete(id);
        setConfirmDeleteOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!recordToDelete) return;

        try {
            const success = await accountingService.deleteAccountRecord(recordToDelete);
            if (success) {
                setRecords(prev => prev.filter(record => record.id !== recordToDelete));
                setSnackbar({
                    open: true,
                    message: '帳務記錄已刪除',
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error('刪除帳務記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '刪除帳務記錄失敗',
                severity: 'error'
            });
        } finally {
            setConfirmDeleteOpen(false);
            setRecordToDelete(null);
        }
    };

    // 渲染內容
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">日記帳</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    新增記錄
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            placeholder="搜尋描述、類別、關聯方或發票號碼"
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
                            <InputLabel>交易類型</InputLabel>
                            <Select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                label="交易類型"
                            >
                                <MenuItem value="all">全部</MenuItem>
                                <MenuItem value="income">收入</MenuItem>
                                <MenuItem value="expense">支出</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                        <Typography>
                            共 {filteredRecords.length} 筆記錄
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
                                <TableCell>日期</TableCell>
                                <TableCell>類別</TableCell>
                                <TableCell>描述</TableCell>
                                <TableCell>關聯方</TableCell>
                                <TableCell align="right">金額</TableCell>
                                <TableCell>支付方式</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        無符合條件的帳務記錄
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRecords.map(record => (
                                    <TableRow key={record.id}>
                                        <TableCell>{record.date}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.category}
                                                color={record.type === 'income' ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{record.description}</TableCell>
                                        <TableCell>{record.relatedParty || '-'}</TableCell>
                                        <TableCell align="right" sx={{
                                            color: record.type === 'income' ? 'success.main' : 'error.main',
                                            fontWeight: 'bold'
                                        }}>
                                            {record.type === 'income' ? '+' : '-'}{record.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {paymentMethodOptions.find(opt => opt.value === record.paymentMethod)?.label || record.paymentMethod}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog(record)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteClick(record.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* 新增/編輯對話框 */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingRecord ? '編輯帳務記錄' : '新增帳務記錄'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="日期"
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
                            <FormControl fullWidth margin="normal" error={!!formErrors.type}>
                                <InputLabel>交易類型</InputLabel>
                                <Select
                                    value={formData.type}
                                    onChange={e => handleFormChange('type', e.target.value)}
                                    label="交易類型"
                                >
                                    {transactionTypeOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth margin="normal" error={!!formErrors.category}>
                                <InputLabel>類別</InputLabel>
                                <Select
                                    value={formData.category}
                                    onChange={e => handleFormChange('category', e.target.value)}
                                    label="類別"
                                >
                                    <MenuItem value="" disabled>請選擇類別</MenuItem>
                                    {formData.type === 'income' ? (
                                        categoryOptions.income.map(category => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        categoryOptions.expense.map(category => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                                {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>支付方式</InputLabel>
                                <Select
                                    value={formData.paymentMethod}
                                    onChange={e => handleFormChange('paymentMethod', e.target.value)}
                                    label="支付方式"
                                >
                                    {paymentMethodOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="關聯方"
                                value={formData.relatedParty}
                                onChange={e => handleFormChange('relatedParty', e.target.value)}
                                margin="normal"
                                placeholder="公司名稱或個人姓名"
                            />
                        </Grid>
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
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>取消</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 刪除確認對話框 */}
            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    <Typography>確定要刪除此筆帳務記錄嗎？此操作無法復原。</Typography>
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

export default JournalTab; 