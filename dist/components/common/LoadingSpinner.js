"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const LoadingSpinner = ({ message = '載入中...' }) => {
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4
        }, children: [(0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 40 }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", sx: { mt: 2 }, children: message })] }));
};
exports.default = LoadingSpinner;
