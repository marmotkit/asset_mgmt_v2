"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const AdapterDayjs_1 = require("@mui/x-date-pickers/AdapterDayjs");
const dayjs_1 = __importDefault(require("dayjs"));
const api_service_1 = require("../../../services/api.service");
const InvestmentDetailDialog = ({ open, onClose, onSave, investment }) => {
    const [formData, setFormData] = (0, react_1.useState)(() => ({
        companyId: (investment === null || investment === void 0 ? void 0 : investment.companyId) || '',
        userId: '',
        type: (investment === null || investment === void 0 ? void 0 : investment.type) || 'movable',
        name: (investment === null || investment === void 0 ? void 0 : investment.name) || '',
        description: (investment === null || investment === void 0 ? void 0 : investment.description) || '',
        amount: (investment === null || investment === void 0 ? void 0 : investment.amount) || 0,
        startDate: (investment === null || investment === void 0 ? void 0 : investment.startDate) || (0, dayjs_1.default)().format('YYYY-MM-DD'),
        endDate: (investment === null || investment === void 0 ? void 0 : investment.endDate) || '',
        status: (investment === null || investment === void 0 ? void 0 : investment.status) || 'pending',
        // 動產特有欄位
        assetType: (investment === null || investment === void 0 ? void 0 : investment.type) === 'movable' ? investment.assetType : '',
        serialNumber: (investment === null || investment === void 0 ? void 0 : investment.type) === 'movable' ? investment.serialNumber : '',
        manufacturer: (investment === null || investment === void 0 ? void 0 : investment.type) === 'movable' ? investment.manufacturer : '',
        // 不動產特有欄位
        location: (investment === null || investment === void 0 ? void 0 : investment.type) === 'immovable' ? investment.location : '',
        area: (investment === null || investment === void 0 ? void 0 : investment.type) === 'immovable' ? investment.area : 0,
        propertyType: (investment === null || investment === void 0 ? void 0 : investment.type) === 'immovable' ? investment.propertyType : '',
        registrationNumber: (investment === null || investment === void 0 ? void 0 : investment.type) === 'immovable' ? investment.registrationNumber : ''
    }));
    const [errors, setErrors] = (0, react_1.useState)({});
    const [companies, setCompanies] = (0, react_1.useState)([]);
    const [users, setUsers] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (investment) {
            setFormData({
                ...investment,
                userId: investment.userId || '',
                // 動產特有欄位
                assetType: investment.type === 'movable' ? investment.assetType : '',
                serialNumber: investment.type === 'movable' ? investment.serialNumber : '',
                manufacturer: investment.type === 'movable' ? investment.manufacturer : '',
                // 不動產特有欄位
                location: investment.type === 'immovable' ? investment.location : '',
                area: investment.type === 'immovable' ? investment.area : 0,
                propertyType: investment.type === 'immovable' ? investment.propertyType : '',
                registrationNumber: investment.type === 'immovable' ? investment.registrationNumber : ''
            });
        }
        else {
            setFormData({
                type: 'movable',
                name: '',
                description: '',
                amount: 0,
                startDate: (0, dayjs_1.default)().format('YYYY-MM-DD'),
                status: 'pending',
                companyId: '',
                userId: '',
                // 動產特有欄位
                assetType: '',
                serialNumber: '',
                manufacturer: '',
                // 不動產特有欄位
                location: '',
                area: 0,
                propertyType: '',
                registrationNumber: ''
            });
        }
        setErrors({});
        loadCompanies();
        loadUsers();
    }, [investment]);
    const loadCompanies = async () => {
        try {
            const data = await api_service_1.ApiService.getCompanies();
            setCompanies(data);
        }
        catch (error) {
            console.error('載入公司資料失敗:', error);
        }
    };
    const loadUsers = async () => {
        try {
            const data = await api_service_1.ApiService.getUsers();
            setUsers(data);
        }
        catch (error) {
            console.error('載入會員資料失敗:', error);
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) {
            newErrors.name = '請輸入投資名稱';
        }
        if (!formData.type) {
            newErrors.type = '請選擇投資類型';
        }
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = '請輸入有效的投資金額';
        }
        if (!formData.startDate) {
            newErrors.startDate = '請選擇開始日期';
        }
        if (!formData.companyId) {
            newErrors.companyId = '請選擇所屬公司';
        }
        if (!formData.userId) {
            newErrors.userId = '請選擇所屬會員';
        }
        // 根據投資類型驗證特定欄位（暫時放寬驗證）
        if (formData.type === 'movable') {
            // 暫時移除動產特有欄位的必填驗證
            // if (!formData.assetType) {
            //     newErrors.assetType = '請輸入資產類型';
            // }
            // if (!formData.serialNumber) {
            //     newErrors.serialNumber = '請輸入序號';
            // }
        }
        else if (formData.type === 'immovable') {
            // 暫時移除不動產特有欄位的必填驗證
            // if (!formData.location) {
            //     newErrors.location = '請輸入位置';
            // }
            // if (!formData.propertyType) {
            //     newErrors.propertyType = '請輸入物業類型';
            // }
            // if (!formData.registrationNumber) {
            //     newErrors.registrationNumber = '請輸入登記號碼';
            // }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleTextChange = (field) => (event) => {
        const value = event.target.value;
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
    const handleSelectChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };
    const handleDateChange = (field) => (value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value ? value.format('YYYY-MM-DD') : ''
        }));
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            await onSave(formData);
            onClose();
        }
        catch (error) {
            console.error('Failed to save investment:', error);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onClose, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: investment ? '編輯投資' : '新增投資' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u57FA\u672C\u8CC7\u6599" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u540D\u7A31", value: formData.name, onChange: handleTextChange('name'), error: !!errors.name, helperText: errors.name, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, error: !!errors.type, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.type, onChange: handleSelectChange('type'), label: "\u985E\u578B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "movable", children: "\u52D5\u7522" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "immovable", children: "\u4E0D\u52D5\u7522" })] }), errors.type && (0, jsx_runtime_1.jsx)(material_1.FormHelperText, { children: errors.type })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u63CF\u8FF0", value: formData.description, onChange: handleTextChange('description'), multiline: true, rows: 2 }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6295\u8CC7\u91D1\u984D", type: "number", value: formData.amount, onChange: handleTextChange('amount'), error: !!errors.amount, helperText: errors.amount, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, error: !!errors.status, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.status, onChange: handleSelectChange('status'), label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "pending", children: "\u5BE9\u6838\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "active", children: "\u9032\u884C\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "completed", children: "\u5DF2\u5B8C\u6210" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "terminated", children: "\u5DF2\u7D42\u6B62" })] }), errors.status && (0, jsx_runtime_1.jsx)(material_1.FormHelperText, { children: errors.status })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(LocalizationProvider_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, children: (0, jsx_runtime_1.jsx)(DatePicker_1.DatePicker, { label: "\u958B\u59CB\u65E5\u671F", value: (0, dayjs_1.default)(formData.startDate), onChange: handleDateChange('startDate'), slotProps: {
                                        textField: {
                                            fullWidth: true,
                                            error: !!errors.startDate,
                                            helperText: errors.startDate
                                        }
                                    } }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(LocalizationProvider_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, children: (0, jsx_runtime_1.jsx)(DatePicker_1.DatePicker, { label: "\u7D50\u675F\u65E5\u671F", value: formData.endDate ? (0, dayjs_1.default)(formData.endDate) : null, onChange: handleDateChange('endDate'), slotProps: { textField: { fullWidth: true } } }) }) }), formData.type === 'movable' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u52D5\u7522\u8CC7\u6599" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u8CC7\u7522\u985E\u578B", value: formData.assetType, onChange: handleTextChange('assetType') }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5E8F\u865F", value: formData.serialNumber, onChange: handleTextChange('serialNumber') }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u88FD\u9020\u5546", value: formData.manufacturer, onChange: handleTextChange('manufacturer') }) })] })), formData.type === 'immovable' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u4E0D\u52D5\u7522\u8CC7\u6599" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u4F4D\u7F6E", value: formData.location, onChange: handleTextChange('location') }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u9762\u7A4D", type: "number", value: formData.area, onChange: handleTextChange('area') }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5730\u865F", value: formData.registrationNumber, onChange: handleTextChange('registrationNumber') }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7528\u5730\u985E\u578B", value: formData.propertyType, onChange: handleTextChange('propertyType') }) })] })), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, error: !!errors.companyId, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6240\u5C6C\u516C\u53F8" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.companyId || '', onChange: handleSelectChange('companyId'), label: "\u6240\u5C6C\u516C\u53F8", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u7121" }), companies.map((company) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: company.id, children: company.name }, company.id)))] }), errors.companyId && (0, jsx_runtime_1.jsx)(material_1.FormHelperText, { children: errors.companyId })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, error: !!errors.userId, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6240\u5C6C\u6703\u54E1" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: formData.userId || '', onChange: handleSelectChange('userId'), label: "\u6240\u5C6C\u6703\u54E1", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u7121" }), users.map((user) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: user.id, children: [user.name, " (", user.memberNo, ")"] }, user.id)))] }), errors.userId && (0, jsx_runtime_1.jsx)(material_1.FormHelperText, { children: errors.userId })] }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onClose, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", color: "primary", children: "\u4FDD\u5B58" })] })] }));
};
exports.default = InvestmentDetailDialog;
