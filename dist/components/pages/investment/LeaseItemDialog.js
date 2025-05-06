"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const dayjs_1 = __importDefault(require("dayjs"));
const LeaseItemDialog = ({ open, onClose, onSave, leaseItem, investmentId }) => {
    var _a, _b, _c, _d;
    const defaultProfitSharing = {
        type: 'monthly_fixed',
        value: 0,
        description: '',
        minimumAmount: 0,
        maximumAmount: 0
    };
    const [formData, setFormData] = (0, react_1.useState)({
        id: crypto.randomUUID(),
        investmentId: investmentId,
        name: '',
        description: '',
        startDate: (0, dayjs_1.default)().format('YYYY-MM-DD'),
        endDate: (0, dayjs_1.default)().add(1, 'year').format('YYYY-MM-DD'),
        status: 'active',
        rentalAmount: 0,
        profitSharing: defaultProfitSharing,
        tenantInfo: {
            name: '',
            contact: '',
            phone: '',
            email: ''
        },
        rentalPayments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    (0, react_1.useEffect)(() => {
        if (leaseItem) {
            setFormData({
                ...leaseItem,
                profitSharing: leaseItem.profitSharing || defaultProfitSharing
            });
        }
    }, [leaseItem]);
    const handleFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    const handleProfitSharingChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            profitSharing: {
                ...defaultProfitSharing,
                ...(prev.profitSharing || {}),
                [field]: value
            }
        }));
    };
    const handleTenantInfoChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            tenantInfo: {
                ...prev.tenantInfo,
                [field]: value
            }
        }));
    };
    const handleSubmit = async () => {
        try {
            const leaseItemData = {
                ...formData,
                investmentId: investmentId,
                id: formData.id || crypto.randomUUID(),
                createdAt: formData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rentalPayments: formData.rentalPayments || [],
                profitSharing: formData.profitSharing || defaultProfitSharing
            };
            await onSave(leaseItemData);
            onClose();
        }
        catch (error) {
            console.error('提交租賃項目時發生錯誤:', error);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onClose, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: leaseItem ? '編輯租賃項目' : '新增租賃項目' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u79DF\u8CC3\u9805\u76EE\u540D\u7A31", value: formData.name, onChange: (e) => handleFieldChange('name', e.target.value), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u63CF\u8FF0", value: formData.description, onChange: (e) => handleFieldChange('description', e.target.value), multiline: true, rows: 3 }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u958B\u59CB\u65E5\u671F", type: "date", value: formData.startDate, onChange: (e) => handleFieldChange('startDate', e.target.value), InputLabelProps: {
                                    shrink: true,
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7D50\u675F\u65E5\u671F", type: "date", value: formData.endDate, onChange: (e) => handleFieldChange('endDate', e.target.value), InputLabelProps: {
                                    shrink: true,
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u79DF\u91D1\u91D1\u984D", type: "number", value: formData.rentalAmount, onChange: (e) => handleFieldChange('rentalAmount', parseFloat(e.target.value)), InputProps: {
                                    inputProps: { min: 0 }
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u5206\u6F64\u8A2D\u5B9A" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u5206\u6F64\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: ((_a = formData.profitSharing) === null || _a === void 0 ? void 0 : _a.type) || defaultProfitSharing.type, onChange: (e) => handleProfitSharingChange('type', e.target.value), label: "\u5206\u6F64\u985E\u578B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "monthly_fixed", children: "\u6BCF\u6708\u56FA\u5B9A\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "yearly_fixed", children: "\u6BCF\u5E74\u56FA\u5B9A\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "percentage", children: "\u71DF\u6536\u767E\u5206\u6BD4" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5206\u6F64\u503C", type: "number", value: ((_b = formData.profitSharing) === null || _b === void 0 ? void 0 : _b.value) || defaultProfitSharing.value, onChange: (e) => handleProfitSharingChange('value', parseFloat(e.target.value)), InputProps: {
                                    inputProps: { min: 0 }
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6700\u5C0F\u91D1\u984D", type: "number", value: ((_c = formData.profitSharing) === null || _c === void 0 ? void 0 : _c.minimumAmount) || defaultProfitSharing.minimumAmount, onChange: (e) => handleProfitSharingChange('minimumAmount', parseFloat(e.target.value)), InputProps: {
                                    inputProps: { min: 0 }
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6700\u5927\u91D1\u984D", type: "number", value: ((_d = formData.profitSharing) === null || _d === void 0 ? void 0 : _d.maximumAmount) || defaultProfitSharing.maximumAmount, onChange: (e) => handleProfitSharingChange('maximumAmount', parseFloat(e.target.value)), InputProps: {
                                    inputProps: { min: 0 }
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u627F\u79DF\u4EBA\u8CC7\u8A0A" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u627F\u79DF\u4EBA\u59D3\u540D", value: formData.tenantInfo.name, onChange: (e) => handleTenantInfoChange('name', e.target.value), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u806F\u7D61\u4EBA", value: formData.tenantInfo.contact, onChange: (e) => handleTenantInfoChange('contact', e.target.value), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96FB\u8A71", value: formData.tenantInfo.phone, onChange: (e) => handleTenantInfoChange('phone', e.target.value), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96FB\u5B50\u90F5\u4EF6", type: "email", value: formData.tenantInfo.email, onChange: (e) => handleTenantInfoChange('email', e.target.value), required: true }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onClose, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", color: "primary", children: "\u4FDD\u5B58" })] })] }));
};
exports.default = LeaseItemDialog;
