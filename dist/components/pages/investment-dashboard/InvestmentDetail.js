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
const investmentOpportunity_service_1 = require("../../../services/investmentOpportunity.service");
const InquiryForm_1 = __importDefault(require("./InquiryForm"));
const InvestmentDetail = () => {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [opportunity, setOpportunity] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [inquiryDialogOpen, setInquiryDialogOpen] = (0, react_1.useState)(false);
    // 載入投資標的詳細資訊
    const loadOpportunity = async () => {
        if (!id)
            return;
        setLoading(true);
        try {
            const data = await investmentOpportunity_service_1.investmentOpportunityService.getInvestmentOpportunity(id);
            setOpportunity(data);
            setError(null);
            // 增加瀏覽次數
            await investmentOpportunity_service_1.investmentOpportunityService.incrementViewCount(id);
        }
        catch (err) {
            console.error('載入投資標的失敗:', err);
            setError('載入投資標的失敗，請稍後再試');
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadOpportunity();
    }, [id]);
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
        const options = [
            { value: 'lease', label: '租賃投資' },
            { value: 'equity', label: '股權投資' },
            { value: 'debt', label: '債權投資' },
            { value: 'real_estate', label: '房地產' },
            { value: 'other', label: '其他' }
        ];
        return ((_a = options.find(option => option.value === type)) === null || _a === void 0 ? void 0 : _a.label) || type;
    };
    // 取得風險等級標籤和顏色
    const getRiskLevelInfo = (level) => {
        const options = [
            { value: 'low', label: '低風險', color: 'success' },
            { value: 'medium', label: '中風險', color: 'warning' },
            { value: 'high', label: '高風險', color: 'error' }
        ];
        return options.find(option => option.value === level) || { label: level, color: 'default' };
    };
    // 處理分享
    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: (opportunity === null || opportunity === void 0 ? void 0 : opportunity.title) || '投資標的',
                text: (opportunity === null || opportunity === void 0 ? void 0 : opportunity.short_description) || (opportunity === null || opportunity === void 0 ? void 0 : opportunity.description) || '',
                url: url
            });
        }
        else {
            navigator.clipboard.writeText(url);
            // 這裡可以顯示一個提示訊息
        }
    };
    // 處理洽詢
    const handleInquiry = () => {
        setInquiryDialogOpen(true);
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 60 }) }));
    }
    if (error || !opportunity) {
        return ((0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "lg", sx: { py: 4 }, children: [(0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 4 }, children: error || '找不到投資標的' }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.ArrowBack, {}), onClick: () => navigate('/investment-dashboard'), children: "\u8FD4\u56DE\u6295\u8CC7\u770B\u677F" })] }));
    }
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { minHeight: '100vh', bgcolor: 'grey.50' }, children: (0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "lg", sx: { py: 4 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Breadcrumbs, { separator: (0, jsx_runtime_1.jsx)(icons_material_1.NavigateNext, { fontSize: "small" }), sx: { mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Link, { color: "inherit", href: "#", onClick: (e) => {
                                e.preventDefault();
                                navigate('/investment-dashboard');
                            }, sx: { cursor: 'pointer' }, children: "\u6295\u8CC7\u770B\u677F" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { color: "text.primary", children: opportunity.title })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 4, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, lg: 8, children: [(0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3, mb: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", component: "h1", gutterBottom: true, sx: { fontWeight: 'bold' }, children: opportunity.title }), opportunity.subtitle && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "text.secondary", gutterBottom: true, children: opportunity.subtitle }))] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Chip, { label: getInvestmentTypeLabel(opportunity.investment_type), color: "primary" }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getRiskLevelInfo(opportunity.risk_level).label, color: getRiskLevelInfo(opportunity.risk_level).color })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 2, mb: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.LocationOn, { sx: { mr: 1, color: 'text.secondary' } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: opportunity.location || '未指定地區' })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Business, { sx: { mr: 1, color: 'text.secondary' } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: opportunity.industry || '未指定產業' })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Visibility, { sx: { mr: 1, color: 'text.secondary' } }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: [opportunity.view_count, " \u6B21\u700F\u89BD"] })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 2, flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", size: "large", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Phone, {}), onClick: handleInquiry, sx: { minWidth: 150 }, children: "\u7ACB\u5373\u6D3D\u8A62" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Share, {}), onClick: handleShare, children: "\u5206\u4EAB" })] })] }), opportunity.images && opportunity.images.length > 0 && ((0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { mb: 3, overflow: 'hidden' }, children: (0, jsx_runtime_1.jsx)(material_1.CardMedia, { component: "img", height: "400", image: opportunity.images[0].image_url, alt: opportunity.title, sx: { objectFit: 'cover' } }) })), (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3, mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold' }, children: "\u6A19\u7684\u4ECB\u7D39" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { lineHeight: 1.8 }, children: opportunity.description })] }), (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold' }, children: "\u6295\u8CC7\u8A73\u60C5" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } }), (0, jsx_runtime_1.jsxs)(material_1.List, { children: [(0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.TrendingUp, { color: "primary" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u6295\u8CC7\u91D1\u984D", secondary: formatAmount(opportunity.investment_amount) })] }), opportunity.min_investment && ((0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.TrendingUp, { color: "primary" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u6700\u4F4E\u6295\u8CC7\u984D", secondary: formatAmount(opportunity.min_investment) })] })), opportunity.expected_return && ((0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.TrendingUp, { color: "success" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u9810\u671F\u5831\u916C\u7387", secondary: `${opportunity.expected_return}%` })] })), opportunity.investment_period && ((0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: (0, jsx_runtime_1.jsx)(icons_material_1.Schedule, { color: "info" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u6295\u8CC7\u671F\u9593", secondary: `${opportunity.investment_period} 個月` })] }))] })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, lg: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 3, position: 'sticky', top: 20 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold' }, children: "\u6295\u8CC7\u6458\u8981" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", color: "primary", sx: { fontWeight: 'bold' }, children: formatAmount(opportunity.investment_amount) }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u7E3D\u6295\u8CC7\u91D1\u984D" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h5", color: "success.main", sx: { fontWeight: 'bold' }, children: [opportunity.expected_return || 'N/A', "%"] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u9810\u671F\u5831\u916C\u7387" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", sx: { fontWeight: 'bold' }, children: [opportunity.investment_period || 'N/A', " \u500B\u6708"] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u6295\u8CC7\u671F\u9593" })] }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", size: "large", fullWidth: true, startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Phone, {}), onClick: handleInquiry, sx: { mb: 2 }, children: "\u7ACB\u5373\u6D3D\u8A62\u6295\u8CC7" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", fullWidth: true, startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Email, {}), onClick: handleInquiry, children: "\u767C\u9001\u90F5\u4EF6\u6D3D\u8A62" })] }) }), (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold' }, children: "\u76F8\u95DC\u8CC7\u8A0A" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u6295\u8CC7\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold' }, children: getInvestmentTypeLabel(opportunity.investment_type) })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u98A8\u96AA\u7B49\u7D1A" }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getRiskLevelInfo(opportunity.risk_level).label, color: getRiskLevelInfo(opportunity.risk_level).color, size: "small" })] }), opportunity.location && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u5730\u5340" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: opportunity.location })] })), opportunity.industry && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u7522\u696D" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: opportunity.industry })] })), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u700F\u89BD\u6B21\u6578" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", children: [opportunity.view_count, " \u6B21"] })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u6D3D\u8A62\u6B21\u6578" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", children: [opportunity.inquiry_count, " \u6B21"] })] })] }) })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: inquiryDialogOpen, onClose: () => setInquiryDialogOpen(false), maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u6295\u8CC7\u6D3D\u8A62" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(InquiryForm_1.default, { opportunity: opportunity, onSuccess: () => {
                                    setInquiryDialogOpen(false);
                                    // 重新載入標的資訊以更新洽詢次數
                                    loadOpportunity();
                                } }) })] })] }) }));
};
exports.default = InvestmentDetail;
