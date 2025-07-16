"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const dayjs_1 = __importDefault(require("dayjs"));
const accountingApi_service_1 = require("../../../../services/accountingApi.service");
const MonthlyClosingTab = () => {
    var _a, _b;
    // 狀態變數
    const [monthlyClosings, setMonthlyClosings] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [yearFilter, setYearFilter] = (0, react_1.useState)(new Date().getFullYear());
    const [createDialogOpen, setCreateDialogOpen] = (0, react_1.useState)(false);
    const [detailDialogOpen, setDetailDialogOpen] = (0, react_1.useState)(false);
    const [selectedMonth, setSelectedMonth] = (0, react_1.useState)(new Date().getMonth() + 1);
    const [selectedMonthlyClosing, setSelectedMonthlyClosing] = (0, react_1.useState)(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = (0, react_1.useState)(false);
    const [detailLoading, setDetailLoading] = (0, react_1.useState)(false);
    const [detailData, setDetailData] = (0, react_1.useState)(null);
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'success'
    });
    // 生成所有可選月份
    const availableMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    // 計算已執行月結的月份，避免重複
    const completedMonths = monthlyClosings
        .filter(closing => closing.year === yearFilter)
        .map(closing => closing.month);
    // 可選月份為那些尚未完成月結的月份
    const selectableMonths = availableMonths.filter(month => !completedMonths.includes(month));
    // 載入資料
    (0, react_1.useEffect)(() => {
        loadMonthlyClosings();
    }, []);
    const loadMonthlyClosings = async () => {
        setLoading(true);
        try {
            const data = await accountingApi_service_1.monthlyClosingApiService.getMonthlyClosings();
            setMonthlyClosings(data);
        }
        catch (error) {
            console.error('獲取月結記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '獲取月結記錄失敗',
                severity: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    // 依年份過濾月結記錄
    const filteredClosings = monthlyClosings.filter(closing => closing.year === yearFilter);
    // 處理建立月結對話框
    const handleOpenCreateDialog = () => {
        // 默認選擇第一個可選月份
        if (selectableMonths.length > 0) {
            setSelectedMonth(selectableMonths[0]);
        }
        setCreateDialogOpen(true);
    };
    const handleCloseCreateDialog = () => {
        setCreateDialogOpen(false);
    };
    // 處理月結詳情對話框
    const handleOpenDetailDialog = async (monthlyClosing) => {
        setSelectedMonthlyClosing(monthlyClosing);
        setDetailLoading(true);
        setDetailDialogOpen(true);
        try {
            // 獲取月結詳情
            const detail = await accountingApi_service_1.monthlyClosingApiService.getMonthlyClosing(monthlyClosing.id);
            setDetailData(detail);
        }
        catch (error) {
            console.error('獲取月結詳情失敗:', error);
            setSnackbar({
                open: true,
                message: '獲取月結詳情失敗',
                severity: 'error'
            });
        }
        finally {
            setDetailLoading(false);
        }
    };
    const handleCloseDetailDialog = () => {
        setDetailDialogOpen(false);
        setSelectedMonthlyClosing(null);
        setDetailData(null);
    };
    // 處理確認對話框
    const handleOpenConfirmDialog = (monthlyClosing) => {
        setSelectedMonthlyClosing(monthlyClosing);
        setConfirmDialogOpen(true);
    };
    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
    };
    // 建立月結
    const handleCreateMonthlyClosing = async () => {
        try {
            const newClosing = await accountingApi_service_1.monthlyClosingApiService.createMonthlyClosing({
                year: yearFilter,
                month: selectedMonth
            });
            setMonthlyClosings(prev => [...prev, newClosing]);
            setSnackbar({
                open: true,
                message: '月結記錄已建立',
                severity: 'success'
            });
            handleCloseCreateDialog();
        }
        catch (error) {
            console.error('建立月結記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '建立月結記錄失敗',
                severity: 'error'
            });
        }
    };
    // 確認月結
    const handleFinalizeMonthlyClosing = async () => {
        if (!selectedMonthlyClosing)
            return;
        try {
            const finalizedClosing = await accountingApi_service_1.monthlyClosingApiService.updateMonthlyClosing(selectedMonthlyClosing.id, {
                status: 'finalized'
            });
            setMonthlyClosings(prev => prev.map(closing => closing.id === finalizedClosing.id ? finalizedClosing : closing));
            setSnackbar({
                open: true,
                message: '月結已確認',
                severity: 'success'
            });
            handleCloseConfirmDialog();
        }
        catch (error) {
            console.error('確認月結失敗:', error);
            setSnackbar({
                open: true,
                message: '確認月結失敗',
                severity: 'error'
            });
        }
    };
    // 获取月份名称
    const getMonthName = (month) => {
        const monthNames = [
            '一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月'
        ];
        return monthNames[month - 1];
    };
    // 渲染內容
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", children: "\u6708\u7D50\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { minWidth: 120, mr: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: yearFilter, label: "\u5E74\u5EA6", onChange: (e) => setYearFilter(Number(e.target.value)), children: Array.from({ length: 5 }, (_, i) => yearFilter - 2 + i).map(year => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: year, children: year }, year))) })] }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: handleOpenCreateDialog, disabled: selectableMonths.length === 0, children: "\u5EFA\u7ACB\u6708\u7D50" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, sx: { mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u5DF2\u8655\u7406\u6708\u7D50\u5831\u8868\u6578" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", color: "primary", children: [filteredClosings.length, " / 12"] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "textSecondary", children: [yearFilter, "\u5E74\u5EA6"] })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u5DF2\u78BA\u8A8D\u6708\u7D50\u6578" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", color: "success.main", children: filteredClosings.filter(c => c.status === 'finalized').length }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "textSecondary", children: [yearFilter, "\u5E74\u5EA6"] })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u5F85\u78BA\u8A8D\u6708\u7D50\u6578" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", color: "warning.main", children: filteredClosings.filter(c => c.status === 'pending').length }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "textSecondary", children: [yearFilter, "\u5E74\u5EA6"] })] }) }) })] }), loading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', mt: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6708\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u6536\u5165\u7E3D\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u652F\u51FA\u7E3D\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u6DE8\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6708\u7D50\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: filteredClosings.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 8, align: "center", children: "\u5C1A\u7121\u6708\u7D50\u8A18\u9304" }) })) : (filteredClosings.map(closing => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: closing.year }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getMonthName(closing.month) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { color: 'success.main' }, children: closing.totalIncome.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { color: 'error.main' }, children: closing.totalExpense.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: {
                                            fontWeight: 'bold',
                                            color: closing.netAmount >= 0 ? 'success.main' : 'error.main'
                                        }, children: closing.netAmount.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: closing.status === 'finalized' ? '已確認' : '處理中', color: closing.status === 'finalized' ? 'success' : 'warning', size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: closing.closingDate ? (0, dayjs_1.default)(closing.closingDate).format('YYYY/MM/DD') : '-' }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "primary", onClick: () => handleOpenDetailDialog(closing), title: "\u67E5\u770B\u8A73\u60C5", children: (0, jsx_runtime_1.jsx)(icons_material_1.Visibility, {}) }), closing.status === 'pending' && ((0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "success", onClick: () => handleOpenConfirmDialog(closing), title: "\u78BA\u8A8D\u6708\u7D50", children: (0, jsx_runtime_1.jsx)(icons_material_1.CheckCircle, {}) }))] })] }, closing.id)))) })] }) })), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: createDialogOpen, onClose: handleCloseCreateDialog, maxWidth: "xs", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u5EFA\u7ACB\u6708\u7D50" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u5C07\u70BA\u4EE5\u4E0B\u6708\u4EFD\u5EFA\u7ACB\u6708\u7D50\uFF1A" }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6708\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: selectedMonth, label: "\u6708\u4EFD", onChange: (e) => setSelectedMonth(Number(e.target.value)), children: selectableMonths.map(month => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: month, children: getMonthName(month) }, month))) })] })] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u6CE8\u610F\uFF1A\u5EFA\u7ACB\u6708\u7D50\u5F8C\u5C07\u8A08\u7B97\u8A72\u6708\u6240\u6709\u6536\u5165\u8207\u652F\u51FA\uFF0C\u5F62\u6210\u6708\u7D50\u5831\u8868\u3002" }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseCreateDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCreateMonthlyClosing, variant: "contained", color: "primary", disabled: !selectedMonth, children: "\u5EFA\u7ACB" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: detailDialogOpen, onClose: handleCloseDetailDialog, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsxs)(material_1.DialogTitle, { children: ["\u6708\u7D50\u8A73\u60C5 - ", selectedMonthlyClosing === null || selectedMonthlyClosing === void 0 ? void 0 : selectedMonthlyClosing.year, "\u5E74", getMonthName((selectedMonthlyClosing === null || selectedMonthlyClosing === void 0 ? void 0 : selectedMonthlyClosing.month) || 1)] }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { dividers: true, children: detailLoading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', my: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : selectedMonthlyClosing ? ((0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u8CA1\u52D9\u6458\u8981" }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: selectedMonthlyClosing.status === 'finalized' ? '已確認' : '處理中', color: selectedMonthlyClosing.status === 'finalized' ? 'success' : 'warning' })] }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { my: 2 } }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u6536\u5165\u7E3D\u984D" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "success.main", children: selectedMonthlyClosing.totalIncome.toLocaleString() })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u652F\u51FA\u7E3D\u984D" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "error.main", children: selectedMonthlyClosing.totalExpense.toLocaleString() })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u6DE8\u984D" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: {
                                                                        color: selectedMonthlyClosing.netAmount >= 0
                                                                            ? 'success.main'
                                                                            : 'error.main'
                                                                    }, children: selectedMonthlyClosing.netAmount.toLocaleString() })] })] })] }) }) }), detailData && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { mb: 2 }, children: "\u6536\u5165\u660E\u7D30" }), (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u5225" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u5360\u6BD4" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: (_a = detailData.incomeByCategory) === null || _a === void 0 ? void 0 : _a.map((item) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: item.category }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: item.amount.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [(item.amount / selectedMonthlyClosing.totalIncome * 100).toFixed(1), "%"] })] }, item.category))) })] })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { mb: 2 }, children: "\u652F\u51FA\u660E\u7D30" }), (0, jsx_runtime_1.jsxs)(material_1.Table, { size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u5225" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u5360\u6BD4" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: (_b = detailData.expenseByCategory) === null || _b === void 0 ? void 0 : _b.map((item) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: item.category }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: item.amount.toLocaleString() }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [(item.amount / selectedMonthlyClosing.totalExpense * 100).toFixed(1), "%"] })] }, item.category))) })] })] }) }) })] })), selectedMonthlyClosing.status === 'finalized' && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.Alert, { severity: "info", children: ["\u672C\u6708\u7D50\u5DF2\u65BC ", (0, dayjs_1.default)(selectedMonthlyClosing.closingDate).format('YYYY/MM/DD HH:mm'), " \u78BA\u8A8D\u5B8C\u6210"] }) }))] })) : ((0, jsx_runtime_1.jsx)(material_1.Typography, { children: "\u7121\u6CD5\u8F09\u5165\u6708\u7D50\u8A73\u60C5" })) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(selectedMonthlyClosing === null || selectedMonthlyClosing === void 0 ? void 0 : selectedMonthlyClosing.status) === 'pending' && ((0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => {
                                    handleCloseDetailDialog();
                                    handleOpenConfirmDialog(selectedMonthlyClosing);
                                }, color: "success", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.CheckCircle, {}), children: "\u78BA\u8A8D\u6708\u7D50" })), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseDetailDialog, children: "\u95DC\u9589" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: confirmDialogOpen, onClose: handleCloseConfirmDialog, maxWidth: "xs", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u6708\u7D50" }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", gutterBottom: true, children: ["\u78BA\u5B9A\u8981\u78BA\u8A8D ", selectedMonthlyClosing === null || selectedMonthlyClosing === void 0 ? void 0 : selectedMonthlyClosing.year, "\u5E74", getMonthName((selectedMonthlyClosing === null || selectedMonthlyClosing === void 0 ? void 0 : selectedMonthlyClosing.month) || 1), " \u7684\u6708\u7D50\u55CE\uFF1F"] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u78BA\u8A8D\u5F8C\uFF0C\u8A72\u6708\u7684\u8CA1\u52D9\u8A18\u9304\u5C07\u88AB\u9396\u5B9A\uFF0C\u7121\u6CD5\u518D\u9032\u884C\u4FEE\u6539\u3002" })] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseConfirmDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleFinalizeMonthlyClosing, variant: "contained", color: "primary", children: "\u78BA\u8A8D" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 5000, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: snackbar.severity, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), children: snackbar.message }) })] }));
};
exports.default = MonthlyClosingTab;
