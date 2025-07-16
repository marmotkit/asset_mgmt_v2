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
import { accountingJournalService, JournalEntry, CreateJournalEntry } from '../../../../services/accountingJournal.service';

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
const initialFormData: CreateJournalEntry = {
    journal_date: dayjs().format('YYYY-MM-DD'),
    journal_number: '',
    reference_number: '',
    description: '',
    debit_account_id: '',
    credit_account_id: '',
    amount: 0,
    category_id: '',
    created_by: ''
};

const JournalTab: React.FC = () => {
    // 狀態變數
    const [records, setRecords] = useState<JournalEntry[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<JournalEntry | null>(null);
    const [formData, setFormData] = useState<CreateJournalEntry>(initialFormData);
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
        loadAccounts();
        loadCategories();
    }, []);

    const loadRecords = async () => {
        setLoading(true);
        try {
            const data = await accountingJournalService.getJournalEntries();
            // 確保資料是陣列格式
            const recordsArray = Array.isArray(data) ? data : [];
            setRecords(recordsArray);
        } catch (error) {
            console.error('獲取帳務記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '獲取帳務記錄失敗',
                severity: 'error'
            });
            // 確保錯誤時也設置為空陣列
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAccounts = async () => {
        try {
            const data = await accountingJournalService.getAccounts();
            // 確保資料是陣列格式
            const accountsArray = Array.isArray(data) ? data : [];
            setAccounts(accountsArray);
        } catch (error) {
            setSnackbar({
                open: true,
                message: '取得會計科目失敗',
                severity: 'error'
            });
            // 確保錯誤時也設置為空陣列
            setAccounts([]);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await accountingJournalService.getCategories();
            // 確保資料是陣列格式
            const categoriesArray = Array.isArray(data) ? data : [];
            setCategories(categoriesArray);
        } catch (error) {
            setSnackbar({
                open: true,
                message: '取得交易類別失敗',
                severity: 'error'
            });
            // 確保錯誤時也設置為空陣列
            setCategories([]);
        }
    };

    // 過濾和搜尋記錄
    const filteredRecords = (records || []).filter(record => {
        // 只用 description、journal_number、reference_number、amount 搜尋
        const searchLower = searchTerm.toLowerCase();
        return (
            (record.description && record.description.toLowerCase().includes(searchLower)) ||
            (record.journal_number && record.journal_number.toLowerCase().includes(searchLower)) ||
            (record.reference_number && record.reference_number.toLowerCase().includes(searchLower)) ||
            (record.amount && record.amount.toString().includes(searchLower))
        );
    });

    // 處理對話框
    const handleOpenDialog = (record?: JournalEntry) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                journal_date: record.journal_date,
                journal_number: record.journal_number,
                reference_number: record.reference_number || '',
                description: record.description,
                debit_account_id: record.debit_account_id,
                credit_account_id: record.credit_account_id,
                amount: Number(record.amount),
                category_id: record.category_id || '',
                created_by: record.created_by
            });
        } else {
            setEditingRecord(null);
            setFormData({
                journal_date: dayjs().format('YYYY-MM-DD'),
                journal_number: '',
                reference_number: '',
                description: '',
                debit_account_id: '',
                credit_account_id: '',
                amount: 0,
                category_id: '',
                created_by: ''
            });
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
        if (!formData.journal_date) {
            errors.journal_date = '請選擇日期';
        }
        if (!formData.amount || formData.amount <= 0) {
            errors.amount = '請輸入有效金額';
        }
        if (!formData.journal_number) {
            errors.journal_number = '請輸入分錄號碼';
        }
        if (!formData.debit_account_id) {
            errors.debit_account_id = '請選擇借方科目';
        }
        if (!formData.credit_account_id) {
            errors.credit_account_id = '請選擇貸方科目';
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
                const updatedRecord = await accountingJournalService.updateJournalEntry(editingRecord.id, formData);
                setRecords(prev => prev.map(record => record.id === updatedRecord.id ? updatedRecord : record));
                setSnackbar({
                    open: true,
                    message: '帳務記錄已更新',
                    severity: 'success'
                });
            } else {
                // 新增記錄
                const newRecord = await accountingJournalService.createJournalEntry(formData);
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
            await accountingJournalService.deleteJournalEntry(recordToDelete);
            setRecords(prev => prev.filter(record => record.id !== recordToDelete));
            setSnackbar({
                open: true,
                message: '帳務記錄已刪除',
                severity: 'success'
            });
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
                            placeholder="搜尋描述、分錄號碼、參考號碼或金額"
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
                                        <TableCell>{record.journal_date}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.category_name || '未分類'}
                                                color="primary"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{record.description}</TableCell>
                                        <TableCell>{record.reference_number || '-'}</TableCell>
                                        <TableCell align="right" sx={{
                                            color: 'text.primary',
                                            fontWeight: 'bold'
                                        }}>
                                            {record.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {record.debit_account_name || 'N/A'}
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
                                    value={dayjs(formData.journal_date)}
                                    onChange={(value: Dayjs | null) =>
                                        handleFormChange('journal_date', value ? value.format('YYYY-MM-DD') : '')
                                    }
                                    format="YYYY/MM/DD"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!formErrors.journal_date,
                                            helperText: formErrors.journal_date
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.journal_number}>
                                <InputLabel>分錄號碼</InputLabel>
                                <TextField
                                    value={formData.journal_number}
                                    onChange={e => handleFormChange('journal_number', e.target.value)}
                                    fullWidth
                                    error={!!formErrors.journal_number}
                                    helperText={formErrors.journal_number}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.amount}>
                                <InputLabel>金額</InputLabel>
                                <TextField
                                    type="number"
                                    value={formData.amount}
                                    onChange={e => handleFormChange('amount', parseFloat(e.target.value) || 0)}
                                    fullWidth
                                    error={!!formErrors.amount}
                                    helperText={formErrors.amount}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.debit_account_id}>
                                <InputLabel>借方科目</InputLabel>
                                <Select
                                    value={formData.debit_account_id}
                                    onChange={e => handleFormChange('debit_account_id', e.target.value)}
                                    fullWidth
                                    error={!!formErrors.debit_account_id}
                                >
                                    <MenuItem value="" disabled>請選擇借方科目</MenuItem>
                                    {(accounts || []).map(account => (
                                        <MenuItem key={account.id} value={account.id}>
                                            {account.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.debit_account_id && <FormHelperText>{formErrors.debit_account_id}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!formErrors.credit_account_id}>
                                <InputLabel>貸方科目</InputLabel>
                                <Select
                                    value={formData.credit_account_id}
                                    onChange={e => handleFormChange('credit_account_id', e.target.value)}
                                    fullWidth
                                    error={!!formErrors.credit_account_id}
                                >
                                    <MenuItem value="" disabled>請選擇貸方科目</MenuItem>
                                    {(accounts || []).map(account => (
                                        <MenuItem key={account.id} value={account.id}>
                                            {account.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.credit_account_id && <FormHelperText>{formErrors.credit_account_id}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!formErrors.description}>
                                <InputLabel>描述</InputLabel>
                                <TextField
                                    value={formData.description}
                                    onChange={e => handleFormChange('description', e.target.value)}
                                    fullWidth
                                    error={!!formErrors.description}
                                    helperText={formErrors.description}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="參考號碼"
                                value={formData.reference_number}
                                onChange={e => handleFormChange('reference_number', e.target.value)}
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