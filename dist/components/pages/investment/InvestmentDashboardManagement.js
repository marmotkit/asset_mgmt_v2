"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_router_dom_1 = require("react-router-dom");
const investmentOpportunity_service_1 = require("../../../services/investmentOpportunity.service");
const InvestmentDashboardManagement = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [opportunities, setOpportunities] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [editingOpportunity, setEditingOpportunity] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        title: '',
        description: '',
        investment_type: 'other',
        investment_amount: 0,
        min_investment: 0,
        max_investment: 0,
        expected_return: 0,
        investment_period: 0,
        risk_level: 'medium',
        location: '',
        status: 'active'
    });
    (0, react_1.useEffect)(() => {
        loadOpportunities();
    }, []);
    const loadOpportunities = async () => {
        try {
            setLoading(true);
            const result = await investmentOpportunity_service_1.investmentOpportunityService.getInvestmentOpportunities();
            setOpportunities(result.opportunities || []);
        }
        catch (err) {
            setError('載入投資標的失敗');
            console.error('載入投資標的失敗:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddNew = () => {
        setEditingOpportunity(null);
        setFormData({
            title: '',
            description: '',
            investment_type: 'other',
            investment_amount: 0,
            min_investment: 0,
            max_investment: 0,
            expected_return: 0,
            investment_period: 0,
            risk_level: 'medium',
            location: '',
            status: 'active'
        });
        setDialogOpen(true);
    };
    const handleEdit = (opportunity) => {
        setEditingOpportunity(opportunity);
        setFormData({
            title: opportunity.title,
            description: opportunity.description,
            investment_type: opportunity.investment_type,
            investment_amount: opportunity.investment_amount,
            min_investment: opportunity.min_investment,
            max_investment: opportunity.max_investment,
            expected_return: opportunity.expected_return,
            investment_period: opportunity.investment_period,
            risk_level: opportunity.risk_level,
            location: opportunity.location,
            status: opportunity.status
        });
        setDialogOpen(true);
    };
    const handleDelete = async (id) => {
        if (window.confirm('確定要刪除此投資標的嗎？')) {
            try {
                await investmentOpportunity_service_1.investmentOpportunityService.deleteInvestmentOpportunity(id);
                await loadOpportunities();
            }
            catch (err) {
                setError('刪除投資標的失敗');
                console.error('刪除投資標的失敗:', err);
            }
        }
    };
    const handleSave = async () => {
        try {
            if (editingOpportunity) {
                const updateData = {
                    title: formData.title,
                    description: formData.description,
                    investment_type: formData.investment_type,
                    investment_amount: formData.investment_amount,
                    min_investment: formData.min_investment,
                    max_investment: formData.max_investment,
                    expected_return: formData.expected_return,
                    investment_period: formData.investment_period,
                    risk_level: formData.risk_level,
                    location: formData.location,
                    status: formData.status
                };
                await investmentOpportunity_service_1.investmentOpportunityService.updateInvestmentOpportunity(editingOpportunity.id, updateData);
            }
            else {
                const createData = {
                    title: formData.title,
                    description: formData.description,
                    investment_type: formData.investment_type,
                    investment_amount: formData.investment_amount,
                    min_investment: formData.min_investment,
                    max_investment: formData.max_investment,
                    expected_return: formData.expected_return,
                    investment_period: formData.investment_period,
                    risk_level: formData.risk_level,
                    location: formData.location,
                    status: formData.status
                };
                await investmentOpportunity_service_1.investmentOpportunityService.createInvestmentOpportunity(createData);
            }
            setDialogOpen(false);
            await loadOpportunities();
        }
        catch (err) {
            setError('儲存投資標的失敗');
            console.error('儲存投資標的失敗:', err);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'preview': return 'warning';
            case 'hidden': return 'default';
            case 'closed': return 'error';
            default: return 'default';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'active': return '啟用';
            case 'preview': return '預覽';
            case 'hidden': return '隱藏';
            case 'closed': return '已結束';
            default: return status;
        }
    };
    const getInvestmentTypeText = (type) => {
        switch (type) {
            case 'lease': return '租賃投資';
            case 'equity': return '股權投資';
            case 'debt': return '債權投資';
            case 'real_estate': return '房地產';
            case 'other': return '其他';
            default: return type;
        }
    };
    const getRiskLevelText = (level) => {
        switch (level) {
            case 'low': return '低風險';
            case 'medium': return '中等';
            case 'high': return '高風險';
            default: return level;
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", component: "h1", children: "\u6295\u8CC7\u770B\u677F\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", onClick: () => navigate('/investment-inquiry-management'), size: "large", children: "\u6D3D\u8A62\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: handleAddNew, size: "large", children: "\u65B0\u589E\u6295\u8CC7\u6A19\u7684" })] })] }), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 2 }, children: error })), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 3, children: opportunities.map((opportunity) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, lg: 4, children: (0, jsx_runtime_1.jsxs)(material_1.Card, { children: [(0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", component: "h2", sx: { flex: 1 }, children: opportunity.title }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusText(opportunity.status), color: getStatusColor(opportunity.status), size: "small" })] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: opportunity.description.length > 100
                                            ? `${opportunity.description.substring(0, 100)}...`
                                            : opportunity.description }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u6295\u8CC7\u985E\u578B: ", getInvestmentTypeText(opportunity.investment_type)] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u6295\u8CC7\u91D1\u984D: $", opportunity.investment_amount.toLocaleString()] }), opportunity.min_investment && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u6700\u4F4E\u6295\u8CC7: $", opportunity.min_investment.toLocaleString()] })), opportunity.expected_return && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u9810\u671F\u5831\u916C: ", opportunity.expected_return, "%"] })), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u98A8\u96AA\u7B49\u7D1A: ", getRiskLevelText(opportunity.risk_level)] })] }), opportunity.location && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u5730\u9EDE: ", opportunity.location] }))] }), (0, jsx_runtime_1.jsxs)(material_1.CardActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Visibility, {}), children: "\u67E5\u770B\u8A73\u60C5" }), (0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}), onClick: () => handleEdit(opportunity), children: "\u7DE8\u8F2F" }), (0, jsx_runtime_1.jsx)(material_1.Button, { size: "small", color: "error", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}), onClick: () => handleDelete(opportunity.id), children: "\u522A\u9664" })] })] }) }, opportunity.id))) }), opportunities.length === 0 && !loading && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { textAlign: 'center', py: 8 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "text.secondary", children: "\u76EE\u524D\u6C92\u6709\u6295\u8CC7\u6A19\u7684" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "\u9EDE\u64CA\u300C\u65B0\u589E\u6295\u8CC7\u6A19\u7684\u300D\u958B\u59CB\u5EFA\u7ACB" })] })), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: editingOpportunity ? '編輯投資標的' : '新增投資標的' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6A19\u984C", value: formData.title, onChange: (e) => handleInputChange('title', e.target.value), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u63CF\u8FF0", value: formData.description, onChange: (e) => handleInputChange('description', e.target.value), multiline: true, rows: 4, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, required: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6295\u8CC7\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.investment_type, onChange: (e) => handleInputChange('investment_type', e.target.value), label: "\u6295\u8CC7\u985E\u578B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "lease", children: "\u79DF\u8CC3\u6295\u8CC7" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "equity", children: "\u80A1\u6B0A\u6295\u8CC7" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "debt", children: "\u50B5\u6B0A\u6295\u8CC7" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "real_estate", children: "\u623F\u5730\u7522" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "other", children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, required: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u98A8\u96AA\u7B49\u7D1A" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.risk_level, onChange: (e) => handleInputChange('risk_level', e.target.value), label: "\u98A8\u96AA\u7B49\u7D1A", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "low", children: "\u4F4E\u98A8\u96AA" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "medium", children: "\u4E2D\u7B49" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "high", children: "\u9AD8\u98A8\u96AA" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6295\u8CC7\u91D1\u984D", type: "number", value: formData.investment_amount, onChange: (e) => handleInputChange('investment_amount', Number(e.target.value)), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6700\u4F4E\u6295\u8CC7\u91D1\u984D", type: "number", value: formData.min_investment, onChange: (e) => handleInputChange('min_investment', Number(e.target.value)) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6700\u9AD8\u6295\u8CC7\u91D1\u984D", type: "number", value: formData.max_investment, onChange: (e) => handleInputChange('max_investment', Number(e.target.value)) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u9810\u671F\u5831\u916C\u7387 (%)", type: "number", value: formData.expected_return, onChange: (e) => handleInputChange('expected_return', Number(e.target.value)) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6295\u8CC7\u671F\u9593 (\u6708)", type: "number", value: formData.investment_period, onChange: (e) => handleInputChange('investment_period', Number(e.target.value)) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5730\u9EDE", value: formData.location, onChange: (e) => handleInputChange('location', e.target.value) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.status, onChange: (e) => handleInputChange('status', e.target.value), label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "preview", children: "\u9810\u89BD" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "active", children: "\u555F\u7528" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "hidden", children: "\u96B1\u85CF" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "closed", children: "\u5DF2\u7D50\u675F" })] })] }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", children: editingOpportunity ? '更新' : '新增' })] })] }), (0, jsx_runtime_1.jsx)(material_1.Fab, { color: "primary", "aria-label": "\u65B0\u589E\u6295\u8CC7\u6A19\u7684", sx: { position: 'fixed', bottom: 16, right: 16 }, onClick: handleAddNew, children: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}) })] }));
};
exports.default = InvestmentDashboardManagement;
