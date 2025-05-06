"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_router_dom_1 = require("react-router-dom");
const Dashboard_1 = __importDefault(require("@mui/icons-material/Dashboard"));
const People_1 = __importDefault(require("@mui/icons-material/People"));
const Business_1 = __importDefault(require("@mui/icons-material/Business"));
const MonetizationOn_1 = __importDefault(require("@mui/icons-material/MonetizationOn"));
const Receipt_1 = __importDefault(require("@mui/icons-material/Receipt"));
const drawerWidth = 240;
const MainLayout = ({ children }) => {
    const menuItems = [
        { text: "儀表板", icon: (0, jsx_runtime_1.jsx)(Dashboard_1.default, {}), path: "/dashboard" },
        { text: "使用者管理", icon: (0, jsx_runtime_1.jsx)(People_1.default, {}), path: "/admin/users" },
        { text: "費用管理", icon: (0, jsx_runtime_1.jsx)(Receipt_1.default, {}), path: "/admin/fee-management" },
        { text: "投資管理", icon: (0, jsx_runtime_1.jsx)(MonetizationOn_1.default, {}), path: "/investment" },
        { text: "公司管理", icon: (0, jsx_runtime_1.jsx)(Business_1.default, {}), path: "/company" },
    ];
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: "flex" }, children: [(0, jsx_runtime_1.jsx)(material_1.AppBar, { position: "fixed", sx: { zIndex: (theme) => theme.zIndex.drawer + 1 }, children: (0, jsx_runtime_1.jsx)(material_1.Toolbar, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", noWrap: true, component: "div", children: "\u8CC7\u7522\u7BA1\u7406\u7CFB\u7D71" }) }) }), (0, jsx_runtime_1.jsxs)(material_1.Drawer, { variant: "permanent", sx: {
                    width: drawerWidth,
                    flexShrink: 0,
                    ["& .MuiDrawer-paper"]: {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }, children: [(0, jsx_runtime_1.jsx)(material_1.Toolbar, {}), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { overflow: "auto" }, children: (0, jsx_runtime_1.jsx)(material_1.List, { children: menuItems.map((item) => ((0, jsx_runtime_1.jsxs)(material_1.ListItemButton, { component: react_router_dom_1.Link, to: item.path, children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: item.icon }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: item.text })] }, item.text))) }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { component: "main", sx: { flexGrow: 1, p: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Toolbar, {}), children] })] }));
};
exports.default = MainLayout;
