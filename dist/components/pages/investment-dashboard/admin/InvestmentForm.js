"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const ImageUpload_1 = __importDefault(require("./ImageUpload"));
const InvestmentForm = ({ opportunity, onSubmit }) => {
    const [formData, setFormData] = (0, react_1.useState)({
        title: '',
        subtitle: '',
        description: '',
        short_description: '',
        investment_amount: 0,
        min_investment: undefined,
        max_investment: undefined,
        investment_type: 'lease',
        location: '',
        industry: '',
        risk_level: 'medium',
        expected_return: undefined,
        investment_period: undefined,
        status: 'preview',
        featured: false,
        sort_order: 0
    });
    const [images, setImages] = (0, react_1.useState)([]);
    const [errors, setErrors] = (0, react_1.useState)({});
    const [loading, setLoading] = (0, react_1.useState)(false);
    // 初始化表單資料
    (0, react_1.useEffect)(() => {
        if (opportunity) {
            setFormData({
                title: opportunity.title,
                subtitle: opportunity.subtitle || '',
                description: opportunity.description,
                short_description: opportunity.short_description || '',
                investment_amount: opportunity.investment_amount,
                min_investment: opportunity.min_investment,
                max_investment: opportunity.max_investment,
                investment_type: opportunity.investment_type,
                location: opportunity.location || '',
                industry: opportunity.industry || '',
                risk_level: opportunity.risk_level,
                expected_return: opportunity.expected_return,
                investment_period: opportunity.investment_period,
                status: opportunity.status,
                featured: opportunity.featured,
                sort_order: opportunity.sort_order
            });
            // 初始化圖片資料
            if (opportunity.images) {
                setImages(opportunity.images.map(img => ({
                    image_url: img.image_url,
                    image_type: img.image_type,
                    sort_order: img.sort_order
                })));
            }
        }
    }, [opportunity]);
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
    // 處理圖片變更
    const handleImagesChange = (newImages) => {
        setImages(newImages);
    };
    // 表單驗證
    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = '請輸入標的名稱';
        }
        if (!formData.description.trim()) {
            newErrors.description = '請輸入標的描述';
        }
        if (formData.investment_amount <= 0) {
            newErrors.investment_amount = '投資金額必須大於 0';
        }
        if (formData.min_investment && formData.min_investment <= 0) {
            newErrors.min_investment = '最低投資額必須大於 0';
        }
        if (formData.max_investment && formData.max_investment <= 0) {
            newErrors.max_investment = '最高投資額必須大於 0';
        }
        if (formData.min_investment && formData.max_investment &&
            formData.min_investment > formData.max_investment) {
            newErrors.max_investment = '最高投資額不能低於最低投資額';
        }
        if (formData.expected_return && (formData.expected_return < 0 || formData.expected_return > 100)) {
            newErrors.expected_return = '預期報酬率必須在 0-100% 之間';
        }
        if (formData.investment_period && formData.investment_period <= 0) {
            newErrors.investment_period = '投資期間必須大於 0';
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
            await onSubmit(formData, images);
        }
        catch (error) {
            console.error('提交失敗:', error);
            setErrors({ submit: '提交失敗，請稍後再試' });
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { py: 2 }, children: (0, jsx_runtime_1.jsx)("form", { onSubmit: handleSubmit, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold' }, children: "\u57FA\u672C\u8CC7\u8A0A" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } })] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 8, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6A19\u7684\u540D\u7A31 *", value: formData.title, onChange: (e) => handleFormChange('title', e.target.value), error: !!errors.title, helperText: errors.title, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u526F\u6A19\u984C", value: formData.subtitle, onChange: (e) => handleFormChange('subtitle', e.target.value), placeholder: "\u53EF\u9078\u7684\u526F\u6A19\u984C" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7C21\u77ED\u63CF\u8FF0", value: formData.short_description, onChange: (e) => handleFormChange('short_description', e.target.value), placeholder: "\u7C21\u77ED\u7684\u6A19\u7684\u63CF\u8FF0\uFF0C\u7528\u65BC\u5217\u8868\u986F\u793A", multiline: true, rows: 2 }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u8A73\u7D30\u63CF\u8FF0 *", value: formData.description, onChange: (e) => handleFormChange('description', e.target.value), error: !!errors.description, helperText: errors.description, multiline: true, rows: 6, required: true }) }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold', mt: 2 }, children: "\u6A19\u7684\u5716\u7247" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(ImageUpload_1.default, { images: images.map((img, index) => ({
                                    id: `temp-${index}`,
                                    investment_id: (opportunity === null || opportunity === void 0 ? void 0 : opportunity.id) || '',
                                    image_url: img.image_url,
                                    image_type: img.image_type,
                                    sort_order: img.sort_order,
                                    created_at: new Date().toISOString()
                                })), onImagesChange: handleImagesChange, maxImages: 10 })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold', mt: 2 }, children: "\u6295\u8CC7\u8CC7\u8A0A" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } })] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7E3D\u6295\u8CC7\u91D1\u984D *", type: "number", value: formData.investment_amount, onChange: (e) => handleFormChange('investment_amount', parseFloat(e.target.value) || 0), error: !!errors.investment_amount, helperText: errors.investment_amount, InputProps: {
                                startAdornment: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: "NT$" })
                            }, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6295\u8CC7\u985E\u578B *" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.investment_type, onChange: (e) => handleFormChange('investment_type', e.target.value), label: "\u6295\u8CC7\u985E\u578B *", required: true, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "lease", children: "\u79DF\u8CC3\u6295\u8CC7" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "equity", children: "\u80A1\u6B0A\u6295\u8CC7" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "debt", children: "\u50B5\u6B0A\u6295\u8CC7" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "real_estate", children: "\u623F\u5730\u7522" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "other", children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6700\u4F4E\u6295\u8CC7\u984D", type: "number", value: formData.min_investment || '', onChange: (e) => handleFormChange('min_investment', e.target.value ? parseFloat(e.target.value) : undefined), error: !!errors.min_investment, helperText: errors.min_investment, InputProps: {
                                startAdornment: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: "NT$" })
                            } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6700\u9AD8\u6295\u8CC7\u984D", type: "number", value: formData.max_investment || '', onChange: (e) => handleFormChange('max_investment', e.target.value ? parseFloat(e.target.value) : undefined), error: !!errors.max_investment, helperText: errors.max_investment, InputProps: {
                                startAdornment: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: "NT$" })
                            } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u9810\u671F\u5831\u916C\u7387 (%)", type: "number", value: formData.expected_return || '', onChange: (e) => handleFormChange('expected_return', e.target.value ? parseFloat(e.target.value) : undefined), error: !!errors.expected_return, helperText: errors.expected_return, inputProps: {
                                min: 0,
                                max: 100,
                                step: 0.1
                            } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6295\u8CC7\u671F\u9593 (\u6708)", type: "number", value: formData.investment_period || '', onChange: (e) => handleFormChange('investment_period', e.target.value ? parseInt(e.target.value) : undefined), error: !!errors.investment_period, helperText: errors.investment_period, inputProps: {
                                min: 1
                            } }) }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, sx: { fontWeight: 'bold', mt: 2 }, children: "\u5176\u4ED6\u8CC7\u8A0A" }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { mb: 2 } })] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5730\u5340", value: formData.location, onChange: (e) => handleFormChange('location', e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u53F0\u5317\u5E02\u3001\u53F0\u4E2D\u5E02" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7522\u696D", value: formData.industry, onChange: (e) => handleFormChange('industry', e.target.value), placeholder: "\u4F8B\u5982\uFF1A\u79D1\u6280\u3001\u623F\u5730\u7522\u3001\u88FD\u9020\u696D" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u98A8\u96AA\u7B49\u7D1A *" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.risk_level, onChange: (e) => handleFormChange('risk_level', e.target.value), label: "\u98A8\u96AA\u7B49\u7D1A *", required: true, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "low", children: "\u4F4E\u98A8\u96AA" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "medium", children: "\u4E2D\u98A8\u96AA" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "high", children: "\u9AD8\u98A8\u96AA" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B *" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.status, onChange: (e) => handleFormChange('status', e.target.value), label: "\u72C0\u614B *", required: true, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "preview", children: "\u9810\u544A" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "active", children: "\u4E0A\u5E02" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "hidden", children: "\u96B1\u85CF" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "closed", children: "\u95DC\u9589" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6392\u5E8F\u9806\u5E8F", type: "number", value: formData.sort_order, onChange: (e) => handleFormChange('sort_order', parseInt(e.target.value) || 0), inputProps: {
                                min: 0
                            }, helperText: "\u6578\u5B57\u8D8A\u5C0F\u6392\u5E8F\u8D8A\u524D\u9762" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { control: (0, jsx_runtime_1.jsx)(material_1.Switch, { checked: formData.featured, onChange: (e) => handleFormChange('featured', e.target.checked) }), label: "\u7279\u8272\u6A19\u7684" }) }), errors.submit && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", children: errors.submit }) })), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', gap: 2, justifyContent: 'flex-end' }, children: (0, jsx_runtime_1.jsx)(material_1.Button, { type: "submit", variant: "contained", size: "large", disabled: loading, startIcon: loading ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : null, children: loading ? '儲存中...' : (opportunity ? '更新' : '建立') }) }) })] }) }) }));
};
exports.default = InvestmentForm;
