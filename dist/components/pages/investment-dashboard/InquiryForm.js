"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const investmentOpportunity_service_1 = require("../../../services/investmentOpportunity.service");
const InquiryForm = ({ opportunity, onSuccess }) => {
    const [formData, setFormData] = (0, react_1.useState)({
        investment_id: opportunity.id,
        name: '',
        email: '',
        phone: '',
        company: '',
        investment_amount: undefined,
        message: ''
    });
    const [errors, setErrors] = (0, react_1.useState)({});
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [success, setSuccess] = (0, react_1.useState)(false);
    // 格式化金額
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };
    // 處理表單變更
    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // 清除錯誤
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    // 表單驗證
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
        if (formData.investment_amount && formData.investment_amount <= 0) {
            newErrors.investment_amount = '投資金額必須大於 0';
        }
        if (formData.investment_amount && opportunity.min_investment &&
            formData.investment_amount < opportunity.min_investment) {
            newErrors.investment_amount = `投資金額不能低於 ${formatAmount(opportunity.min_investment)}`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // 處理表單提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        try {
            await investmentOpportunity_service_1.investmentInquiryService.createInquiry(formData);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        }
        catch (error) {
            console.error('提交洽詢失敗:', error);
            setErrors({ submit: '提交洽詢失敗，請稍後再試' });
        }
        finally {
            setLoading(false);
        }
    };
    if (success) {
        return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { textAlign: 'center', py: 4 }, children: [(0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "success", sx: { mb: 2 }, children: "\u6D3D\u8A62\u5DF2\u6210\u529F\u63D0\u4EA4\uFF01\u6211\u5011\u6703\u76E1\u5FEB\u8207\u60A8\u806F\u7E6B\u3002" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u6B63\u5728\u8FD4\u56DE..." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { py: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 3, bgcolor: 'grey.50' }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold' }, children: "\u6295\u8CC7\u6A19\u7684\u6458\u8981" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u6A19\u7684\u540D\u7A31" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold' }, children: opportunity.title })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u6295\u8CC7\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold', color: 'primary.main' }, children: formatAmount(opportunity.investment_amount) })] }), opportunity.expected_return && ((0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u9810\u671F\u5831\u916C\u7387" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold', color: 'success.main' }, children: [opportunity.expected_return, "%"] })] })), opportunity.investment_period && ((0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 6, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u6295\u8CC7\u671F\u9593" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", sx: { fontWeight: 'bold' }, children: [opportunity.investment_period, " \u500B\u6708"] })] }))] })] }) }), (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u59D3\u540D *", value: formData.name, onChange: (e) => handleFormChange('name', e.target.value), error: !!errors.name, helperText: errors.name, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96FB\u5B50\u90F5\u4EF6 *", type: "email", value: formData.email, onChange: (e) => handleFormChange('email', e.target.value), error: !!errors.email, helperText: errors.email, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u806F\u7D61\u96FB\u8A71", value: formData.phone || '', onChange: (e) => handleFormChange('phone', e.target.value), placeholder: "\u8ACB\u8F38\u5165\u806F\u7D61\u96FB\u8A71" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u516C\u53F8\u540D\u7A31", value: formData.company || '', onChange: (e) => handleFormChange('company', e.target.value), placeholder: "\u8ACB\u8F38\u5165\u516C\u53F8\u540D\u7A31" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6295\u8CC7\u91D1\u984D", type: "number", value: formData.investment_amount || '', onChange: (e) => handleFormChange('investment_amount', e.target.value ? parseFloat(e.target.value) : undefined), error: !!errors.investment_amount, helperText: errors.investment_amount ||
                                    (opportunity.min_investment ?
                                        `最低投資額: ${formatAmount(opportunity.min_investment)}` : ''), InputProps: {
                                    startAdornment: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: "NT$" })
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6D3D\u8A62\u5167\u5BB9", multiline: true, rows: 4, value: formData.message || '', onChange: (e) => handleFormChange('message', e.target.value), placeholder: "\u8ACB\u63CF\u8FF0\u60A8\u7684\u6295\u8CC7\u610F\u5411\u6216\u4EFB\u4F55\u554F\u984C..." }) }), errors.submit && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", children: errors.submit }) })), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', gap: 2, justifyContent: 'flex-end' }, children: (0, jsx_runtime_1.jsx)(material_1.Button, { type: "submit", variant: "contained", size: "large", disabled: loading, startIcon: loading ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : null, children: loading ? '提交中...' : '提交洽詢' }) }) })] }) })] }));
};
exports.default = InquiryForm;
