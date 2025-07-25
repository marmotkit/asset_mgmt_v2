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
const RentalAndProfitManagement_1 = __importDefault(require("../components/pages/investment/RentalAndProfitManagement"));
const MemberServicesManagement_1 = __importDefault(require("../components/pages/services/MemberServicesManagement"));
const AccountingManagement_1 = __importDefault(require("../components/pages/accounting/AccountingManagement"));
const InvestmentDashboard_1 = __importDefault(require("../components/pages/investment-dashboard/InvestmentDashboard"));
const InvestmentDetail_1 = __importDefault(require("../components/pages/investment-dashboard/InvestmentDetail"));
const InvestmentManagement_2 = __importDefault(require("../components/pages/investment-dashboard/admin/InvestmentManagement"));
const InquiryManagement_1 = __importDefault(require("../components/pages/investment-dashboard/admin/InquiryManagement"));
const SystemInfo_1 = __importDefault(require("../components/pages/SystemInfo"));
const RoleBasedRoute_1 = __importDefault(require("../components/common/RoleBasedRoute"));
const SystemRecords_1 = __importDefault(require("../components/pages/SystemRecords"));
// 保護路由的高階組件
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = (0, AuthContext_1.useAuth)();
    if (!isAuthenticated) {
        return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/login", replace: true });
    }
    return (0, jsx_runtime_1.jsx)(Layout_1.default, { children: children });
};
// 管理員專用路由
const AdminRoute = ({ children }) => {
    return ((0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)(RoleBasedRoute_1.default, { allowedRoles: ['admin'], children: children }) }));
};
// 一般用戶路由（所有角色都可訪問）
const PublicRoute = ({ children }) => {
    return ((0, jsx_runtime_1.jsx)(ProtectedRoute, { children: children }));
};
const AppRoutes = () => {
    return ((0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/login", element: (0, jsx_runtime_1.jsx)(Login_1.default, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/users", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(UserManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/fees", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(FeeManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/companies", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(CompanyManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(InvestmentManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment/rental-payment", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(RentalAndProfitManagement_1.default, { initialTab: 1 }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment/member-profit", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(RentalAndProfitManagement_1.default, { initialTab: 2 }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment/history", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(RentalAndProfitManagement_1.default, { initialTab: 3 }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment/invoice/print/:invoiceId", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(InvoicePrintPage_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/payment", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(AccountingManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment-dashboard-management", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(InvestmentManagement_2.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment-dashboard-management/inquiries", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(InquiryManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/system-records", element: (0, jsx_runtime_1.jsx)(AdminRoute, { children: (0, jsx_runtime_1.jsx)(SystemRecords_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/services", element: (0, jsx_runtime_1.jsx)(PublicRoute, { children: (0, jsx_runtime_1.jsx)(MemberServicesManagement_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment-dashboard", element: (0, jsx_runtime_1.jsx)(PublicRoute, { children: (0, jsx_runtime_1.jsx)(InvestmentDashboard_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/investment-dashboard/:id", element: (0, jsx_runtime_1.jsx)(PublicRoute, { children: (0, jsx_runtime_1.jsx)(InvestmentDetail_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/system-info", element: (0, jsx_runtime_1.jsx)(PublicRoute, { children: (0, jsx_runtime_1.jsx)(SystemInfo_1.default, {}) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/services", replace: true }) }) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "*", element: (0, jsx_runtime_1.jsx)(ProtectedRoute, { children: (0, jsx_runtime_1.jsx)("div", { children: "404 Not Found" }) }) })] }));
};
exports.default = AppRoutes;
