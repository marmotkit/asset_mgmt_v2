"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const Layout_1 = __importDefault(require("../components/layout/Layout"));
const Login_1 = __importDefault(require("../components/pages/auth/Login"));
const UserManagement_1 = __importDefault(require("../components/pages/admin/UserManagement"));
const CompanyManagement_1 = __importDefault(require("../components/pages/company/CompanyManagement"));
const InvestmentManagement_1 = __importDefault(require("../components/pages/investment/InvestmentManagement"));
const FeeManagement_1 = __importDefault(require("../components/pages/fees/FeeManagement"));
const InvoicePrintPage_1 = __importDefault(require("../components/pages/investment/InvoicePrintPage"));
// 保護路由的高階組件
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = (0, AuthContext_1.useAuth)();
    if (!isAuthenticated) {
        return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true });
    }
    return (0, jsx_runtime_1.jsx)(Layout_1.default, { children: children });
};
const AppRoutes = () => {
    return ((0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/login", element: (0, jsx_runtime_1.jsx)(Login_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/users", replace: true }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/users", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)(UserManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/fees", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)(FeeManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/companies", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)(CompanyManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)(InvestmentManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment/invoice/print/:invoiceId", element: (0, jsx_runtime_1.jsx)(InvoicePrintPage_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/services", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)("div", { children: "\u6703\u54E1\u670D\u52D9" }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/payment", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)("div", { children: "\u4EA4\u6613\u652F\u4ED8" }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/notifications", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)("div", { children: "\u901A\u77E5\u63D0\u9192" }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/security", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)("div", { children: "\u5B89\u5168\u96B1\u79C1" }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "*", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)("div", { children: "404 Not Found" }) }) })] }));
};
exports.default = AppRoutes;
