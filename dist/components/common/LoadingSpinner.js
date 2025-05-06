"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const LoadingSpinner = () => {
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', p: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
};
exports.default = LoadingSpinner;
