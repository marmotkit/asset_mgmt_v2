"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const AuthContext_1 = require("../../contexts/AuthContext");
const Header = () => {
    const { user, logout } = (0, AuthContext_1.useAuth)();
    const handleLogout = () => {
        logout();
    };
    return ((0, jsx_runtime_1.jsx)(material_1.AppBar, { position: "fixed", sx: {
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: '#1976d2',
            width: '100%',
        }, children: (0, jsx_runtime_1.jsxs)(material_1.Toolbar, { sx: { pr: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", component: "div", sx: { flexGrow: 1 }, children: "\u8CC7\u7522\u7BA1\u7406\u7CFB\u7D71" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [user && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: user.name })), (0, jsx_runtime_1.jsx)(material_1.Button, { color: "inherit", onClick: handleLogout, startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.ExitToApp, {}), children: "\u767B\u51FA" })] })] }) }));
};
exports.default = Header;
