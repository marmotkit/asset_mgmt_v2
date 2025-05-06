"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const AuthContext_1 = require("../../../contexts/AuthContext");
const react_router_dom_1 = require("react-router-dom");
const Login = () => {
    const [error, setError] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { login } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        const formData = new FormData(event.currentTarget);
        const username = formData.get('username');
        const password = formData.get('password');
        if (!username || !password) {
            setError('請輸入帳號和密碼');
            setLoading(false);
            return;
        }
        try {
            await login(username, password);
            navigate('/');
        }
        catch (err) {
            console.error('登入錯誤:', err);
            setError('登入失敗，請檢查帳號密碼');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)(material_1.Container, { component: "main", maxWidth: "xs", children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 3, sx: {
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { component: "h1", variant: "h5", sx: { mb: 3 }, children: "\u8CC7\u7522\u7BA1\u7406\u7CFB\u7D71" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { component: "form", onSubmit: handleSubmit, sx: { mt: 1, width: '100%' }, children: [error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 2 }, children: error })), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "normal", required: true, fullWidth: true, id: "username", name: "username", label: "\u5E33\u865F", autoComplete: "username", autoFocus: true }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "normal", required: true, fullWidth: true, id: "password", name: "password", label: "\u5BC6\u78BC", type: "password", autoComplete: "current-password" }), (0, jsx_runtime_1.jsx)(material_1.Button, { type: "submit", fullWidth: true, variant: "contained", sx: { mt: 3, mb: 2 }, disabled: loading, children: loading ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 24 }) : '登入' })] })] }) }) }));
};
exports.default = Login;
