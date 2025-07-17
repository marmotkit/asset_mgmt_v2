"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const AuthContext_1 = require("../../contexts/AuthContext");
const Sidebar_1 = __importDefault(require("./Sidebar"));
const Header_1 = __importDefault(require("./Header"));
const Login_1 = __importDefault(require("../pages/auth/Login"));
const Layout = ({ children }) => {
    const { isAuthenticated } = (0, AuthContext_1.useAuth)();
    const theme = (0, material_1.useTheme)();
    const isMobile = (0, material_1.useMediaQuery)(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = (0, react_1.useState)(!isMobile);
    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };
    if (!isAuthenticated) {
        return (0, jsx_runtime_1.jsx)(Login_1.default, {});
    }
    const drawerWidth = sidebarOpen ? 240 : 64;
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', minHeight: '100vh' }, children: [(0, jsx_runtime_1.jsx)(Header_1.default, {}), (0, jsx_runtime_1.jsx)(Sidebar_1.default, { open: sidebarOpen, onToggle: handleSidebarToggle }), (0, jsx_runtime_1.jsxs)(material_1.Box, { component: "main", sx: {
                    flexGrow: 1,
                    p: 3,
                    marginLeft: isMobile ? 0 : `${drawerWidth}px`,
                    marginTop: '64px', // 固定頂部欄高度
                    backgroundColor: '#f5f5f5',
                    minHeight: 'calc(100vh - 64px)',
                    overflow: 'auto',
                    position: 'relative',
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }, children: [isMobile && ((0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "inherit", "aria-label": "open drawer", edge: "start", onClick: handleSidebarToggle, sx: {
                            mr: 2,
                            mb: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            },
                        }, children: (0, jsx_runtime_1.jsx)(icons_material_1.Menu, {}) })), children] })] }));
};
exports.default = Layout;
