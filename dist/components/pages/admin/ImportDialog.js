"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const importUtils_1 = require("../../../utils/importUtils");
const ImportDialog = ({ open, onClose, onImport, }) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [errors, setErrors] = (0, react_1.useState)([]);
    const [preview, setPreview] = (0, react_1.useState)([]);
    const handleFileUpload = async (event) => {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        setLoading(true);
        setErrors([]);
        setPreview([]);
        try {
            const result = file.name.endsWith('.csv')
                ? await (0, importUtils_1.parseCsvFile)(file)
                : await (0, importUtils_1.parseExcelFile)(file);
            if (!result.success || !result.data) {
                setErrors(result.errors || ['檔案解析失敗']);
                return;
            }
            setPreview(result.data);
        }
        catch (error) {
            setErrors(['檔案處理過程發生錯誤']);
        }
        finally {
            setLoading(false);
        }
    };
    const handleImport = async () => {
        if (preview.length === 0)
            return;
        setLoading(true);
        try {
            await onImport(preview);
            onClose();
        }
        catch (error) {
            setErrors(['匯入過程發生錯誤']);
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onClose, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u532F\u5165\u6703\u54E1\u8CC7\u6599" }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", gutterBottom: true, children: "\u8ACB\u9078\u64C7 Excel (.xlsx) \u6216 CSV \u6A94\u6848\u9032\u884C\u532F\u5165\u3002\u6A94\u6848\u5FC5\u9808\u5305\u542B\u4EE5\u4E0B\u6B04\u4F4D\uFF1A" }), (0, jsx_runtime_1.jsxs)(material_1.List, { dense: true, children: [(0, jsx_runtime_1.jsx)(material_1.ListItem, { children: (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u5FC5\u586B\u6B04\u4F4D\uFF1A\u5E33\u865F\u3001\u96FB\u5B50\u90F5\u4EF6" }) }), (0, jsx_runtime_1.jsx)(material_1.ListItem, { children: (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: "\u9078\u586B\u6B04\u4F4D\uFF1A\u59D3\u540D\u3001\u96FB\u8A71\u3001\u6703\u54E1\u7B49\u7D1A\u3001\u72C0\u614B" }) })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)("input", { accept: ".xlsx,.csv", style: { display: 'none' }, id: "file-upload", type: "file", onChange: handleFileUpload }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "file-upload", children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", component: "span", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.CloudUpload, {}), disabled: loading, children: "\u9078\u64C7\u6A94\u6848" }) })] }), loading && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', my: 2 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })), errors.length > 0 && ((0, jsx_runtime_1.jsxs)(material_1.Alert, { severity: "error", sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", children: "\u767C\u73FE\u4EE5\u4E0B\u932F\u8AA4\uFF1A" }), (0, jsx_runtime_1.jsx)(material_1.List, { dense: true, children: errors.map((error, index) => ((0, jsx_runtime_1.jsx)(material_1.ListItem, { children: (0, jsx_runtime_1.jsx)(material_1.ListItemText, { primary: error }) }, index))) })] })), preview.length > 0 && ((0, jsx_runtime_1.jsxs)(material_1.Alert, { severity: "success", sx: { mb: 2 }, children: ["\u5DF2\u6210\u529F\u89E3\u6790 ", preview.length, " \u7B46\u8CC7\u6599\uFF0C\u8ACB\u9EDE\u64CA\u300C\u532F\u5165\u300D\u6309\u9215\u958B\u59CB\u532F\u5165\u3002"] }))] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onClose, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleImport, variant: "contained", disabled: loading || preview.length === 0, children: "\u532F\u5165" })] })] }));
};
exports.default = ImportDialog;
