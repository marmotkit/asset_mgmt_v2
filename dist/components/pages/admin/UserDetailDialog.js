"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const api_service_1 = require("../../../services/api.service");
const defaultFormData = {
    username: '',
    name: '',
    email: '',
    role: 'normal',
    status: 'active',
    companyId: '',
};
const UserDetailDialog = ({ open, onClose, onSave, user }) => {
    const [formData, setFormData] = (0, react_1.useState)(defaultFormData);
    const [errors, setErrors] = (0, react_1.useState)({});
    const [companies, setCompanies] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        loadCompanies();
    }, []);
    const resetForm = () => {
        if (user) {
            setFormData(user);
        }
        else {
            // 清空表單資料
            setFormData({ ...defaultFormData });
        }
        setErrors({});
    };
    // 當對話框開啟或傳入的使用者變更時，重設表單資料
    (0, react_1.useEffect)(() => {
        if (open) {
            resetForm();
        }
    }, [user, open]);
    const loadCompanies = async () => {
        try {
            const data = await api_service_1.ApiService.getCompanies();
            setCompanies(data);
        }
        catch (error) {
            console.error('載入公司資料失敗:', error);
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.username) {
            newErrors.username = '請輸入會員帳號';
        }
        if (!formData.name) {
            newErrors.name = '請輸入姓名';
        }
        if (!formData.email) {
            newErrors.email = '請輸入電子郵件';
        }
        else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = '請輸入有效的電子郵件地址';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };
    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }
        const userData = {
            ...user,
            username: formData.username,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            status: formData.status,
            companyId: formData.companyId,
            updatedAt: new Date().toISOString()
        };
        await onSave(userData);
        onClose();
    };
    // 處理關閉對話框
    const handleClose = () => {
        // 清空表單數據
        setFormData({ ...defaultFormData });
        onClose();
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: handleClose, maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: user ? '編輯會員' : '新增會員' }) }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6703\u54E1\u5E33\u865F", value: formData.username, onChange: (e) => handleFieldChange('username', e.target.value), error: !!errors.username, helperText: errors.username, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u59D3\u540D", value: formData.name, onChange: (e) => handleFieldChange('name', e.target.value), error: !!errors.name, helperText: errors.name, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96FB\u5B50\u90F5\u4EF6", type: "email", value: formData.email, onChange: (e) => handleFieldChange('email', e.target.value), error: !!errors.email, helperText: errors.email, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u89D2\u8272" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.role, onChange: (e) => handleFieldChange('role', e.target.value), label: "\u89D2\u8272", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "admin", children: "\u7BA1\u7406\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "normal", children: "\u4E00\u822C\u6703\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "business", children: "\u5546\u52D9\u6703\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "lifetime", children: "\u6C38\u4E45\u6703\u54E1" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.status, onChange: (e) => handleFieldChange('status', e.target.value), label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "active", children: "\u555F\u7528" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "inactive", children: "\u505C\u7528" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "suspended", children: "\u66AB\u505C" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6240\u5C6C\u516C\u53F8" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.companyId || '', onChange: (e) => handleFieldChange('companyId', e.target.value), label: "\u6240\u5C6C\u516C\u53F8", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u7121" }), companies.map((company) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: company.id, children: company.name }, company.id)))] })] }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", color: "primary", children: "\u4FDD\u5B58" })] })] }));
};
exports.default = UserDetailDialog;
