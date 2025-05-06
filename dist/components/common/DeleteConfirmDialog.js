"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const DeleteConfirmDialog = ({ open, title, content, onConfirm, onCancel, }) => {
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onCancel, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: title }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.DialogContentText, { children: content }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onCancel, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onConfirm, color: "error", variant: "contained", children: "\u522A\u9664" })] })] }));
};
exports.default = DeleteConfirmDialog;
