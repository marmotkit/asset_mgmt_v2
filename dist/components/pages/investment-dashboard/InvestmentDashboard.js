"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../../../contexts/AuthContext");
const investmentOpportunity_service_1 = require("../../../services/investmentOpportunity.service");
// 投資類型選項
const investmentTypeOptions = [
    { value: 'lease', label: '租賃投資', color: 'primary' },
    { value: 'equity', label: '股權投資', color: 'success' },
    { value: 'debt', label: '債權投資', color: 'warning' },
    { value: 'real_estate', label: '房地產', color: 'info' },
    { value: 'other', label: '其他', color: 'default' }
];
// 風險等級選項
const riskLevelOptions = [
    { value: 'low', label: '低風險', color: 'success' },
    { value: 'medium', label: '中風險', color: 'warning' },
    { value: 'high', label: '高風險', color: 'error' }
];
const InvestmentDashboard = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [opportunities, setOpportunities] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [page, setPage] = (0, react_1.useState)(1);
    const [pageSize] = (0, react_1.useState)(12);
    // 篩選狀態
    const [filter, setFilter] = (0, react_1.useState)({
        status: 'active',
        search: ''
    });
    const [showFilters, setShowFilters] = (0, react_1.useState)(false);
    // 載入投資標的
    const loadOpportunities = async () => {
        setLoading(true);
        try {
            const result = await investmentOpportunity_service_1.investmentOpportunityService.getInvestmentOpportunities(filter, 'created_at', 'desc', page, pageSize);
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
    // 處理篩選變更
    const handleFilterChange = (key, value) => {
        setFilter(prev => ({ ...prev, [key]: value }));
        setPage(1); // 重置頁碼
    };
    // 處理搜尋
    const handleSearch = (event) => {
        handleFilterChange('search', event.target.value);
    };
    // 處理金額範圍變更
    const handleAmountRangeChange = (event, newValue) => {
        const [min, max] = newValue;
        handleFilterChange('min_amount', min);
        handleFilterChange('max_amount', max);
    };
    // 格式化金額
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };
    // 取得投資類型標籤
    const getInvestmentTypeLabel = (type) => {
        var _a;
        return ((_a = investmentTypeOptions.find(option => option.value === type)) === null || _a === void 0 ? void 0 : _a.label) || type;
    };
    // 取得風險等級標籤
    const getRiskLevelLabel = (level) => {
        var _a;
        return ((_a = riskLevelOptions.find(option => option.value === level)) === null || _a === void 0 ? void 0 : _a.label) || level;
    };
    // 取得風險等級顏色
    const getRiskLevelColor = (level) => {
        var _a;
        return ((_a = riskLevelOptions.find(option => option.value === level)) === null || _a === void 0 ? void 0 : _a.color) || 'default';
    };
    // 處理標的點擊
    const handleOpportunityClick = (id) => {
        navigate(`/investment-dashboard/${id}`);
    };
    // 處理分享
    const handleShare = (opportunity) => {
        const url = `${window.location.origin}/investment-dashboard/${opportunity.id}`;
        if (navigator.share) {
            navigator.share({
                title: opportunity.title,
                text: opportunity.short_description || opportunity.description,
                url: url
            });
        }
        else {
            navigator.clipboard.writeText(url);
            // 這裡可以顯示一個提示訊息
        }
    };
    // 處理進入管理頁面
    const handleManageClick = () => {
        navigate('/investment-dashboard-management');
    };
    const { user } = (0, AuthContext_1.useAuth)();
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4
        }, children: (0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "xl", children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { textAlign: 'center', mb: 6, position: 'relative' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h2", component: "h1", sx: {
                                color: 'white',
                                fontWeight: 'bold',
                                mb: 2,
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                            }, children: "\u6295\u8CC7\u770B\u677F" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: {
                                color: 'rgba(255,255,255,0.9)',
                                maxWidth: 600,
                                mx: 'auto'
                            }, children: "\u63A2\u7D22\u512A\u8CEA\u6295\u8CC7\u6A5F\u6703\uFF0C\u5BE6\u73FE\u8CA1\u5BCC\u589E\u503C" }), (user === null || user === void 0 ? void 0 : user.role) === 'admin' && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { position: 'absolute', top: 0, right: 0 }, children: (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u7BA1\u7406\u6295\u8CC7\u6A19\u7684", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: handleManageClick, sx: {
                                        color: 'white',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.3)',
                                        }
                                    }, children: (0, jsx_runtime_1.jsx)(icons_material_1.Settings, {}) }) }) }))] }), (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3, mb: 4, borderRadius: 3, boxShadow: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, placeholder: "\u641C\u5C0B\u6295\u8CC7\u6A19\u7684...", value: filter.search || '', onChange: handleSearch, InputProps: {
                                            startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Search, {}) }))
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6295\u8CC7\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: filter.investment_type || '', onChange: (e) => handleFilterChange('investment_type', e.target.value), label: "\u6295\u8CC7\u985E\u578B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), investmentTypeOptions.map(option => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: option.value, children: option.label }, option.value)))] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.FilterList, {}), onClick: () => setShowFilters(!showFilters), fullWidth: true, children: showFilters ? '隱藏篩選' : '更多篩選' }) })] }), showFilters && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u98A8\u96AA\u7B49\u7D1A" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: filter.risk_level || '', onChange: (e) => handleFilterChange('risk_level', e.target.value), label: "\u98A8\u96AA\u7B49\u7D1A", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), riskLevelOptions.map(option => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: option.value, children: option.label }, option.value)))] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, md: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { gutterBottom: true, children: "\u6295\u8CC7\u91D1\u984D\u7BC4\u570D" }), (0, jsx_runtime_1.jsx)(material_1.Slider, { value: [filter.min_amount || 0, filter.max_amount || 10000000], onChange: handleAmountRangeChange, valueLabelDisplay: "auto", min: 0, max: 10000000, step: 100000, valueLabelFormat: (value) => formatAmount(value) })] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u5730\u5340" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: filter.location || '', onChange: (e) => handleFilterChange('location', e.target.value), label: "\u5730\u5340", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u53F0\u5317", children: "\u53F0\u5317" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u65B0\u5317", children: "\u65B0\u5317" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u6843\u5712", children: "\u6843\u5712" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u53F0\u4E2D", children: "\u53F0\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u53F0\u5357", children: "\u53F0\u5357" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u9AD8\u96C4", children: "\u9AD8\u96C4" })] })] }) })] }) }))] }), loading && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', py: 8 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 60 }) })), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 4 }, children: error })), !loading && !error && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 3, children: opportunities.map((opportunity) => {
                                var _a, _b;
                                return ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, md: 4, lg: 3, children: (0, jsx_runtime_1.jsxs)(material_1.Card, { sx: {
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 6
                                            },
                                            cursor: 'pointer'
                                        }, onClick: () => handleOpportunityClick(opportunity.id), children: [(0, jsx_runtime_1.jsx)(material_1.CardMedia, { component: "img", height: "200", image: ((_b = (_a = opportunity.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.image_url) || '/default-investment.jpg', alt: opportunity.title, sx: { objectFit: 'cover' } }), (0, jsx_runtime_1.jsxs)(material_1.CardContent, { sx: { flexGrow: 1 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Chip, { label: getInvestmentTypeLabel(opportunity.investment_type), size: "small", color: "primary" }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getRiskLevelLabel(opportunity.risk_level), size: "small", color: getRiskLevelColor(opportunity.risk_level) })] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", component: "h3", gutterBottom: true, sx: { fontWeight: 'bold' }, children: opportunity.title }), opportunity.subtitle && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: opportunity.subtitle })), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: [opportunity.short_description || opportunity.description.substring(0, 100), "..."] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', mb: 1 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.LocationOn, { sx: { fontSize: 16, mr: 0.5, color: 'text.secondary' } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: opportunity.location || '未指定' })] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "primary", sx: { fontWeight: 'bold' }, children: formatAmount(opportunity.investment_amount) }), opportunity.expected_return && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "success.main", children: ["\u9810\u671F\u5831\u916C\u7387: ", opportunity.expected_return, "%"] }))] }), (0, jsx_runtime_1.jsxs)(material_1.CardActions, { sx: { justifyContent: 'space-between', px: 2, pb: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Visibility, { sx: { fontSize: 16, mr: 0.5, color: 'text.secondary' } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: opportunity.view_count })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u5206\u4EAB", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: (e) => {
                                                                    e.stopPropagation();
                                                                    handleShare(opportunity);
                                                                }, children: (0, jsx_runtime_1.jsx)(icons_material_1.Share, {}) }) }) })] })] }) }, opportunity.id));
                            }) }), total > pageSize && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', mt: 4 }, children: (0, jsx_runtime_1.jsx)(material_1.Pagination, { count: Math.ceil(total / pageSize), page: page, onChange: (_, value) => setPage(value), color: "primary", size: "large" }) })), opportunities.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { textAlign: 'center', py: 8 }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "text.secondary", children: "\u76EE\u524D\u6C92\u6709\u7B26\u5408\u689D\u4EF6\u7684\u6295\u8CC7\u6A19\u7684" }) }))] }))] }) }));
};
exports.default = InvestmentDashboard;
