"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const AdapterDayjs_1 = require("@mui/x-date-pickers/AdapterDayjs");
const dayjs_1 = __importDefault(require("dayjs"));
const accounting_service_1 = require("../../../../services/accounting.service");
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
    date: (0, dayjs_1.default)().format('YYYY-MM-DD'),
    amount: 0,
    type: 'income',
    category: '',
    paymentMethod: 'bank_transfer',
    description: '',
    relatedParty: '',
    invoiceNumber: ''
};
const JournalTab = () => {
    // 狀態變數
    const [records, setRecords] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [editingRecord, setEditingRecord] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)(initialFormData);
    const [formErrors, setFormErrors] = (0, react_1.useState)({});
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [filterType, setFilterType] = (0, react_1.useState)('all');
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'success'
    });
    const [confirmDeleteOpen, setConfirmDeleteOpen] = (0, react_1.useState)(false);
    const [recordToDelete, setRecordToDelete] = (0, react_1.useState)(null);
    // 載入資料
    (0, react_1.useEffect)(() => {
        loadRecords();
    }, []);
    const loadRecords = async () => {
        setLoading(true);
        try {
            const data = await accounting_service_1.accountingService.getAccountRecords();
            setRecords(data);
        }
        catch (error) {
            console.error('獲取帳務記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '獲取帳務記錄失敗',
                severity: 'error'
            });
        }
        finally {
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
        return (record.description.toLowerCase().includes(searchLower) ||
            record.category.toLowerCase().includes(searchLower) ||
            (record.relatedParty && record.relatedParty.toLowerCase().includes(searchLower)) ||
            (record.invoiceNumber && record.invoiceNumber.toLowerCase().includes(searchLower)));
    });
    // 處理對話框
    const handleOpenDialog = (record) => {
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
        }
        else {
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
    const handleFormChange = (field, value) => {
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
        const errors = {};
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
                const updatedRecord = await accounting_service_1.accountingService.updateAccountRecord(editingRecord.id, formData);
                setRecords(prev => prev.map(record => record.id === updatedRecord.id ? updatedRecord : record));
                setSnackbar({
                    open: true,
                    message: '帳務記錄已更新',
                    severity: 'success'
                });
            }
            else {
                // 新增記錄
                const newRecord = await accounting_service_1.accountingService.addAccountRecord(formData);
                setRecords(prev => [...prev, newRecord]);
                setSnackbar({
                    open: true,
                    message: '帳務記錄已新增',
                    severity: 'success'
                });
            }
            handleCloseDialog();
        }
        catch (error) {
            console.error('儲存帳務記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '儲存帳務記錄失敗',
                severity: 'error'
            });
        }
    };
    // 處理刪除
    const handleDeleteClick = (id) => {
        setRecordToDelete(id);
        setConfirmDeleteOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (!recordToDelete)
            return;
        try {
            const success = await accounting_service_1.accountingService.deleteAccountRecord(recordToDelete);
            if (success) {
                setRecords(prev => prev.filter(record => record.id !== recordToDelete));
                setSnackbar({
                    open: true,
                    message: '帳務記錄已刪除',
                    severity: 'success'
                });
            }
        }
        catch (error) {
            console.error('刪除帳務記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '刪除帳務記錄失敗',
                severity: 'error'
            });
        }
        finally {
            setConfirmDeleteOpen(false);
            setRecordToDelete(null);
        }
    };
    // 渲染內容
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", children: "\u65E5\u8A18\u5E33" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => handleOpenDialog(), children: "\u65B0\u589E\u8A18\u9304" })] }), (0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { p: 2, mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 5, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, placeholder: "\u641C\u5C0B\u63CF\u8FF0\u3001\u985E\u5225\u3001\u95DC\u806F\u65B9\u6216\u767C\u7968\u865F\u78BC", value: searchTerm, onChange: e => setSearchTerm(e.target.value), InputProps: {
                                    startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Search, {}) }))
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u4EA4\u6613\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: filterType, onChange: e => setFilterType(e.target.value), label: "\u4EA4\u6613\u985E\u578B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "all", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "income", children: "\u6536\u5165" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "expense", children: "\u652F\u51FA" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, sx: { textAlign: 'right' }, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { children: ["\u5171 ", filteredRecords.length, " \u7B46\u8A18\u9304"] }) })] }) }), loading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', mt: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u5225" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u63CF\u8FF0" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u95DC\u806F\u65B9" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u652F\u4ED8\u65B9\u5F0F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: filteredRecords.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 7, align: "center", children: "\u7121\u7B26\u5408\u689D\u4EF6\u7684\u5E33\u52D9\u8A18\u9304" }) })) : (filteredRecords.map(record => {
                                var _a;
                                return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.date }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: record.category, color: record.type === 'income' ? 'success' : 'error', size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.description }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.relatedParty || '-' }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", sx: {
                                                color: record.type === 'income' ? 'success.main' : 'error.main',
                                                fontWeight: 'bold'
                                            }, children: [record.type === 'income' ? '+' : '-', record.amount.toLocaleString()] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: ((_a = paymentMethodOptions.find(opt => opt.value === record.paymentMethod)) === null || _a === void 0 ? void 0 : _a.label) || record.paymentMethod }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "primary", onClick: () => handleOpenDialog(record), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleDeleteClick(record.id), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, record.id));
                            })) })] }) })), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: handleCloseDialog, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: editingRecord ? '編輯帳務記錄' : '新增帳務記錄' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { dividers: true, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(LocalizationProvider_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, children: (0, jsx_runtime_1.jsx)(DatePicker_1.DatePicker, { label: "\u65E5\u671F", value: (0, dayjs_1.default)(formData.date), onChange: (value) => handleFormChange('date', value ? value.format('YYYY-MM-DD') : ''), format: "YYYY/MM/DD", slotProps: {
                                                textField: {
                                                    fullWidth: true,
                                                    margin: 'normal',
                                                    error: !!formErrors.date,
                                                    helperText: formErrors.date
                                                }
                                            } }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "normal", error: !!formErrors.type, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u4EA4\u6613\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: formData.type, onChange: e => handleFormChange('type', e.target.value), label: "\u4EA4\u6613\u985E\u578B", children: transactionTypeOptions.map(option => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: option.value, children: option.label }, option.value))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u91D1\u984D", type: "number", value: formData.amount, onChange: e => handleFormChange('amount', parseFloat(e.target.value) || 0), margin: "normal", error: !!formErrors.amount, helperText: formErrors.amount }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "normal", error: !!formErrors.category, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u985E\u5225" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.category, onChange: e => handleFormChange('category', e.target.value), label: "\u985E\u5225", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", disabled: true, children: "\u8ACB\u9078\u64C7\u985E\u5225" }), formData.type === 'income' ? (categoryOptions.income.map(category => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: category, children: category }, category)))) : (categoryOptions.expense.map(category => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: category, children: category }, category))))] }), formErrors.category && (0, jsx_runtime_1.jsx)(material_1.FormHelperText, { children: formErrors.category })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "normal", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u652F\u4ED8\u65B9\u5F0F" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: formData.paymentMethod, onChange: e => handleFormChange('paymentMethod', e.target.value), label: "\u652F\u4ED8\u65B9\u5F0F", children: paymentMethodOptions.map(option => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: option.value, children: option.label }, option.value))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u95DC\u806F\u65B9", value: formData.relatedParty, onChange: e => handleFormChange('relatedParty', e.target.value), margin: "normal", placeholder: "\u516C\u53F8\u540D\u7A31\u6216\u500B\u4EBA\u59D3\u540D" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u63CF\u8FF0", value: formData.description, onChange: e => handleFormChange('description', e.target.value), margin: "normal", multiline: true, rows: 2, error: !!formErrors.description, helperText: formErrors.description }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u767C\u7968\u865F\u78BC", value: formData.invoiceNumber, onChange: e => handleFormChange('invoiceNumber', e.target.value), margin: "normal", placeholder: "\u9078\u586B" }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", color: "primary", children: "\u5132\u5B58" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: confirmDeleteOpen, onClose: () => setConfirmDeleteOpen(false), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u6B64\u7B46\u5E33\u52D9\u8A18\u9304\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002" }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setConfirmDeleteOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, color: "error", variant: "contained", children: "\u522A\u9664" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 5000, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: snackbar.severity, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), children: snackbar.message }) })] }));
};
exports.default = JournalTab;
