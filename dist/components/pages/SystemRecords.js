"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const AuthContext_1 = require("../../contexts/AuthContext");
const systemRecords_service_1 = require("../../services/systemRecords.service");
const react_router_dom_1 = require("react-router-dom");
const TYPE_OPTIONS = [
    { value: '', label: '全部類別' },
    { value: '會費異動', label: '會費異動' },
    { value: '租金收款', label: '租金收款' },
    { value: '會員分潤', label: '會員分潤' }
];
const SystemRecords = () => {
    const { user } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'admin';
    const [records, setRecords] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [type, setType] = (0, react_1.useState)('');
    const [year, setYear] = (0, react_1.useState)('');
    const [keyword, setKeyword] = (0, react_1.useState)('');
    const [showHidden, setShowHidden] = (0, react_1.useState)(false);
    const [deleteDialog, setDeleteDialog] = (0, react_1.useState)({ open: false });
    const [snackbar, setSnackbar] = (0, react_1.useState)({ open: false, msg: '', severity: 'success' });
    // 權限檢查
    (0, react_1.useEffect)(() => {
        if (!isAdmin) {
            navigate('/services');
            return;
        }
        loadRecords();
    }, [isAdmin, navigate]);
    const loadRecords = async () => {
        if (!isAdmin)
            return;
        setLoading(true);
        try {
            const data = await systemRecords_service_1.systemRecordsService.getAllRecords();
            setRecords(data);
        }
        catch (error) {
            console.error('載入系統記錄失敗:', error);
            setSnackbar({ open: true, msg: '載入記錄失敗', severity: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    // 搜尋過濾
    const filtered = records.filter(r => (showHidden || !r.hidden) &&
        (type ? r.type === type : true) &&
        (year ? String(r.year) === String(year) : true) &&
        (keyword ? (r.desc.includes(keyword) || String(r.amount).includes(keyword) || (r.memberName && r.memberName.includes(keyword)) || (r.investmentName && r.investmentName.includes(keyword))) : true));
    // 獲取年份選項
    const yearOptions = [
        ...Array.from(new Set(records.map(r => r.year))).sort((a, b) => b - a).map(y => ({ value: y, label: y + ' 年' })),
        { value: '', label: '全部年份' }
    ];
    // 隱藏/顯示
    const handleToggleHidden = async (record) => {
        try {
            const success = await systemRecords_service_1.systemRecordsService.toggleRecordVisibility(record.id, !record.hidden);
            if (success) {
                setRecords(rs => rs.map(r => r.id === record.id ? { ...r, hidden: !r.hidden } : r));
                setSnackbar({ open: true, msg: '已切換顯示狀態', severity: 'success' });
            }
            else {
                setSnackbar({ open: true, msg: '切換顯示狀態失敗', severity: 'error' });
            }
        }
        catch (error) {
            setSnackbar({ open: true, msg: '操作失敗', severity: 'error' });
        }
    };
    // 刪除
    const handleDelete = async (record) => {
        try {
            const success = await systemRecords_service_1.systemRecordsService.deleteRecord(record.id);
            if (success) {
                setRecords(rs => rs.filter(r => r.id !== record.id));
                setSnackbar({ open: true, msg: '已刪除記錄', severity: 'success' });
            }
            else {
                setSnackbar({ open: true, msg: '刪除記錄失敗', severity: 'error' });
            }
        }
        catch (error) {
            setSnackbar({ open: true, msg: '刪除失敗', severity: 'error' });
        }
        setDeleteDialog({ open: false });
    };
    // 如果沒有權限，不顯示內容
    if (!isAdmin) {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { p: 3, maxWidth: 1200, mx: 'auto' }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", sx: { fontWeight: 'bold', mb: 2, background: 'linear-gradient(90deg,#1976d2,#f093fb)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Receipt, { sx: { mr: 1, verticalAlign: 'middle' } }), " \u7CFB\u7D71\u8A18\u9304\uFF08\u91D1\u6D41\u8A18\u9304\uFF09"] }), (0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 3, background: 'linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)', boxShadow: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.CardContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u985E\u5225" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: type, label: "\u985E\u5225", onChange: e => setType(e.target.value), startAdornment: (0, jsx_runtime_1.jsx)(icons_material_1.FilterList, { sx: { mr: 1 } }), children: TYPE_OPTIONS.map(opt => (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: opt.value, children: opt.label }, opt.value)) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u5E74\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: year, label: "\u5E74\u4EFD", onChange: e => setYear(e.target.value), children: yearOptions.map(opt => (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: opt.value, children: opt.label }, opt.value)) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 4, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u95DC\u9375\u5B57\u641C\u5C0B", value: keyword, onChange: e => setKeyword(e.target.value), InputProps: { startAdornment: (0, jsx_runtime_1.jsx)(icons_material_1.Search, { sx: { mr: 1 } }) } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 2, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: showHidden ? 'contained' : 'outlined', color: "secondary", fullWidth: true, onClick: () => setShowHidden(v => !v), children: showHidden ? '顯示全部' : '顯示隱藏' }) })] }) }) }), loading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', p: 4 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, sx: { borderRadius: 3, boxShadow: 4 }, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { sx: { background: 'linear-gradient(90deg,#1976d2,#f093fb)' }, children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { sx: { color: 'white', fontWeight: 'bold' }, children: "\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { sx: { color: 'white', fontWeight: 'bold' }, children: "\u985E\u5225" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { sx: { color: 'white', fontWeight: 'bold' }, children: "\u8AAA\u660E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { sx: { color: 'white', fontWeight: 'bold' }, children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { sx: { color: 'white', fontWeight: 'bold' }, children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { sx: { color: 'white', fontWeight: 'bold' }, children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [filtered.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 6, align: "center", children: "\u67E5\u7121\u8CC7\u6599" }) })), filtered.map(row => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { sx: { opacity: row.hidden ? 0.5 : 1, background: row.hidden ? '#eee' : 'inherit' }, children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: row.date }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: row.type, color: row.type === '會費異動' ? 'primary' : row.type === '租金收款' ? 'success' : 'secondary', icon: row.type === '會費異動' ? (0, jsx_runtime_1.jsx)(icons_material_1.AccountBalanceWallet, {}) : row.type === '租金收款' ? (0, jsx_runtime_1.jsx)(icons_material_1.Paid, {}) : (0, jsx_runtime_1.jsx)(icons_material_1.Receipt, {}) }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: row.desc }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { sx: { color: row.amount < 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }, children: row.amount.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: row.status }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: row.hidden ? '顯示' : '隱藏', children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: row.hidden ? 'success' : 'default', onClick: () => handleToggleHidden(row), children: row.hidden ? (0, jsx_runtime_1.jsx)(icons_material_1.Visibility, {}) : (0, jsx_runtime_1.jsx)(icons_material_1.VisibilityOff, {}) }) }), (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u522A\u9664", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "error", onClick: () => setDeleteDialog({ open: true, record: row }), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) }) })] })] }, row.id)))] })] }) })), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: deleteDialog.open, onClose: () => setDeleteDialog({ open: false }), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: ["\u78BA\u5B9A\u8981\u522A\u9664\u6B64\u7B46\u8A18\u9304\u55CE\uFF1F\u522A\u9664\u5F8C\u7121\u6CD5\u5FA9\u539F\u3002", deleteDialog.record && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u8A18\u9304\u8A73\u60C5\uFF1A" }), (0, jsx_runtime_1.jsx)("br", {}), "\u985E\u5225\uFF1A", deleteDialog.record.type, (0, jsx_runtime_1.jsx)("br", {}), "\u8AAA\u660E\uFF1A", deleteDialog.record.desc, (0, jsx_runtime_1.jsx)("br", {}), "\u91D1\u984D\uFF1A", deleteDialog.record.amount.toLocaleString(), (0, jsx_runtime_1.jsx)("br", {}), "\u65E5\u671F\uFF1A", deleteDialog.record.date] }) }))] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDeleteDialog({ open: false }), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { color: "error", variant: "contained", onClick: () => deleteDialog.record && handleDelete(deleteDialog.record), children: "\u522A\u9664" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 2500, onClose: () => setSnackbar({ ...snackbar, open: false }), children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: snackbar.severity, children: snackbar.msg }) })] }));
};
exports.default = SystemRecords;
