"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const UserActivityLog = ({ userId }) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [activities, setActivities] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        loadActivities();
    }, [userId]);
    const loadActivities = async () => {
        setLoading(true);
        try {
            // TODO: 實作取得活動記錄的 API
            const response = await fetch(`/api/users/${userId}/activities`);
            const data = await response.json();
            setActivities(data);
        }
        catch (error) {
            console.error('Failed to load activities:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getActivityIcon = (type) => {
        switch (type) {
            case 'login':
                return (0, jsx_runtime_1.jsx)(icons_material_1.Login, { color: "primary" });
            case 'logout':
                return (0, jsx_runtime_1.jsx)(icons_material_1.Logout, { color: "error" });
            case 'profile_update':
                return (0, jsx_runtime_1.jsx)(icons_material_1.Edit, { color: "info" });
            case 'preference_update':
                return (0, jsx_runtime_1.jsx)(icons_material_1.Settings, { color: "warning" });
        }
    };
    const getActivityLabel = (type) => {
        switch (type) {
            case 'login':
                return '登入';
            case 'logout':
                return '登出';
            case 'profile_update':
                return '更新資料';
            case 'preference_update':
                return '更新偏好';
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', p: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6D3B\u52D5\u8A18\u9304" }), (0, jsx_runtime_1.jsx)(material_1.List, { children: activities.map((activity, index) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsxs)(material_1.ListItem, { children: [(0, jsx_runtime_1.jsx)(material_1.ListItemIcon, { children: getActivityIcon(activity.type) }), (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: activity.description, secondary: new Date(activity.timestamp).toLocaleString('zh-TW') }), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getActivityLabel(activity.type), size: "small", variant: "outlined" })] }), index < activities.length - 1 && (0, jsx_runtime_1.jsx)(material_1.Divider, {})] }, activity.id))) })] }));
};
exports.default = UserActivityLog;
