"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../../contexts/AuthContext");
const drawerWidth = 240;
const menuItems = [
    { text: '會員管理', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Person, {}), path: '/admin/users' },
    { text: '公司資訊', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Business, {}), path: '/company' },
    { text: '投資管理', icon: (0, jsx_runtime_1.jsx)(icons_material_1.AccountBalance, {}), path: '/investment' },
    { text: '會員服務', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Support, {}), path: '/services' },
    { text: '交易支付', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Payment, {}), path: '/payment' },
    { text: '通知提醒', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Notifications, {}), path: '/notifications' },
    { text: '安全隱私', icon: (0, jsx_runtime_1.jsx)(icons_material_1.Security, {}), path: '/security' },
];
const MainLayout = ({ children }) => {
    var _a;
    const navigate = (0, react_router_dom_1.useNavigate)();
    const location = (0, react_router_dom_1.useLocation)();
    const { user, logout } = (0, AuthContext_1.useAuth)();
    const [mobileOpen, setMobileOpen] = react_1.default.useState(false);
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const drawer = ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Toolbar, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", noWrap: true, children: "\u8CC7\u7522\u7BA1\u7406\u7CFB\u7D71" }) }), (0, jsx_runtime_1.jsx)(material_1.Divider, {}), (0, jsx_runtime_1.jsx)(material_1.List, { children: menuItems.map((item) => ((0, jsx_runtime_1.jsx)(material_1.ListItem, { disablePadding: true, children: (0, jsx_runtime_1.jsxs)(material_1.ListItemButton, { selected: location.pathname === item.path, onClick: () => {
                            navigate(item.path);
                            setMobileOpen(false);
                        }, children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: item.icon }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: item.text })] }) }, item.text))) })] }));
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex' }, children: [(0, jsx_runtime_1.jsx)(material_1.AppBar, { position: "fixed", sx: {
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }, children: (0, jsx_runtime_1.jsxs)(material_1.Toolbar, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "inherit", edge: "start", onClick: handleDrawerToggle, sx: { mr: 2, display: { sm: 'none' } }, children: (0, jsx_runtime_1.jsx)(icons_material_1.Menu, {}) }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", noWrap: true, component: "div", sx: { flexGrow: 1 }, children: ((_a = menuItems.find(item => item.path === location.pathname)) === null || _a === void 0 ? void 0 : _a.text) || '首頁' }), user && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", sx: { mr: 2 }, children: user.username }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "inherit", onClick: logout, children: "\u767B\u51FA" })] }))] }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { component: "nav", sx: { width: { sm: drawerWidth }, flexShrink: { sm: 0 } }, children: [(0, jsx_runtime_1.jsx)(material_1.Drawer, { variant: "temporary", open: mobileOpen, onClose: handleDrawerToggle, ModalProps: {
                            keepMounted: true, // Better open performance on mobile.
                        }, sx: {
                            display: { xs: 'block', sm: 'none' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth,
                            },
                        }, children: drawer }), (0, jsx_runtime_1.jsx)(material_1.Drawer, { variant: "permanent", sx: {
                            display: { xs: 'none', sm: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth,
                            },
                        }, open: true, children: drawer })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { component: "main", sx: {
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                }, children: children })] }));
};
exports.default = MainLayout;
