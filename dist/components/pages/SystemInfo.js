"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const AuthContext_1 = require("../../contexts/AuthContext");
const SystemInfo = () => {
    const { user } = (0, AuthContext_1.useAuth)();
    const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'admin';
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [editData, setEditData] = (0, react_1.useState)(null);
    const [openDialog, setOpenDialog] = (0, react_1.useState)(false);
    const [snackbar, setSnackbar] = (0, react_1.useState)({ open: false, message: '', severity: 'success' });
    // 預設系統資訊
    const defaultSystemInfo = {
        title: '資產管理系統',
        description: '這是一個專業的資產管理系統，專為組織和企業設計，提供完整的會員管理、財務管理、投資管理和服務管理功能。系統採用現代化設計，操作簡便，功能強大。',
        features: [
            '完整的會員管理體系',
            '專業的財務會計功能',
            '智能的投資管理平台',
            '全面的風險控制機制',
            '現代化的使用者介面',
            '多層級的權限管理',
            '豐富的報表分析功能',
            '即時的通知提醒系統'
        ],
        highlights: [
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Palette, { sx: { fontSize: 40, color: '#1976d2' } }),
                title: '現代化介面',
                description: '響應式設計，支援桌面和行動裝置，直觀的操作介面，降低學習成本'
            },
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Security, { sx: { fontSize: 40, color: '#2e7d32' } }),
                title: '安全性保障',
                description: '多層級權限控制，完整的操作記錄，資料備份和恢復機制'
            },
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Analytics, { sx: { fontSize: 40, color: '#ed6c02' } }),
                title: '數據分析',
                description: '豐富的統計報表和圖表，多維度的數據分析功能，支援多種格式匯出'
            },
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Speed, { sx: { fontSize: 40, color: '#9c27b0' } }),
                title: '高效能',
                description: '快速的資料查詢和處理，智能的快取機制，優化的資料庫結構'
            }
        ],
        modules: [
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.People, { sx: { fontSize: 30, color: '#1976d2' } }),
                title: '會員管理',
                description: '完整的會員資訊維護，包含基本資料、聯絡資訊、會員類型',
                features: ['會員資料管理', '會員狀態追蹤', '會員類型設定']
            },
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Payment, { sx: { fontSize: 30, color: '#2e7d32' } }),
                title: '會費管理',
                description: '彈性的會費標準配置，支援不同會員類型的差異化收費',
                features: ['會費標準設定', '會費收取記錄', '發票收據管理', '匯出功能']
            },
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Business, { sx: { fontSize: 30, color: '#ed6c02' } }),
                title: '公司管理',
                description: '完整的公司資訊維護，包含基本資料、聯絡資訊',
                features: ['公司資料管理', '公司類型分類', '公司關聯管理']
            },
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.AccountBalance, { sx: { fontSize: 30, color: '#9c27b0' } }),
                title: '投資管理',
                description: '完整的投資項目生命週期管理',
                features: ['投資項目管理', '租金管理', '利潤分配', '風險評估']
            },
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Payment, { sx: { fontSize: 30, color: '#d32f2f' } }),
                title: '會計管理',
                description: '完整的會計科目體系，支援樹狀結構和分類管理',
                features: ['會計科目管理', '日記帳管理', '財務報表', '月結管理']
            },
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Dashboard, { sx: { fontSize: 30, color: '#1976d2' } }),
                title: '投資看板',
                description: '專業的投資標的展示平台，支援圖片和詳細資訊',
                features: ['投資標的展示', '前台洽詢', '後台管理', '圖片管理']
            },
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Support, { sx: { fontSize: 30, color: '#2e7d32' } }),
                title: '會員服務',
                description: '完整的活動規劃、報名、統計管理',
                features: ['年度活動管理', '活動報名管理', '會員關懷記錄', '風險管理']
            },
            {
                icon: (0, jsx_runtime_1.jsx)(icons_material_1.Notifications, { sx: { fontSize: 30, color: '#ed6c02' } }),
                title: '通知提醒',
                description: '重要事件和狀態變更的即時通知',
                features: ['系統通知', '逾期提醒', '活動通知', '系統公告']
            }
        ]
    };
    const [systemInfo, setSystemInfo] = (0, react_1.useState)(defaultSystemInfo);
    (0, react_1.useEffect)(() => {
        // 從 localStorage 讀取自定義系統資訊
        const savedInfo = localStorage.getItem('system_info');
        if (savedInfo) {
            try {
                setSystemInfo(JSON.parse(savedInfo));
            }
            catch (error) {
                console.error('Failed to parse saved system info:', error);
            }
        }
    }, []);
    const handleEdit = () => {
        setEditData(JSON.parse(JSON.stringify(systemInfo)));
        setOpenDialog(true);
    };
    const handleSave = () => {
        if (editData) {
            setSystemInfo(editData);
            localStorage.setItem('system_info', JSON.stringify(editData));
            setSnackbar({ open: true, message: '系統說明已更新', severity: 'success' });
        }
        setOpenDialog(false);
        setEditData(null);
    };
    const handleCancel = () => {
        setOpenDialog(false);
        setEditData(null);
    };
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { p: 3, maxWidth: 1200, mx: 'auto' }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 4, textAlign: 'center', position: 'relative' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h3", component: "h1", gutterBottom: true, sx: {
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 2
                        }, children: systemInfo.title }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", color: "text.secondary", sx: { mb: 3, maxWidth: 800, mx: 'auto' }, children: systemInfo.description }), isAdmin && ((0, jsx_runtime_1.jsx)(material_1.Fab, { color: "primary", size: "small", onClick: handleEdit, sx: { position: 'absolute', top: 0, right: 0 }, children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }))] }), (0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", gutterBottom: true, sx: { fontWeight: 'bold', mb: 3 }, children: "\uD83D\uDE80 \u7CFB\u7D71\u7279\u8272" }), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 3, children: systemInfo.highlights.map((highlight, index) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { textAlign: 'center', p: 2 }, children: [highlight.icon, (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { mt: 1, mb: 1, fontWeight: 'bold' }, children: highlight.title }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: highlight.description })] }) }, index))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", gutterBottom: true, sx: { fontWeight: 'bold', mb: 3 }, children: "\uD83D\uDCCB \u4E3B\u8981\u529F\u80FD\u6A21\u7D44" }), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 3, children: systemInfo.modules.map((module, index) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Card, { sx: {
                            height: '100%',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                            }
                        }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', mb: 2 }, children: [module.icon, (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { ml: 2, fontWeight: 'bold' }, children: module.title })] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: module.description }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 0.5 }, children: module.features.map((feature, featureIndex) => ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: feature, size: "small", variant: "outlined", sx: { fontSize: '0.75rem' } }, featureIndex))) })] }) }) }, index))) }), (0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mt: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", gutterBottom: true, sx: { fontWeight: 'bold', mb: 3 }, children: "\u2B50 \u6838\u5FC3\u529F\u80FD" }), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 2, children: systemInfo.features.map((feature, index) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, md: 4, children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.CheckCircle, { sx: { mr: 1, color: '#4caf50' } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: feature })] }) }, index))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mt: 4, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", gutterBottom: true, sx: { fontWeight: 'bold', mb: 3 }, children: "\uD83C\uDFAF \u9069\u7528\u5C0D\u8C61" }), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 2, children: [
                                '投資管理公司',
                                '會員制組織',
                                '資產管理機構',
                                '財務管理部門',
                                '企業管理團隊'
                            ].map((target, index) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, md: 4, children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Info, { sx: { mr: 1, color: '#fff' } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", children: target })] }) }, index))) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: openDialog, onClose: handleCancel, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Edit, { sx: { mr: 1 } }), "\u7DE8\u8F2F\u7CFB\u7D71\u8AAA\u660E"] }) }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: editData && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { pt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7CFB\u7D71\u6A19\u984C", value: editData.title, onChange: (e) => setEditData({ ...editData, title: e.target.value }), sx: { mb: 3 } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7CFB\u7D71\u63CF\u8FF0", value: editData.description, onChange: (e) => setEditData({ ...editData, description: e.target.value }), multiline: true, rows: 3, sx: { mb: 3 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6838\u5FC3\u529F\u80FD" }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6838\u5FC3\u529F\u80FD\uFF08\u7528\u9017\u865F\u5206\u9694\uFF09", value: editData.features.join(', '), onChange: (e) => setEditData({
                                        ...editData,
                                        features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                                    }), multiline: true, rows: 3, sx: { mb: 3 }, helperText: "\u8ACB\u7528\u9017\u865F\u5206\u9694\u6BCF\u500B\u529F\u80FD\u9805\u76EE" })] })) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCancel, startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Cancel, {}), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Save, {}), children: "\u5132\u5B58" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 3000, onClose: handleCloseSnackbar, anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, children: (0, jsx_runtime_1.jsx)(material_1.Alert, { onClose: handleCloseSnackbar, severity: snackbar.severity, children: snackbar.message }) })] }));
};
exports.default = SystemInfo;
