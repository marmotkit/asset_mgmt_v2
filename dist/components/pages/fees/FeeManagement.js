"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const FeeSettings_1 = __importDefault(require("./FeeSettings"));
const FeePaymentStatus_1 = __importDefault(require("./FeePaymentStatus"));
const FeeHistory_1 = __importDefault(require("./FeeHistory"));
const InvoiceManagement_1 = require("./InvoiceManagement");
const FeeReport_1 = require("./FeeReport");
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `fee-tabpanel-${index}`, "aria-labelledby": `fee-tab-${index}`, ...other, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 3 }, children: children })) }));
}
const FeeManagement = () => {
    const [currentTab, setCurrentTab] = (0, react_1.useState)(0);
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { width: '100%' }, children: [(0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 2, sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", sx: { p: 2 }, children: "\u6703\u8CBB\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: currentTab, onChange: handleTabChange, "aria-label": "\u6703\u8CBB\u7BA1\u7406\u529F\u80FD\u9801\u7C64", sx: { borderBottom: 1, borderColor: 'divider' }, children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6703\u8CBB\u6A19\u6E96\u8A2D\u5B9A" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6536\u6B3E\u72C0\u6CC1" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6B77\u53F2\u8A18\u9304" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u767C\u7968\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6703\u8CBB\u5831\u8868" })] })] }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 0, children: (0, jsx_runtime_1.jsx)(FeeSettings_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 1, children: (0, jsx_runtime_1.jsx)(FeePaymentStatus_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 2, children: (0, jsx_runtime_1.jsx)(FeeHistory_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 3, children: (0, jsx_runtime_1.jsx)(InvoiceManagement_1.InvoiceManagement, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 4, children: (0, jsx_runtime_1.jsx)(FeeReport_1.FeeReport, {}) })] }));
};
exports.default = FeeManagement;
