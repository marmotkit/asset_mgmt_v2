"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeHistory = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const icons_material_1 = require("@mui/icons-material");
const dateUtils_1 = require("../../../utils/dateUtils");
const numberUtils_1 = require("../../../utils/numberUtils");
const feeHistoryService_1 = require("../../../services/feeHistoryService");
const getStatusChip = (status) => {
    const statusConfig = {
        '待收款': { label: '待收款', color: 'warning' },
        '已收款': { label: '已收款', color: 'success' },
        '逾期': { label: '逾期', color: 'error' },
        '終止': { label: '終止', color: 'default' }
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return (0, jsx_runtime_1.jsx)(material_1.Chip, { label: config.label, color: config.color, size: "small" });
};
const statusOptions = [
    { value: '', label: '全部' },
    { value: '待收款', label: '待收款' },
    { value: '已收款', label: '已收款' },
    { value: '逾期', label: '逾期' },
    { value: '終止', label: '終止' }
];
const FeeHistory = () => {
    const [histories, setHistories] = (0, react_1.useState)([]);
    const [filter, setFilter] = (0, react_1.useState)({
        memberId: '',
        userId: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [dateRange, setDateRange] = (0, react_1.useState)({
        startDate: null,
        endDate: null
    });
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [editingRecord, setEditingRecord] = (0, react_1.useState)(null);
    const [deleteRecord, setDeleteRecord] = (0, react_1.useState)(null);
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'success'
    });
    const loadFeeHistory = async () => {
        setLoading(true);
        try {
            const historyFilter = {
                ...filter,
                startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
                endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined
            };
            const data = await feeHistoryService_1.feeHistoryService.getHistories(historyFilter);
            setHistories(data);
        }
        catch (error) {
            console.error('載入會費歷史記錄失敗:', error);
            setHistories([]);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadFeeHistory();
    }, [filter, dateRange]);
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const isPaymentStatus = (value) => {
        return ['待收款', '已收款', '逾期', '終止'].includes(value);
    };
    const handleStatusChange = (e) => {
        const value = e.target.value;
        setFilter(prev => ({
            ...prev,
            status: value === '' ? undefined : value
        }));
    };
    const handleDateChange = (field) => (date) => {
        setDateRange(prev => ({
            ...prev,
            [field]: date
        }));
    };
    const handleExport = async () => {
        try {
            const blob = await feeHistoryService_1.feeHistoryService.exportToExcel(filter);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `會費歷史記錄_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        catch (error) {
            console.error('匯出失敗:', error);
        }
    };
    const handleEditClick = (record) => {
        setEditingRecord({ ...record });
    };
    const handleEditSave = async () => {
        if (!editingRecord)
            return;
        try {
            const updated = await feeHistoryService_1.feeHistoryService.updateRecord(editingRecord.id, editingRecord);
            if (updated) {
                setHistories(prev => prev.map(r => r.id === updated.id ? updated : r));
                setSnackbar({
                    open: true,
                    message: '更新成功',
                    severity: 'success'
                });
            }
        }
        catch (error) {
            console.error('更新失敗:', error);
            setSnackbar({
                open: true,
                message: '更新失敗',
                severity: 'error'
            });
        }
        setEditingRecord(null);
    };
    const handleDeleteClick = (record) => {
        setDeleteRecord(record);
    };
    const handleDeleteConfirm = async () => {
        if (!deleteRecord)
            return;
        try {
            const success = await feeHistoryService_1.feeHistoryService.deleteRecord(deleteRecord.id);
            if (success) {
                setHistories(prev => prev.filter(r => r.id !== deleteRecord.id));
                setSnackbar({
                    open: true,
                    message: '刪除成功',
                    severity: 'success'
                });
            }
        }
        catch (error) {
            console.error('刪除失敗:', error);
            setSnackbar({
                open: true,
                message: '刪除失敗',
                severity: 'error'
            });
        }
        setDeleteRecord(null);
    };
    const handleFieldChange = (field, value) => {
        if (editingRecord) {
            setEditingRecord(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { mb: 3 }, children: "\u6703\u8CBB\u6B77\u53F2\u8A18\u9304" }), (0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { p: 2, mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 3, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6703\u54E1\u7DE8\u865F/\u59D3\u540D", name: "userId", value: filter.userId, onChange: handleTextChange, size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6536\u6B3E\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.Select, { name: "status", value: filter.status || '', onChange: handleStatusChange, label: "\u6536\u6B3E\u72C0\u614B", size: "small", children: statusOptions.map(option => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: option.value, children: option.label }, option.value))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 2, children: (0, jsx_runtime_1.jsx)(DatePicker_1.DatePicker, { label: "\u8D77\u59CB\u65E5\u671F", value: dateRange.startDate, onChange: handleDateChange('startDate'), slotProps: { textField: { fullWidth: true, size: 'small' } } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 2, children: (0, jsx_runtime_1.jsx)(DatePicker_1.DatePicker, { label: "\u7D50\u675F\u65E5\u671F", value: dateRange.endDate, onChange: handleDateChange('endDate'), slotProps: { textField: { fullWidth: true, size: 'small' } } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 2, children: (0, jsx_runtime_1.jsx)(material_1.Button, { fullWidth: true, variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Download, {}), onClick: handleExport, children: "\u532F\u51FA\u5831\u8868" }) })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u59D3\u540D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5230\u671F\u65E5" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7E73\u8CBB\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7E73\u8CBB\u65B9\u5F0F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5099\u8A3B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: histories.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 11, align: "center", children: "\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u6B77\u53F2\u8A18\u9304" }) })) : (histories.map((record) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.userId }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.userName }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.memberType }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, numberUtils_1.formatCurrency)(record.amount) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, dateUtils_1.formatDate)(record.dueDate) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.paymentDate ? (0, dateUtils_1.formatDate)(record.paymentDate) : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.paymentMethod || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getStatusChip(record.status) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.note || '-' }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u7DE8\u8F2F", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEditClick(record), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }) }), (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u522A\u9664", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleDeleteClick(record), color: "error", children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) }) })] })] }, record.id)))) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: !!editingRecord, onClose: () => setEditingRecord(null), maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u7DE8\u8F2F\u6B77\u53F2\u8A18\u9304" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { pt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6703\u54E1\u7DE8\u865F", value: (editingRecord === null || editingRecord === void 0 ? void 0 : editingRecord.userId) || '', disabled: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u59D3\u540D", value: (editingRecord === null || editingRecord === void 0 ? void 0 : editingRecord.userName) || '', disabled: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6703\u54E1\u985E\u578B", value: (editingRecord === null || editingRecord === void 0 ? void 0 : editingRecord.memberType) || '', disabled: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u91D1\u984D", type: "number", value: (editingRecord === null || editingRecord === void 0 ? void 0 : editingRecord.amount) || '', onChange: (e) => handleFieldChange('amount', Number(e.target.value)) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5230\u671F\u65E5", type: "date", value: (editingRecord === null || editingRecord === void 0 ? void 0 : editingRecord.dueDate) || '', onChange: (e) => handleFieldChange('dueDate', e.target.value), InputLabelProps: { shrink: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7E73\u8CBB\u65E5\u671F", type: "date", value: (editingRecord === null || editingRecord === void 0 ? void 0 : editingRecord.paymentDate) || '', onChange: (e) => handleFieldChange('paymentDate', e.target.value), InputLabelProps: { shrink: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: (editingRecord === null || editingRecord === void 0 ? void 0 : editingRecord.status) || '', onChange: (e) => {
                                                    const value = e.target.value;
                                                    if (value === '待收款' || value === '已收款' || value === '逾期' || value === '終止') {
                                                        handleFieldChange('status', value);
                                                    }
                                                }, label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u5F85\u6536\u6B3E", children: "\u5F85\u6536\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u5DF2\u6536\u6B3E", children: "\u5DF2\u6536\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u903E\u671F", children: "\u903E\u671F" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u7D42\u6B62", children: "\u7D42\u6B62" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6536\u6B3E\u65B9\u5F0F" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: (editingRecord === null || editingRecord === void 0 ? void 0 : editingRecord.paymentMethod) || '', onChange: (e) => {
                                                    const value = e.target.value;
                                                    if (value === '轉帳' || value === 'Line Pay' || value === '現金' || value === '票據' || value === '其他') {
                                                        handleFieldChange('paymentMethod', value);
                                                    }
                                                }, label: "\u6536\u6B3E\u65B9\u5F0F", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u8F49\u5E33", children: "\u8F49\u5E33" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "Line Pay", children: "Line Pay" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u73FE\u91D1", children: "\u73FE\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u7968\u64DA", children: "\u7968\u64DA" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u5176\u4ED6", children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5099\u8A3B", multiline: true, rows: 4, value: (editingRecord === null || editingRecord === void 0 ? void 0 : editingRecord.note) || '', onChange: (e) => handleFieldChange('note', e.target.value) }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setEditingRecord(null), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleEditSave, variant: "contained", children: "\u5132\u5B58" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: !!deleteRecord, onClose: () => setDeleteRecord(null), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { children: ["\u78BA\u5B9A\u8981\u522A\u9664 ", deleteRecord === null || deleteRecord === void 0 ? void 0 : deleteRecord.userName, " \u7684\u6B77\u53F2\u8A18\u9304\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002"] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDeleteRecord(null), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, variant: "contained", color: "error", children: "\u522A\u9664" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 3000, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), anchorOrigin: { vertical: 'top', horizontal: 'center' }, children: (0, jsx_runtime_1.jsx)(material_1.Alert, { onClose: () => setSnackbar(prev => ({ ...prev, open: false })), severity: snackbar.severity, children: snackbar.message }) })] }));
};
exports.FeeHistory = FeeHistory;
exports.default = exports.FeeHistory;
