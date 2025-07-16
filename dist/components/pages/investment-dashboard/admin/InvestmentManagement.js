"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_router_dom_1 = require("react-router-dom");
const investmentOpportunity_service_1 = require("../../../../services/investmentOpportunity.service");
const InvestmentForm_1 = __importDefault(require("./InvestmentForm"));
const InvestmentManagement = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [opportunities, setOpportunities] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [page, setPage] = (0, react_1.useState)(1);
    const [pageSize] = (0, react_1.useState)(10);
    // 對話框狀態
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [editingOpportunity, setEditingOpportunity] = (0, react_1.useState)(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = (0, react_1.useState)(false);
    const [opportunityToDelete, setOpportunityToDelete] = (0, react_1.useState)(null);
    // 篩選狀態
    const [filter, setFilter] = (0, react_1.useState)({
        status: '',
        search: ''
    });
    // 載入投資標的
    const loadOpportunities = async () => {
        setLoading(true);
        try {
            const result = await investmentOpportunity_service_1.investmentOpportunityService.getInvestmentOpportunities(filter.status ? { status: filter.status } : undefined, 'created_at', 'desc', page, pageSize);
            setOpportunities(result.opportunities);
            setTotal(result.total);
            setError(null);
        }
        catch (err) {
            console.error('載入投資標的失敗:', err);
            setError('載入投資標的失敗，請稍後再試');
            setOpportunities([]);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadOpportunities();
    }, [filter, page]);
    // 格式化金額
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };
    // 取得狀態標籤
    const getStatusLabel = (status) => {
        const statusMap = {
            preview: { label: '預告', color: 'warning' },
            active: { label: '上市', color: 'success' },
            hidden: { label: '隱藏', color: 'default' },
            closed: { label: '關閉', color: 'error' }
        };
        return statusMap[status] || { label: status, color: 'default' };
    };
    // 取得投資類型標籤
    const getInvestmentTypeLabel = (type) => {
        const typeMap = {
            lease: '租賃投資',
            equity: '股權投資',
            debt: '債權投資',
            real_estate: '房地產',
            other: '其他'
        };
        return typeMap[type] || type;
    };
    // 處理新增
    const handleAdd = () => {
        setEditingOpportunity(null);
        setDialogOpen(true);
    };
    // 處理編輯
    const handleEdit = (opportunity) => {
        setEditingOpportunity(opportunity);
        setDialogOpen(true);
    };
    // 處理刪除
    const handleDeleteClick = (id) => {
        setOpportunityToDelete(id);
        setDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (!opportunityToDelete)
            return;
        try {
            await investmentOpportunity_service_1.investmentOpportunityService.deleteInvestmentOpportunity(opportunityToDelete);
            setOpportunities(prev => prev.filter(item => item.id !== opportunityToDelete));
            setDeleteDialogOpen(false);
            setOpportunityToDelete(null);
        }
        catch (error) {
            console.error('刪除失敗:', error);
            setError('刪除失敗，請稍後再試');
        }
    };
    // 處理狀態變更
    const handleStatusChange = async (id, newStatus) => {
        try {
            await investmentOpportunity_service_1.investmentOpportunityService.updateInvestmentStatus(id, newStatus);
            setOpportunities(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        }
        catch (error) {
            console.error('更新狀態失敗:', error);
            setError('更新狀態失敗，請稍後再試');
        }
    };
    // 處理表單提交
    const handleFormSubmit = async (data, images) => {
        try {
            if (editingOpportunity) {
                // 更新
                const updated = await investmentOpportunity_service_1.investmentOpportunityService.updateInvestmentOpportunity(editingOpportunity.id, { ...data, images });
                setOpportunities(prev => prev.map(item => item.id === editingOpportunity.id ? updated : item));
            }
            else {
                // 新增
                const created = await investmentOpportunity_service_1.investmentOpportunityService.createInvestmentOpportunity({ ...data, images });
                setOpportunities(prev => [created, ...prev]);
            }
            setDialogOpen(false);
            setEditingOpportunity(null);
        }
        catch (error) {
            console.error('儲存失敗:', error);
            setError('儲存失敗，請稍後再試');
        }
    };
    // 處理洽詢管理
    const handleInquiryManagement = () => {
        navigate('/investment-dashboard-management/inquiries');
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "xl", sx: { py: 4 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", component: "h1", sx: { fontWeight: 'bold' }, children: "\u6295\u8CC7\u6A19\u7684\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Message, {}), onClick: handleInquiryManagement, children: "\u6D3D\u8A62\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: handleAdd, children: "\u65B0\u589E\u6295\u8CC7\u6A19\u7684" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { p: 3, mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, placeholder: "\u641C\u5C0B\u6A19\u7684\u540D\u7A31...", value: filter.search, onChange: (e) => setFilter(prev => ({ ...prev, search: e.target.value })), InputProps: {
                                    startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Search, {}) }))
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: filter.status, onChange: (e) => setFilter(prev => ({ ...prev, status: e.target.value })), label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "preview", children: "\u9810\u544A" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "active", children: "\u4E0A\u5E02" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "hidden", children: "\u96B1\u85CF" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "closed", children: "\u95DC\u9589" })] })] }) })] }) }), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 3 }, children: error })), loading && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', py: 4 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })), !loading && ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6A19\u7684\u540D\u7A31" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u6295\u8CC7\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u9810\u671F\u5831\u916C\u7387" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "center", children: "\u7279\u8272" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "center", children: "\u700F\u89BD/\u6D3D\u8A62" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "center", children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: opportunities.map((opportunity) => {
                                const statusInfo = getStatusLabel(opportunity.status);
                                return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold' }, children: opportunity.title }), opportunity.subtitle && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: opportunity.subtitle }))] }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getInvestmentTypeLabel(opportunity.investment_type) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: formatAmount(opportunity.investment_amount) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: opportunity.expected_return ? `${opportunity.expected_return}%` : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: statusInfo.label, color: statusInfo.color, size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "center", children: (0, jsx_runtime_1.jsx)(material_1.Switch, { checked: opportunity.featured, onChange: (e) => {
                                                    // 這裡可以添加更新特色狀態的邏輯
                                                }, size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "center", children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: [opportunity.view_count, " / ", opportunity.inquiry_count] }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "center", children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u7DE8\u8F2F", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEdit(opportunity), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }) }), (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u522A\u9664", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleDeleteClick(opportunity.id), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) }) })] }) })] }, opportunity.id));
                            }) })] }) })), total > pageSize && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', mt: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.Pagination, { count: Math.ceil(total / pageSize), page: page, onChange: (_, value) => setPage(value), color: "primary" }) })), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: editingOpportunity ? '編輯投資標的' : '新增投資標的' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(InvestmentForm_1.default, { opportunity: editingOpportunity, onSubmit: handleFormSubmit }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: deleteDialogOpen, onClose: () => setDeleteDialogOpen(false), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u9019\u500B\u6295\u8CC7\u6A19\u7684\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002" }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDeleteDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, color: "error", children: "\u522A\u9664" })] })] })] }));
};
exports.default = InvestmentManagement;
