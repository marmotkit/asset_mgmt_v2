"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const Login = () => {
    return ((0, jsx_runtime_1.jsx)(material_1.Container, { component: "main", maxWidth: "xs", children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 3, sx: {
                    padding: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { component: "h1", variant: "h5", children: "\u767B\u5165" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { component: "form", sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "normal", required: true, fullWidth: true, id: "username", label: "\u4F7F\u7528\u8005\u540D\u7A31", name: "username", autoComplete: "username", autoFocus: true }), (0, jsx_runtime_1.jsx)(material_1.TextField, { margin: "normal", required: true, fullWidth: true, name: "password", label: "\u5BC6\u78BC", type: "password", id: "password", autoComplete: "current-password" }), (0, jsx_runtime_1.jsx)(material_1.Button, { type: "submit", fullWidth: true, variant: "contained", sx: { mt: 3, mb: 2 }, children: "\u767B\u5165" })] })] }) }) }));
};
exports.default = Login;
