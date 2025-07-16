"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const investmentOpportunity_service_1 = require("../../../../services/investmentOpportunity.service");
const format_1 = require("../../../../utils/format");
const InquiryManagement = () => {
    var _a;
    const [inquiries, setInquiries] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [page, setPage] = (0, react_1.useState)(1);
    const [pageSize] = (0, react_1.useState)(20);
    // 對話框狀態
    const [detailDialogOpen, setDetailDialogOpen] = (0, react_1.useState)(false);
    const [editDialogOpen, setEditDialogOpen] = (0, react_1.useState)(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = (0, react_1.useState)(false);
    const [selectedInquiry, setSelectedInquiry] = (0, react_1.useState)(null);
    const [inquiryToDelete, setInquiryToDelete] = (0, react_1.useState)(null);
    // 篩選狀態
    const [filter, setFilter] = (0, react_1.useState)({
        status: '',
        search: '',
        investmentId: ''
    });
    // 編輯表單狀態
    const [editForm, setEditForm] = (0, react_1.useState)({
        status: 'new',
        admin_notes: ''
    });
    // 載入洽詢記錄
    const loadInquiries = async () => {
        setLoading(true);
        try {
            const result = await investmentOpportunity_service_1.investmentInquiryService.getInquiries(filter.investmentId || undefined, filter.status || undefined, page, pageSize);
            setInquiries(result.inquiries);
            setTotal(result.total);
            setError(null);
        }
        catch (err) {
            console.error('載入洽詢記錄失敗:', err);
            setError('載入洽詢記錄失敗，請稍後再試');
            setInquiries([]);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadInquiries();
    }, [filter, page]);
    // 取得狀態標籤
    const getStatusLabel = (status) => {
        const statusMap = {
            new: { label: '新洽詢', color: 'primary' },
            contacted: { label: '已聯繫', color: 'info' },
            interested: { label: '有興趣', color: 'success' },
            not_interested: { label: '無興趣', color: 'warning' },
            closed: { label: '已關閉', color: 'error' }
        };
        return statusMap[status] || { label: status, color: 'default' };
    };
    // 處理查看詳情
    const handleViewDetail = (inquiry) => {
        setSelectedInquiry(inquiry);
        setDetailDialogOpen(true);
    };
    // 處理編輯
    const handleEdit = (inquiry) => {
        setSelectedInquiry(inquiry);
        setEditForm({
            status: inquiry.status,
            admin_notes: inquiry.admin_notes || ''
        });
        setEditDialogOpen(true);
    };
    // 處理刪除
    const handleDeleteClick = (id) => {
        setInquiryToDelete(id);
        setDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (!inquiryToDelete)
            return;
        try {
            await investmentOpportunity_service_1.investmentInquiryService.deleteInquiry(inquiryToDelete);
            setInquiries(prev => prev.filter(item => item.id !== inquiryToDelete));
            setDeleteDialogOpen(false);
            setInquiryToDelete(null);
        }
        catch (error) {
            console.error('刪除失敗:', error);
            setError('刪除失敗，請稍後再試');
        }
    };
    // 處理編輯表單提交
    const handleEditSubmit = async () => {
        if (!selectedInquiry)
            return;
        try {
            const updated = await investmentOpportunity_service_1.investmentInquiryService.updateInquiry(selectedInquiry.id, editForm);
            setInquiries(prev => prev.map(item => item.id === selectedInquiry.id ? updated : item));
            setEditDialogOpen(false);
            setSelectedInquiry(null);
        }
        catch (error) {
            console.error('更新失敗:', error);
            setError('更新失敗，請稍後再試');
        }
    };
    // 格式化日期
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('zh-TW');
    };
    if (loading && inquiries.length === 0) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "xl", sx: { py: 4 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 4 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", component: "h1", gutterBottom: true, children: "\u6D3D\u8A62\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { p: 3, mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, placeholder: "\u641C\u5C0B\u6D3D\u8A62\u8A18\u9304...", value: filter.search, onChange: (e) => setFilter(prev => ({ ...prev, search: e.target.value })), InputProps: {
                                            startAdornment: (0, jsx_runtime_1.jsx)(icons_material_1.Search, { sx: { mr: 1, color: 'text.secondary' } }),
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: filter.status, label: "\u72C0\u614B", onChange: (e) => setFilter(prev => ({ ...prev, status: e.target.value })), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "new", children: "\u65B0\u6D3D\u8A62" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "contacted", children: "\u5DF2\u806F\u7E6B" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "interested", children: "\u6709\u8208\u8DA3" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "not_interested", children: "\u7121\u8208\u8DA3" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "closed", children: "\u5DF2\u95DC\u9589" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.FilterList, {}), onClick: () => setFilter({ status: '', search: '', investmentId: '' }), children: "\u6E05\u9664\u7BE9\u9078" }) })] }) })] }), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 3 }, children: error })), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6D3D\u8A62\u8005" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u6A19\u7684" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u806F\u7D61\u8CC7\u8A0A" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6D3D\u8A62\u6642\u9593" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [inquiries.map((inquiry) => {
                                    var _a;
                                    return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold' }, children: inquiry.name }), inquiry.company && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: inquiry.company }))] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: ((_a = inquiry.investment) === null || _a === void 0 ? void 0 : _a.title) || '未知標的' }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { spacing: 0.5, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Email, { sx: { fontSize: 16, mr: 0.5, color: 'text.secondary' } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: inquiry.email })] }), inquiry.phone && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Phone, { sx: { fontSize: 16, mr: 0.5, color: 'text.secondary' } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: inquiry.phone })] }))] }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: inquiry.investment_amount ? ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", color: "primary", sx: { fontWeight: 'bold' }, children: (0, format_1.formatCurrency)(inquiry.investment_amount) })) : ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u672A\u6307\u5B9A" })) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusLabel(inquiry.status).label, color: getStatusLabel(inquiry.status).color, size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: formatDate(inquiry.created_at) }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", spacing: 1, children: [(0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u67E5\u770B\u8A73\u60C5", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleViewDetail(inquiry), children: (0, jsx_runtime_1.jsx)(icons_material_1.Visibility, {}) }) }), (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u7DE8\u8F2F", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEdit(inquiry), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }) }), (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u522A\u9664", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleDeleteClick(inquiry.id), color: "error", children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) }) })] }) })] }, inquiry.id));
                                }), inquiries.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 7, align: "center", children: "\u5C1A\u7121\u6D3D\u8A62\u8A18\u9304" }) }))] })] }) }), total > pageSize && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', mt: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.Pagination, { count: Math.ceil(total / pageSize), page: page, onChange: (_, value) => setPage(value), color: "primary" }) })), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: detailDialogOpen, onClose: () => setDetailDialogOpen(false), maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u6D3D\u8A62\u8A73\u60C5" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: selectedInquiry && ((0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 2 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6D3D\u8A62\u8005\u8CC7\u8A0A" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u59D3\u540D" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold' }, children: selectedInquiry.name })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u96FB\u5B50\u90F5\u4EF6" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: selectedInquiry.email })] }), selectedInquiry.phone && ((0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u96FB\u8A71" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: selectedInquiry.phone })] })), selectedInquiry.company && ((0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u516C\u53F8" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: selectedInquiry.company })] }))] })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 2 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6295\u8CC7\u6A19\u7684\u8CC7\u8A0A" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold' }, children: ((_a = selectedInquiry.investment) === null || _a === void 0 ? void 0 : _a.title) || '未知標的' }), selectedInquiry.investment_amount && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", color: "primary", sx: { mt: 1 }, children: ["\u6295\u8CC7\u91D1\u984D: ", (0, format_1.formatCurrency)(selectedInquiry.investment_amount)] }))] }) }) }), selectedInquiry.message && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6D3D\u8A62\u5167\u5BB9" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: selectedInquiry.message })] }) }) }))] })) }), (0, jsx_runtime_1.jsx)(material_1.DialogActions, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDetailDialogOpen(false), children: "\u95DC\u9589" }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: editDialogOpen, onClose: () => setEditDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u7DE8\u8F2F\u6D3D\u8A62\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: editForm.status, label: "\u72C0\u614B", onChange: (e) => setEditForm(prev => ({ ...prev, status: e.target.value })), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "new", children: "\u65B0\u6D3D\u8A62" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "contacted", children: "\u5DF2\u806F\u7E6B" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "interested", children: "\u6709\u8208\u8DA3" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "not_interested", children: "\u7121\u8208\u8DA3" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "closed", children: "\u5DF2\u95DC\u9589" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7BA1\u7406\u54E1\u5099\u8A3B", multiline: true, rows: 4, value: editForm.admin_notes, onChange: (e) => setEditForm(prev => ({ ...prev, admin_notes: e.target.value })), placeholder: "\u8F38\u5165\u7BA1\u7406\u54E1\u5099\u8A3B..." }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setEditDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleEditSubmit, variant: "contained", children: "\u5132\u5B58" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: deleteDialogOpen, onClose: () => setDeleteDialogOpen(false), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u9019\u7B46\u6D3D\u8A62\u8A18\u9304\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002" }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDeleteDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, color: "error", children: "\u522A\u9664" })] })] })] }));
};
exports.default = InquiryManagement;
