"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const investmentOpportunity_service_1 = require("../../../services/investmentOpportunity.service");
const InvestmentInquiryManagement = () => {
    const [inquiries, setInquiries] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [selectedInquiry, setSelectedInquiry] = (0, react_1.useState)(null);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [page, setPage] = (0, react_1.useState)(1);
    const [pageSize] = (0, react_1.useState)(20);
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        loadInquiries();
    }, [page, statusFilter]);
    const loadInquiries = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString()
            });
            if (statusFilter) {
                params.append('status', statusFilter);
            }
            const result = await investmentOpportunity_service_1.investmentInquiryService.getInquiries(undefined, statusFilter || undefined, page, pageSize);
            setInquiries(result.inquiries || []);
            setTotal(result.total || 0);
        }
        catch (err) {
            setError('載入洽詢記錄失敗');
            console.error('載入洽詢記錄失敗:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleView = (inquiry) => {
        setSelectedInquiry(inquiry);
        setDialogOpen(true);
    };
    const handleUpdateStatus = async (id, status, adminNotes) => {
        try {
            await investmentOpportunity_service_1.investmentInquiryService.updateInquiry(id, {
                status: status,
                admin_notes: adminNotes
            });
            await loadInquiries();
            setDialogOpen(false);
        }
        catch (err) {
            setError('更新洽詢狀態失敗');
            console.error('更新洽詢狀態失敗:', err);
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('確定要刪除此洽詢記錄嗎？')) {
            try {
                await investmentOpportunity_service_1.investmentInquiryService.deleteInquiry(id);
                await loadInquiries();
            }
            catch (err) {
                setError('刪除洽詢記錄失敗');
                console.error('刪除洽詢記錄失敗:', err);
            }
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'warning';
            case 'contacted': return 'info';
            case 'interested': return 'success';
            case 'not_interested': return 'error';
            case 'closed': return 'default';
            default: return 'default';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'new': return '新洽詢';
            case 'contacted': return '已聯絡';
            case 'interested': return '有興趣';
            case 'not_interested': return '無興趣';
            case 'closed': return '已結束';
            default: return status;
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('zh-TW');
    };
    const formatAmount = (amount) => {
        if (!amount)
            return '未指定';
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", component: "h1", children: "\u6295\u8CC7\u6D3D\u8A62\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { minWidth: 200 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B\u7BE9\u9078" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), label: "\u72C0\u614B\u7BE9\u9078", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "new", children: "\u65B0\u6D3D\u8A62" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "contacted", children: "\u5DF2\u806F\u7D61" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "interested", children: "\u6709\u8208\u8DA3" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "not_interested", children: "\u7121\u8208\u8DA3" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "closed", children: "\u5DF2\u7D50\u675F" })] })] })] }), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 2 }, children: error })), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 3, children: inquiries.map((inquiry) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, lg: 4, children: (0, jsx_runtime_1.jsxs)(material_1.Card, { children: [(0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", component: "h2", sx: { flex: 1 }, children: inquiry.name }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusText(inquiry.status), color: getStatusColor(inquiry.status), size: "small" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { display: 'flex', alignItems: 'center', mb: 1 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Email, { sx: { mr: 1, fontSize: 16 } }), inquiry.email] }), inquiry.phone && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { display: 'flex', alignItems: 'center', mb: 1 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Phone, { sx: { mr: 1, fontSize: 16 } }), inquiry.phone] })), inquiry.company && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { display: 'flex', alignItems: 'center', mb: 1 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Business, { sx: { mr: 1, fontSize: 16 } }), inquiry.company] }))] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: ["\u6295\u8CC7\u6A19\u7684: ", inquiry.investment_title || '未知'] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: ["\u6295\u8CC7\u91D1\u984D: ", formatAmount(inquiry.investment_amount)] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: ["\u6D3D\u8A62\u6642\u9593: ", formatDate(inquiry.created_at)] }), inquiry.message && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: {
                                            mb: 1,
                                            fontStyle: 'italic',
                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                            p: 1,
                                            borderRadius: 1
                                        }, children: inquiry.message.length > 100
                                            ? `${inquiry.message.substring(0, 100)}...`
                                            : inquiry.message }))] }), (0, jsx_runtime_1.jsxs)(material_1.CardActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Visibility, {}), onClick: () => handleView(inquiry), children: "\u67E5\u770B\u8A73\u60C5" }), (0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", color: "error", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}), onClick: () => handleDelete(inquiry.id), children: "\u522A\u9664" })] })] }) }, inquiry.id))) }), inquiries.length === 0 && !loading && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { textAlign: 'center', py: 8 }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "text.secondary", children: "\u76EE\u524D\u6C92\u6709\u6D3D\u8A62\u8A18\u9304" }) })), total > pageSize && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', mt: 4 }, children: (0, jsx_runtime_1.jsx)(material_1.Pagination, { count: Math.ceil(total / pageSize), page: page, onChange: (e, newPage) => setPage(newPage), color: "primary" }) })), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsxs)(material_1.DialogTitle, { children: ["\u6D3D\u8A62\u8A73\u60C5 - ", selectedInquiry === null || selectedInquiry === void 0 ? void 0 : selectedInquiry.name] }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: selectedInquiry && ((0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u59D3\u540D", value: selectedInquiry.name, InputProps: { readOnly: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96FB\u5B50\u90F5\u4EF6", value: selectedInquiry.email, InputProps: { readOnly: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96FB\u8A71", value: selectedInquiry.phone || '', InputProps: { readOnly: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u516C\u53F8", value: selectedInquiry.company || '', InputProps: { readOnly: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6295\u8CC7\u6A19\u7684", value: selectedInquiry.investment_title || '', InputProps: { readOnly: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6295\u8CC7\u91D1\u984D", value: formatAmount(selectedInquiry.investment_amount), InputProps: { readOnly: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6D3D\u8A62\u8A0A\u606F", value: selectedInquiry.message || '', multiline: true, rows: 4, InputProps: { readOnly: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: selectedInquiry.status, onChange: (e) => {
                                                    setSelectedInquiry({
                                                        ...selectedInquiry,
                                                        status: e.target.value
                                                    });
                                                }, label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "new", children: "\u65B0\u6D3D\u8A62" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "contacted", children: "\u5DF2\u806F\u7D61" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "interested", children: "\u6709\u8208\u8DA3" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "not_interested", children: "\u7121\u8208\u8DA3" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "closed", children: "\u5DF2\u7D50\u675F" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7BA1\u7406\u54E1\u5099\u8A3B", value: selectedInquiry.admin_notes || '', multiline: true, rows: 3, onChange: (e) => {
                                            setSelectedInquiry({
                                                ...selectedInquiry,
                                                admin_notes: e.target.value
                                            });
                                        } }) })] })) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => {
                                    if (selectedInquiry) {
                                        handleUpdateStatus(selectedInquiry.id, selectedInquiry.status, selectedInquiry.admin_notes);
                                    }
                                }, variant: "contained", children: "\u66F4\u65B0\u72C0\u614B" })] })] })] }));
};
exports.default = InvestmentInquiryManagement;
