"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../../contexts/AuthContext");
const RoleBasedRoute = ({ children, allowedRoles = ['admin'], fallbackPath = '/services' }) => {
    const { user, isAuthenticated } = (0, AuthContext_1.useAuth)();
    if (!isAuthenticated) {
        return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true });
    }
    // 檢查用戶角色是否有權限
    if (user && allowedRoles.includes(user.role)) {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: children });
    }
    // 沒有權限時重定向到指定頁面
    return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: fallbackPath, replace: true });
};
exports.default = RoleBasedRoute;
