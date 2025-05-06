"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const styles_1 = require("@mui/material/styles");
const RegisterContainer = (0, styles_1.styled)(material_1.Container)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    padding: theme.spacing(4),
}));
const RegisterBox = (0, styles_1.styled)(material_1.Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    maxWidth: 600,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
}));
const Register = () => {
    const [formData, setFormData] = (0, react_1.useState)({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
    });
    const [error, setError] = (0, react_1.useState)('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // 基本驗證
        if (formData.password !== formData.confirmPassword) {
            setError('密碼與確認密碼不符');
            return;
        }
        if (formData.password.length < 8) {
            setError('密碼長度必須至少8個字元');
            return;
        }
        try {
            // TODO: 實作註冊邏輯
            console.log('Register attempt:', formData);
            // 註冊成功後導向登入頁面
        }
        catch (err) {
            setError('註冊失敗，請稍後再試');
        }
    };
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    return ((0, jsx_runtime_1.jsx)(RegisterContainer, { children: (0, jsx_runtime_1.jsxs)(RegisterBox, { elevation: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", component: "h1", gutterBottom: true, children: "\u6703\u54E1\u8A3B\u518A" }), error && (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", children: error }), (0, jsx_runtime_1.jsxs)(material_1.Box, { component: "form", onSubmit: handleSubmit, sx: { width: '100%' }, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { required: true, fullWidth: true, name: "lastName", label: "\u59D3", value: formData.lastName, onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { required: true, fullWidth: true, name: "firstName", label: "\u540D", value: formData.firstName, onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { required: true, fullWidth: true, name: "username", label: "\u5E33\u865F", value: formData.username, onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { required: true, fullWidth: true, name: "email", label: "\u96FB\u5B50\u90F5\u4EF6", type: "email", value: formData.email, onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { required: true, fullWidth: true, name: "phone", label: "\u806F\u7D61\u96FB\u8A71", value: formData.phone, onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { required: true, fullWidth: true, name: "password", label: "\u5BC6\u78BC", type: "password", value: formData.password, onChange: handleChange, helperText: "\u5BC6\u78BC\u9577\u5EA6\u81F3\u5C118\u500B\u5B57\u5143" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { required: true, fullWidth: true, name: "confirmPassword", label: "\u78BA\u8A8D\u5BC6\u78BC", type: "password", value: formData.confirmPassword, onChange: handleChange }) })] }), (0, jsx_runtime_1.jsx)(material_1.Button, { type: "submit", fullWidth: true, variant: "contained", sx: { mt: 3, mb: 2 }, children: "\u8A3B\u518A" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { textAlign: 'center' }, children: (0, jsx_runtime_1.jsx)(material_1.Link, { href: "/login", variant: "body2", children: "\u5DF2\u6709\u5E33\u865F\uFF1F\u8FD4\u56DE\u767B\u5165" }) })] })] }) }));
};
exports.default = Register;
