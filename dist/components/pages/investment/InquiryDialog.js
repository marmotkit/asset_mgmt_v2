"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const investmentOpportunity_service_1 = require("../../../services/investmentOpportunity.service");
const format_1 = require("../../../utils/format");
const notistack_1 = require("notistack");
const InquiryDialog = ({ open, opportunity, onClose, onSubmit }) => {
    const [formData, setFormData] = (0, react_1.useState)({
        investment_id: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        investment_amount: undefined,
        message: '',
    });
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [errors, setErrors] = (0, react_1.useState)({});
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    // 當對話框開啟時，初始化表單資料
    react_1.default.useEffect(() => {
        if (open && opportunity) {
            setFormData({
                investment_id: opportunity.id,
                name: '',
                email: '',
                phone: '',
                company: '',
                investment_amount: opportunity.min_investment || undefined,
                message: '',
            });
            setErrors({});
        }
    }, [open, opportunity]);
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = '請輸入姓名';
        }
        if (!formData.email.trim()) {
            newErrors.email = '請輸入電子郵件';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '請輸入有效的電子郵件格式';
        }
        if (formData.phone && !/^[\d\-\+\(\)\s]+$/.test(formData.phone)) {
            newErrors.phone = '請輸入有效的電話號碼';
        }
        if (formData.investment_amount && formData.investment_amount < ((opportunity === null || opportunity === void 0 ? void 0 : opportunity.min_investment) || 0)) {
            newErrors.investment_amount = `投資金額不能低於 ${(0, format_1.formatCurrency)((opportunity === null || opportunity === void 0 ? void 0 : opportunity.min_investment) || 0)}`;
        }
        if (formData.investment_amount && formData.investment_amount > ((opportunity === null || opportunity === void 0 ? void 0 : opportunity.investment_amount) || 0)) {
            newErrors.investment_amount = `投資金額不能超過 ${(0, format_1.formatCurrency)((opportunity === null || opportunity === void 0 ? void 0 : opportunity.investment_amount) || 0)}`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            setLoading(true);
            await investmentOpportunity_service_1.investmentInquiryService.createInquiry(formData);
            enqueueSnackbar('洽詢已成功送出，我們會盡快與您聯繫！', { variant: 'success' });
            onSubmit();
        }
        catch (error) {
            console.error('送出洽詢失敗:', error);
            enqueueSnackbar('送出洽詢失敗，請稍後再試', { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // 清除該欄位的錯誤
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };
    if (!opportunity)
        return null;
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onClose, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u6295\u8CC7\u6D3D\u8A62" }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: opportunity.featured ? '精選標的' : '一般標的', color: opportunity.featured ? 'primary' : 'default', size: "small" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: opportunity.title }), opportunity.subtitle && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: opportunity.subtitle })), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u6295\u8CC7\u91D1\u984D:" }), " ", (0, format_1.formatCurrency)(opportunity.investment_amount)] }), opportunity.min_investment && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u6700\u4F4E\u6295\u8CC7:" }), " ", (0, format_1.formatCurrency)(opportunity.min_investment)] })), opportunity.expected_return && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u9810\u671F\u5831\u916C:" }), " ", opportunity.expected_return, "%"] }))] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u59D3\u540D *", value: formData.name, onChange: (e) => handleInputChange('name', e.target.value), error: !!errors.name, helperText: errors.name, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96FB\u5B50\u90F5\u4EF6 *", type: "email", value: formData.email, onChange: (e) => handleInputChange('email', e.target.value), error: !!errors.email, helperText: errors.email, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96FB\u8A71\u865F\u78BC", value: formData.phone, onChange: (e) => handleInputChange('phone', e.target.value), error: !!errors.phone, helperText: errors.phone, placeholder: "\u4F8B: 0912-345-678" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u516C\u53F8\u540D\u7A31", value: formData.company, onChange: (e) => handleInputChange('company', e.target.value) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6295\u8CC7\u91D1\u984D", type: "number", value: formData.investment_amount || '', onChange: (e) => handleInputChange('investment_amount', e.target.value ? Number(e.target.value) : undefined), error: !!errors.investment_amount, helperText: errors.investment_amount || `建議投資金額: ${(0, format_1.formatCurrency)(opportunity.min_investment || opportunity.investment_amount)}`, InputProps: {
                                        startAdornment: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", sx: { mr: 1 }, children: "NT$" }),
                                    } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6D3D\u8A62\u5167\u5BB9", multiline: true, rows: 4, value: formData.message, onChange: (e) => handleInputChange('message', e.target.value), placeholder: "\u8ACB\u63CF\u8FF0\u60A8\u7684\u6295\u8CC7\u9700\u6C42\u3001\u554F\u984C\u6216\u7279\u6B8A\u8981\u6C42..." }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "info.main", children: (0, jsx_runtime_1.jsx)("strong", { children: "\u6CE8\u610F\u4E8B\u9805:" }) }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", sx: { mt: 1 }, children: "\u2022 \u6211\u5011\u6703\u5728\u6536\u5230\u6D3D\u8A62\u5F8C 1-2 \u500B\u5DE5\u4F5C\u5929\u5167\u8207\u60A8\u806F\u7E6B" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u2022 \u8ACB\u78BA\u4FDD\u63D0\u4F9B\u7684\u806F\u7D61\u8CC7\u8A0A\u6B63\u78BA\uFF0C\u4EE5\u4FBF\u6211\u5011\u80FD\u53CA\u6642\u56DE\u8986" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "textSecondary", children: "\u2022 \u6295\u8CC7\u91D1\u984D\u50C5\u4F9B\u53C3\u8003\uFF0C\u5BE6\u969B\u6295\u8CC7\u689D\u4EF6\u5C07\u7531\u96D9\u65B9\u5354\u5546\u6C7A\u5B9A" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { sx: { p: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onClose, disabled: loading, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", onClick: handleSubmit, disabled: loading, startIcon: loading ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : null, children: loading ? '送出中...' : '送出洽詢' })] })] }));
};
exports.default = InquiryDialog;
