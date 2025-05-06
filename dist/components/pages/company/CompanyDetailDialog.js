"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const api_service_1 = require("../../../services/api.service");
const INDUSTRY_OPTIONS = [
    'technology',
    'finance',
    'manufacturing',
    'service',
    'retail',
    'other'
];
const CompanyDetailDialog = ({ open, onClose, companyData, onSave, }) => {
    var _a, _b, _c;
    const [formData, setFormData] = (0, react_1.useState)({
        companyNo: '',
        taxId: '',
        name: '',
        nameEn: '',
        industry: 'other',
        address: '',
        contact: {
            name: '',
            phone: '',
            email: '',
        },
        fax: '',
        note: '',
    });
    const [errors, setErrors] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        const initializeForm = async () => {
            if (companyData) {
                setFormData(companyData);
            }
            else {
                // 如果是新增公司，先取得新的公司編號
                try {
                    const newCompanyNo = await api_service_1.ApiService.getNewCompanyNo();
                    setFormData({
                        companyNo: newCompanyNo,
                        taxId: '',
                        name: '',
                        nameEn: '',
                        industry: 'other',
                        address: '',
                        contact: {
                            name: '',
                            phone: '',
                            email: '',
                        },
                        fax: '',
                        note: '',
                    });
                }
                catch (error) {
                    console.error('生成公司編號失敗:', error);
                }
            }
            setErrors({});
        };
        if (open) {
            initializeForm();
        }
    }, [companyData, open]);
    const validateForm = () => {
        var _a, _b, _c, _d;
        const newErrors = {};
        if (!formData.name)
            newErrors.name = '公司名稱為必填';
        if (!((_a = formData.contact) === null || _a === void 0 ? void 0 : _a.name))
            newErrors['contact.name'] = '聯絡人為必填';
        if (!((_b = formData.contact) === null || _b === void 0 ? void 0 : _b.phone))
            newErrors['contact.phone'] = '聯絡電話為必填';
        if (!((_c = formData.contact) === null || _c === void 0 ? void 0 : _c.email))
            newErrors['contact.email'] = '電子郵件為必填';
        if (!formData.address)
            newErrors.address = '公司地址為必填';
        if (!formData.taxId)
            newErrors.taxId = '統一編號為必填';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (((_d = formData.contact) === null || _d === void 0 ? void 0 : _d.email) && !emailRegex.test(formData.contact.email)) {
            newErrors['contact.email'] = '電子郵件格式不正確';
        }
        const taxIdRegex = /^\d{8}$/;
        if (formData.taxId && !taxIdRegex.test(formData.taxId)) {
            newErrors.taxId = '統一編號必須為8位數字';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm())
            return;
        try {
            await onSave(formData);
            onClose();
        }
        catch (error) {
            // 錯誤處理已在父元件中完成
        }
    };
    const handleChange = (field, value) => {
        if (field.startsWith('contact.')) {
            const contactField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    [contactField]: value
                }
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onClose, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: companyData ? '編輯公司資料' : '新增公司' }) }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u516C\u53F8\u7DE8\u865F", value: formData.companyNo || '', InputProps: {
                                    readOnly: true,
                                }, helperText: "\u7CFB\u7D71\u81EA\u52D5\u7522\u751F" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7D71\u4E00\u7DE8\u865F", value: formData.taxId || '', onChange: (e) => handleChange('taxId', e.target.value), error: !!errors.taxId, helperText: errors.taxId, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u516C\u53F8\u540D\u7A31", value: formData.name || '', onChange: (e) => handleChange('name', e.target.value), error: !!errors.name, helperText: errors.name, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u82F1\u6587\u7C21\u7A31", value: formData.nameEn || '', onChange: (e) => handleChange('nameEn', e.target.value) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u516C\u53F8\u5730\u5740", value: formData.address || '', onChange: (e) => handleChange('address', e.target.value), error: !!errors.address, helperText: errors.address, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, select: true, label: "\u7522\u696D\u985E\u5225", value: formData.industry || '', onChange: (e) => handleChange('industry', e.target.value), children: INDUSTRY_OPTIONS.map((option) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: option, children: option }, option))) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u516C\u53F8\u50B3\u771F", value: formData.fax || '', onChange: (e) => handleChange('fax', e.target.value) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u806F\u7D61\u4EBA", value: ((_a = formData.contact) === null || _a === void 0 ? void 0 : _a.name) || '', onChange: (e) => handleChange('contact.name', e.target.value), error: !!errors['contact.name'], helperText: errors['contact.name'], required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u806F\u7D61\u96FB\u8A71", value: ((_b = formData.contact) === null || _b === void 0 ? void 0 : _b.phone) || '', onChange: (e) => handleChange('contact.phone', e.target.value), error: !!errors['contact.phone'], helperText: errors['contact.phone'], required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96FB\u5B50\u90F5\u4EF6", value: ((_c = formData.contact) === null || _c === void 0 ? void 0 : _c.email) || '', onChange: (e) => handleChange('contact.email', e.target.value), error: !!errors['contact.email'], helperText: errors['contact.email'], required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5099\u8A3B", value: formData.note || '', onChange: (e) => handleChange('note', e.target.value), multiline: true, rows: 3 }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onClose, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", children: "\u5132\u5B58" })] })] }));
};
exports.default = CompanyDetailDialog;
