"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const AuthContext_1 = require("../../contexts/AuthContext");
const Sidebar_1 = __importDefault(require("./Sidebar"));
const Header_1 = __importDefault(require("./Header"));
const Login_1 = __importDefault(require("../pages/auth/Login"));
const Layout = ({ children }) => {
    const { isAuthenticated } = (0, AuthContext_1.useAuth)();
    if (!isAuthenticated) {
        return (0, jsx_runtime_1.jsx)(Login_1.default, {});
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', minHeight: '100vh' }, children: [(0, jsx_runtime_1.jsx)(Header_1.default, {}), (0, jsx_runtime_1.jsx)(Sidebar_1.default, {}), (0, jsx_runtime_1.jsx)(material_1.Box, { component: "main", sx: {
                    flexGrow: 1,
                    p: 3,
                    marginLeft: '240px', // 固定側邊欄寬度
                    marginTop: '64px', // 固定頂部欄高度
                    backgroundColor: '#f5f5f5',
                    minHeight: 'calc(100vh - 64px)',
                    overflow: 'auto',
                    position: 'relative',
                }, children: children })] }));
};
exports.default = Layout;
