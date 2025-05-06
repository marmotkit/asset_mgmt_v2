"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const ContractUpload = ({ contract, onUpload, onDelete, }) => {
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const handleFileSelect = async (event) => {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        try {
            setUploading(true);
            await onUpload(file);
        }
        catch (error) {
            console.error('上傳失敗:', error);
        }
        finally {
            setUploading(false);
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", sx: { mb: 1 }, children: "\u5408\u7D04\u6A94\u6848" }), contract ? ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.Description, { color: "primary" }), (0, jsx_runtime_1.jsx)(material_1.Link, { href: contract.url, target: "_blank", sx: { flexGrow: 1 }, children: contract.fileName }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "caption", color: "textSecondary", children: ["(", formatFileSize(contract.fileSize), ")"] }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: onDelete, children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })) : ((0, jsx_runtime_1.jsxs)(material_1.Button, { component: "label", variant: "outlined", startIcon: uploading ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : (0, jsx_runtime_1.jsx)(icons_material_1.Upload, {}), disabled: uploading, children: [uploading ? '上傳中...' : '上傳合約', (0, jsx_runtime_1.jsx)("input", { type: "file", hidden: true, accept: ".pdf,.doc,.docx", onChange: handleFileSelect })] }))] }));
};
exports.default = ContractUpload;
