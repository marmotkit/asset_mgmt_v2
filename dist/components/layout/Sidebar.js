"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../../contexts/AuthContext");
const Sidebar = () => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const location = (0, react_router_dom_1.useLocation)();
    const { user } = (0, AuthContext_1.useAuth)();
    const [version, setVersion] = (0, react_1.useState)(() => {
        // 從 localStorage 讀取版本號，如果沒有則使用預設值 '1.0'
        return localStorage.getItem('app_version') || '1.0';
    });
    const currentYear = new Date().getFullYear();
    // 當版本號改變時，保存到 localStorage
    (0, react_1.useEffect)(() => {
        localStorage.setItem('app_version', version);
    }, [version]);
    const handleVersionClick = (event) => {
        const isLeftClick = event.button === 0;
        const currentVersionParts = version.split('.');
        const major = parseInt(currentVersionParts[0]);
        let minor = parseInt(currentVersionParts[1]);
        if (isLeftClick) {
            // 左鍵點擊，版本號加0.1
            minor = minor === 9 ? 0 : minor + 1;
            const newMajor = minor === 0 ? major + 1 : major;
            setVersion(`${newMajor}.${minor}`);
        }
        else if (event.button === 2) {
            // 右鍵點擊，版本號減0.1
            event.preventDefault();
            if (major === 1 && minor === 0)
                return; // 不允許低於 1.0
            minor = minor === 0 ? 9 : minor - 1;
            const newMajor = minor === 9 ? major - 1 : major;
            setVersion(`${newMajor}.${minor}`);
        }
    };
    // 檢查是否為管理員角色
    const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'admin' || (user === null || user === void 0 ? void 0 : user.role) === 'business' || (user === null || user === void 0 ? void 0 : user.role) === 'lifetime';
    // 根據角色定義菜單項目
    const getMenuItems = () => {
        const allMenuItems = [
            {
                text: '會員管理',
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.People, {}),
                path: '/users',
                adminOnly: true
            },
            {
                text: '會費管理',
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Receipt, {}),
                path: '/fees',
                adminOnly: true
            },
            {
                text: '公司資訊',
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Business, {}),
                path: '/companies',
                adminOnly: true
            },
            {
                text: '投資管理',
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.AccountBalance, {}),
                path: '/investment',
                adminOnly: true
            },
            {
                text: '會員服務',
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Support, {}),
                path: '/services',
                adminOnly: false
            },
            {
                text: '帳務管理',
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Payment, {}),
                path: '/payment',
                adminOnly: true
            },
            {
                text: '投資看板',
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Dashboard, {}),
                path: '/investment-dashboard',
                adminOnly: false
            },
            {
                text: '通知提醒',
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Notifications, {}),
                path: '/notifications',
                adminOnly: true
            },
            {
                text: '安全隱私',
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Security, {}),
                path: '/security',
                adminOnly: true
            }
        ];
        // 根據用戶角色過濾菜單項目
        return allMenuItems.filter(item => !item.adminOnly || isAdmin);
    };
    const menuItems = getMenuItems();
    return ((0, jsx_runtime_1.jsxs)(material_1.Drawer, { variant: "permanent", sx: {
            width: '240px',
            flexShrink: 0,
            position: 'fixed',
            height: '100vh',
            '& .MuiDrawer-paper': {
                width: '240px',
                boxSizing: 'border-box',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                backgroundColor: '#fff',
                position: 'fixed',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
            },
        }, children: [(0, jsx_runtime_1.jsx)(material_1.Toolbar, {}), " ", (0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                    overflow: 'auto',
                    flex: 1,
                }, children: (0, jsx_runtime_1.jsx)(material_1.List, { children: menuItems.map((item) => ((0, jsx_runtime_1.jsx)(material_1.ListItem, { disablePadding: true, children: (0, jsx_runtime_1.jsxs)(material_1.ListItemButton, { selected: location.pathname === item.path, onClick: () => navigate(item.path), sx: {
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                },
                                '&.Mui-selected:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                },
                                py: 1.5, // 增加按鈕高度
                            }, children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { sx: { minWidth: 40 }, children: item.icon }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: item.text })] }) }, item.path))) }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                    p: 2,
                    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                    backgroundColor: '#f5f5f5',
                }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "caption", component: "div", align: "center", color: "text.secondary", sx: { mb: 1 }, children: ["Copy Right \u00A9 ", currentYear, " XXXX"] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "caption", component: "div", align: "center", sx: {
                            cursor: 'pointer',
                            userSelect: 'none',
                            '&:hover': {
                                color: 'primary.main',
                            },
                        }, onMouseDown: handleVersionClick, onContextMenu: (e) => e.preventDefault(), children: ["Version ", version] })] })] }));
};
exports.default = Sidebar;
