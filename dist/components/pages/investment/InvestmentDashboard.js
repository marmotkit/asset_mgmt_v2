"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const investmentOpportunity_service_1 = require("../../../services/investmentOpportunity.service");
const format_1 = require("../../../utils/format");
const InquiryDialog_1 = __importDefault(require("./InquiryDialog"));
const InvestmentDashboard = () => {
    const [opportunities, setOpportunities] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [page, setPage] = (0, react_1.useState)(1);
    const [limit] = (0, react_1.useState)(12);
    // 篩選狀態
    const [filter, setFilter] = (0, react_1.useState)({
        status: 'active',
        featured: true
    });
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [selectedType, setSelectedType] = (0, react_1.useState)('');
    const [selectedRisk, setSelectedRisk] = (0, react_1.useState)('');
    // 洽詢對話框
    const [inquiryDialogOpen, setInquiryDialogOpen] = (0, react_1.useState)(false);
    const [selectedOpportunity, setSelectedOpportunity] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        loadOpportunities();
    }, [page, filter]);
    const loadOpportunities = async () => {
        try {
            setLoading(true);
            const result = await investmentOpportunity_service_1.investmentOpportunityService.getInvestmentOpportunities(filter, 'sort_order', 'desc', page, limit);
            setOpportunities(result.opportunities);
            setTotal(result.total);
        }
        catch (err) {
            setError('載入投資標的失敗');
            console.error('載入投資標的失敗:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSearch = () => {
        const newFilter = {
            ...filter,
            search: searchTerm || undefined,
            investment_type: selectedType || undefined,
            risk_level: selectedRisk || undefined,
        };
        setFilter(newFilter);
        setPage(1);
    };
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedType('');
        setSelectedRisk('');
        setFilter({ status: 'active', featured: true });
        setPage(1);
    };
    const handleInquiryClick = (opportunity) => {
        setSelectedOpportunity(opportunity);
        setInquiryDialogOpen(true);
    };
    const handleInquirySubmit = async () => {
        await loadOpportunities(); // 重新載入以更新洽詢數量
        setInquiryDialogOpen(false);
        setSelectedOpportunity(null);
    };
    const getRiskLevelColor = (riskLevel) => {
        switch (riskLevel) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'error';
            default: return 'default';
        }
    };
    const getRiskLevelLabel = (riskLevel) => {
        switch (riskLevel) {
            case 'low': return '低風險';
            case 'medium': return '中風險';
            case 'high': return '高風險';
            default: return riskLevel;
        }
    };
    const getInvestmentTypeLabel = (type) => {
        switch (type) {
            case 'lease': return '租賃';
            case 'equity': return '股權';
            case 'debt': return '債權';
            case 'real_estate': return '不動產';
            case 'other': return '其他';
            default: return type;
        }
    };
    if (loading && opportunities.length === 0) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "lg", sx: { py: 4 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 4, textAlign: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h3", component: "h1", gutterBottom: true, children: "\u6295\u8CC7\u770B\u677F" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "textSecondary", children: "\u63A2\u7D22\u512A\u8CEA\u6295\u8CC7\u6A5F\u6703\uFF0C\u5BE6\u73FE\u8CA1\u5BCC\u589E\u503C" })] }), (0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { p: 3, mb: 4 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, placeholder: "\u641C\u5C0B\u6295\u8CC7\u6A19\u7684...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), InputProps: {
                                    startAdornment: (0, jsx_runtime_1.jsx)(icons_material_1.Search, { sx: { mr: 1, color: 'text.secondary' } }),
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 2, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6295\u8CC7\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: selectedType, label: "\u6295\u8CC7\u985E\u578B", onChange: (e) => setSelectedType(e.target.value), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "lease", children: "\u79DF\u8CC3" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "equity", children: "\u80A1\u6B0A" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "debt", children: "\u50B5\u6B0A" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "real_estate", children: "\u4E0D\u52D5\u7522" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "other", children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 2, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u98A8\u96AA\u7B49\u7D1A" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: selectedRisk, label: "\u98A8\u96AA\u7B49\u7D1A", onChange: (e) => setSelectedRisk(e.target.value), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "low", children: "\u4F4E\u98A8\u96AA" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "medium", children: "\u4E2D\u98A8\u96AA" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "high", children: "\u9AD8\u98A8\u96AA" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Search, {}), onClick: handleSearch, fullWidth: true, children: "\u641C\u5C0B" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.FilterList, {}), onClick: handleClearFilters, children: "\u6E05\u9664" })] }) })] }) }), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 3 }, children: error })), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 3, children: opportunities.map((opportunity) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, md: 4, children: (0, jsx_runtime_1.jsxs)(material_1.Card, { sx: {
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4,
                            }
                        }, children: [(0, jsx_runtime_1.jsxs)(material_1.CardContent, { sx: { flexGrow: 1 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", component: "h3", sx: { fontWeight: 'bold' }, children: opportunity.title }), opportunity.featured && ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: "\u7CBE\u9078", color: "primary", size: "small", icon: (0, jsx_runtime_1.jsx)(icons_material_1.TrendingUp, {}) }))] }), opportunity.subtitle && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", sx: { mb: 2 }, children: opportunity.subtitle })), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", color: "primary", sx: { fontWeight: 'bold' }, children: (0, format_1.formatCurrency)(opportunity.investment_amount) }), opportunity.min_investment && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "textSecondary", children: ["\u6700\u4F4E\u6295\u8CC7: ", (0, format_1.formatCurrency)(opportunity.min_investment)] }))] }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", spacing: 1, sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Chip, { label: getInvestmentTypeLabel(opportunity.investment_type), size: "small", variant: "outlined" }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getRiskLevelLabel(opportunity.risk_level), color: getRiskLevelColor(opportunity.risk_level), size: "small" })] }), (opportunity.location || opportunity.industry) && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [opportunity.location && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', mb: 0.5 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.LocationOn, { sx: { fontSize: 16, mr: 0.5, color: 'text.secondary' } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: opportunity.location })] })), opportunity.industry && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Business, { sx: { fontSize: 16, mr: 0.5, color: 'text.secondary' } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: opportunity.industry })] }))] })), opportunity.expected_return && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mb: 2 }, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "success.main", sx: { fontWeight: 'bold' }, children: ["\u9810\u671F\u5E74\u5316\u5831\u916C: ", opportunity.expected_return, "%"] }) })), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "textSecondary", children: ["\u700F\u89BD: ", opportunity.view_count] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "textSecondary", children: ["\u6D3D\u8A62: ", opportunity.inquiry_count] })] }), opportunity.short_description && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", sx: { mb: 2 }, children: opportunity.short_description }))] }), (0, jsx_runtime_1.jsx)(material_1.Divider, {}), (0, jsx_runtime_1.jsx)(material_1.CardActions, { sx: { p: 2 }, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", fullWidth: true, onClick: () => handleInquiryClick(opportunity), children: "\u7ACB\u5373\u6D3D\u8A62" }) })] }) }, opportunity.id))) }), total > limit && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', mt: 4 }, children: (0, jsx_runtime_1.jsx)(material_1.Pagination, { count: Math.ceil(total / limit), page: page, onChange: (_, value) => setPage(value), color: "primary" }) })), (0, jsx_runtime_1.jsx)(InquiryDialog_1.default, { open: inquiryDialogOpen, opportunity: selectedOpportunity, onClose: () => {
                    setInquiryDialogOpen(false);
                    setSelectedOpportunity(null);
                }, onSubmit: handleInquirySubmit })] }));
};
exports.default = InvestmentDashboard;
