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
// 應收帳款狀態選項
const statusOptions = [
    { value: 'pending', label: '待付款', color: 'warning' },
    { value: 'partially_paid', label: '部分付款', color: 'info' },
    { value: 'paid', label: '已付款', color: 'success' },
    { value: 'overdue', label: '逾期', color: 'error' }
];
// 初始表單數據
const initialFormData = {
    date: (0, dayjs_1.default)().format('YYYY-MM-DD'),
    dueDate: (0, dayjs_1.default)().add(30, 'day').format('YYYY-MM-DD'),
    clientName: '',
    amount: 0,
    paidAmount: 0,
    status: 'pending',
    description: '',
    invoiceNumber: ''
};
const ReceivablesTab = () => {
    // 狀態變數
    const [receivables, setReceivables] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = (0, react_1.useState)(false);
    const [editingReceivable, setEditingReceivable] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)(initialFormData);
    const [formErrors, setFormErrors] = (0, react_1.useState)({});
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    const [paymentAmount, setPaymentAmount] = (0, react_1.useState)(0);
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'success'
    });
    const [confirmDeleteOpen, setConfirmDeleteOpen] = (0, react_1.useState)(false);
    const [receivableToDelete, setReceivableToDelete] = (0, react_1.useState)(null);
    // 載入資料
    (0, react_1.useEffect)(() => {
        loadReceivables();
    }, []);
    const loadReceivables = async () => {
        setLoading(true);
        try {
            const data = await accounting_service_1.accountingService.getReceivables();
            setReceivables(data);
        }
        catch (error) {
            console.error('獲取應收帳款失敗:', error);
            setSnackbar({
                open: true,
                message: '獲取應收帳款失敗',
                severity: 'error'
            });
        }
        finally {
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
        return (receivable.clientName.toLowerCase().includes(searchLower) ||
            receivable.description.toLowerCase().includes(searchLower) ||
            (receivable.invoiceNumber && receivable.invoiceNumber.toLowerCase().includes(searchLower)));
    });
    // 處理對話框
    const handleOpenDialog = (receivable) => {
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
        }
        else {
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
    const handleOpenPaymentDialog = (receivable) => {
        setEditingReceivable(receivable);
        setPaymentAmount(receivable.amount - receivable.paidAmount);
        setPaymentDialogOpen(true);
    };
    const handleClosePaymentDialog = () => {
        setPaymentDialogOpen(false);
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
        if ((0, dayjs_1.default)(formData.dueDate).isBefore((0, dayjs_1.default)(formData.date))) {
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
                const updatedReceivable = await accounting_service_1.accountingService.updateReceivable(editingReceivable.id, formData);
                setReceivables(prev => prev.map(item => item.id === updatedReceivable.id ? updatedReceivable : item));
                setSnackbar({
                    open: true,
                    message: '應收帳款已更新',
                    severity: 'success'
                });
            }
            else {
                // 新增記錄
                const newReceivable = await accounting_service_1.accountingService.addReceivable({
                    ...formData,
                    paidAmount: 0,
                    status: 'pending'
                });
                setReceivables(prev => [...prev, newReceivable]);
                setSnackbar({
                    open: true,
                    message: '應收帳款已新增',
                    severity: 'success'
                });
            }
            handleCloseDialog();
        }
        catch (error) {
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
        if (!editingReceivable)
            return;
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
            const newStatus = (newPaidAmount >= editingReceivable.amount ? 'paid' :
                newPaidAmount > 0 ? 'partially_paid' : 'pending');
            const updatedReceivable = await accounting_service_1.accountingService.updateReceivable(editingReceivable.id, {
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
        }
        catch (error) {
            console.error('記錄付款失敗:', error);
            setSnackbar({
                open: true,
                message: '記錄付款失敗',
                severity: 'error'
            });
        }
    };
    // 處理刪除
    const handleDeleteClick = (id) => {
        setReceivableToDelete(id);
        setConfirmDeleteOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (!receivableToDelete)
            return;
        try {
            const success = await accounting_service_1.accountingService.deleteReceivable(receivableToDelete);
            if (success) {
                setReceivables(prev => prev.filter(item => item.id !== receivableToDelete));
                setSnackbar({
                    open: true,
                    message: '應收帳款已刪除',
                    severity: 'success'
                });
            }
        }
        catch (error) {
            console.error('刪除應收帳款失敗:', error);
            setSnackbar({
                open: true,
                message: '刪除應收帳款失敗',
                severity: 'error'
            });
        }
        finally {
            setConfirmDeleteOpen(false);
            setReceivableToDelete(null);
        }
    };
    // 計算帳齡
    const calculateAge = (dueDate) => {
        const today = (0, dayjs_1.default)();
        const due = (0, dayjs_1.default)(dueDate);
        if (due.isAfter(today)) {
            return 0; // 未到期
        }
        return today.diff(due, 'day');
    };
    // 取得狀態顯示樣式
    const getStatusChip = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: (statusOption === null || statusOption === void 0 ? void 0 : statusOption.label) || status, color: (statusOption === null || statusOption === void 0 ? void 0 : statusOption.color) || 'default', size: "small" }));
    };
    // 渲染內容
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", children: "\u61C9\u6536\u5E33\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => handleOpenDialog(), children: "\u65B0\u589E\u61C9\u6536\u5E33\u6B3E" })] }), (0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { p: 2, mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 5, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, placeholder: "\u641C\u5C0B\u5BA2\u6236\u3001\u63CF\u8FF0\u6216\u767C\u7968\u865F\u78BC", value: searchTerm, onChange: e => setSearchTerm(e.target.value), InputProps: {
                                    startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Search, {}) }))
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: filterStatus, onChange: e => setFilterStatus(e.target.value), label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "all", children: "\u5168\u90E8" }), statusOptions.map(status => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: status.value, children: status.label }, status.value)))] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 4, sx: { textAlign: 'right' }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { children: ["\u7E3D\u8A08: ", filteredReceivables.reduce((sum, item) => sum + (item.amount - item.paidAmount), 0).toLocaleString(), " \u5143"] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { children: ["\u5171 ", filteredReceivables.length, " \u7B46\u8A18\u9304"] })] })] }) }), loading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', mt: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5BA2\u6236" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5230\u671F\u65E5" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u63CF\u8FF0" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u5DF2\u4ED8\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u9918\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: filteredReceivables.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 9, align: "center", children: "\u7121\u7B26\u5408\u689D\u4EF6\u7684\u61C9\u6536\u5E33\u6B3E" }) })) : (filteredReceivables.map(receivable => {
                                const age = calculateAge(receivable.dueDate);
                                const balance = receivable.amount - receivable.paidAmount;
                                return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { sx: age > 0 && receivable.status !== 'paid' ? { bgcolor: 'rgba(255, 0, 0, 0.05)' } : {}, children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.clientName }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.date }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [receivable.dueDate, age > 0 && receivable.status !== 'paid' && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "caption", color: "error", component: "div", children: ["\u903E\u671F ", age, " \u5929"] }))] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.description }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: receivable.amount.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: receivable.paidAmount.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: {
                                                fontWeight: 'bold',
                                                color: balance > 0 ? 'error.main' : 'success.main'
                                            }, children: balance.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getStatusChip(receivable.status) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [balance > 0 && ((0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "success", onClick: () => handleOpenPaymentDialog(receivable), title: "\u8A18\u9304\u4ED8\u6B3E", children: (0, jsx_runtime_1.jsx)(icons_material_1.CheckCircle, {}) })), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "primary", onClick: () => handleOpenDialog(receivable), title: "\u7DE8\u8F2F", children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleDeleteClick(receivable.id), title: "\u522A\u9664", children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, receivable.id));
                            })) })] }) })), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: handleCloseDialog, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: editingReceivable ? '編輯應收帳款' : '新增應收帳款' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { dividers: true, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5BA2\u6236\u540D\u7A31", value: formData.clientName, onChange: e => handleFormChange('clientName', e.target.value), margin: "normal", error: !!formErrors.clientName, helperText: formErrors.clientName }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u767C\u7968\u865F\u78BC", value: formData.invoiceNumber, onChange: e => handleFormChange('invoiceNumber', e.target.value), margin: "normal", placeholder: "\u9078\u586B" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(LocalizationProvider_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, children: (0, jsx_runtime_1.jsx)(DatePicker_1.DatePicker, { label: "\u5EFA\u7ACB\u65E5\u671F", value: (0, dayjs_1.default)(formData.date), onChange: (value) => handleFormChange('date', value ? value.format('YYYY-MM-DD') : ''), format: "YYYY/MM/DD", slotProps: {
                                                textField: {
                                                    fullWidth: true,
                                                    margin: 'normal',
                                                    error: !!formErrors.date,
                                                    helperText: formErrors.date
                                                }
                                            } }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(LocalizationProvider_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, children: (0, jsx_runtime_1.jsx)(DatePicker_1.DatePicker, { label: "\u5230\u671F\u65E5", value: (0, dayjs_1.default)(formData.dueDate), onChange: (value) => handleFormChange('dueDate', value ? value.format('YYYY-MM-DD') : ''), format: "YYYY/MM/DD", slotProps: {
                                                textField: {
                                                    fullWidth: true,
                                                    margin: 'normal',
                                                    error: !!formErrors.dueDate,
                                                    helperText: formErrors.dueDate
                                                }
                                            } }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u91D1\u984D", type: "number", value: formData.amount, onChange: e => handleFormChange('amount', parseFloat(e.target.value) || 0), margin: "normal", error: !!formErrors.amount, helperText: formErrors.amount }) }), editingReceivable && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5DF2\u4ED8\u91D1\u984D", type: "number", value: formData.paidAmount, onChange: e => handleFormChange('paidAmount', parseFloat(e.target.value) || 0), margin: "normal", inputProps: { readOnly: true } }) })), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u63CF\u8FF0", value: formData.description, onChange: e => handleFormChange('description', e.target.value), margin: "normal", multiline: true, rows: 2, error: !!formErrors.description, helperText: formErrors.description }) }), editingReceivable && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "normal", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: formData.status, onChange: e => handleFormChange('status', e.target.value), label: "\u72C0\u614B", children: statusOptions.map(option => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: option.value, children: option.label }, option.value))) })] }) }))] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", color: "primary", children: "\u5132\u5B58" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: paymentDialogOpen, onClose: handleClosePaymentDialog, maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u8A18\u9304\u4ED8\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: editingReceivable && ((0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "subtitle1", children: ["\u5BA2\u6236: ", editingReceivable.clientName] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: editingReceivable.description })] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: ["\u7E3D\u91D1\u984D: ", editingReceivable.amount.toLocaleString()] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: ["\u5DF2\u4ED8\u91D1\u984D: ", editingReceivable.paidAmount.toLocaleString()] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", sx: { fontWeight: 'bold' }, children: ["\u5C1A\u6B20\u91D1\u984D: ", (editingReceivable.amount - editingReceivable.paidAmount).toLocaleString()] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sx: { mt: 2 }, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u672C\u6B21\u4ED8\u6B3E\u91D1\u984D", type: "number", value: paymentAmount, onChange: e => setPaymentAmount(parseFloat(e.target.value) || 0), inputProps: {
                                            min: 0,
                                            max: editingReceivable.amount - editingReceivable.paidAmount
                                        } }) })] })) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClosePaymentDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handlePaymentSubmit, variant: "contained", color: "primary", disabled: !editingReceivable ||
                                    paymentAmount <= 0 ||
                                    paymentAmount > ((editingReceivable === null || editingReceivable === void 0 ? void 0 : editingReceivable.amount) - (editingReceivable === null || editingReceivable === void 0 ? void 0 : editingReceivable.paidAmount)), children: "\u78BA\u8A8D\u4ED8\u6B3E" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: confirmDeleteOpen, onClose: () => setConfirmDeleteOpen(false), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u6B64\u7B46\u61C9\u6536\u5E33\u6B3E\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002" }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setConfirmDeleteOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, color: "error", variant: "contained", children: "\u522A\u9664" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 5000, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: snackbar.severity, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), children: snackbar.message }) })] }));
};
exports.default = ReceivablesTab;
