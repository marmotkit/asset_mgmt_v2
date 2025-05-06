"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const ErrorAlert = ({ message }) => {
    return ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { m: 2 }, children: message }));
};
exports.default = ErrorAlert;
