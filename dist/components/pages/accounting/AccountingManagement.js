"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const JournalTab_1 = __importDefault(require("./tabs/JournalTab"));
const ReceivablesTab_1 = __importDefault(require("./tabs/ReceivablesTab"));
const PayablesTab_1 = __importDefault(require("./tabs/PayablesTab"));
const MonthlyClosingTab_1 = __importDefault(require("./tabs/MonthlyClosingTab"));
const FinancialReportsTab_1 = __importDefault(require("./tabs/FinancialReportsTab"));
const AccountingIntegrationTab_1 = __importDefault(require("./tabs/AccountingIntegrationTab"));
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `accounting-tabpanel-${index}`, "aria-labelledby": `accounting-tab-${index}`, ...other, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 3 }, children: children })) }));
}
function a11yProps(index) {
    return {
        id: `accounting-tab-${index}`,
        'aria-controls': `accounting-tabpanel-${index}`,
    };
}
const AccountingManagement = () => {
    const [value, setValue] = (0, react_1.useState)(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { width: '100%' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", gutterBottom: true, children: "\u5E33\u52D9\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { borderBottom: 1, borderColor: 'divider' }, children: (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: value, onChange: handleChange, "aria-label": "\u5E33\u52D9\u7BA1\u7406\u529F\u80FD", children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u65E5\u8A18\u5E33", ...a11yProps(0) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u61C9\u6536\u5E33\u6B3E", ...a11yProps(1) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u61C9\u4ED8\u5E33\u6B3E", ...a11yProps(2) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6708\u7D50", ...a11yProps(3) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u8CA1\u52D9\u5831\u8868", ...a11yProps(4) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u8CC7\u6599\u6574\u5408", ...a11yProps(5) })] }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: value, index: 0, children: (0, jsx_runtime_1.jsx)(JournalTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: value, index: 1, children: (0, jsx_runtime_1.jsx)(ReceivablesTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: value, index: 2, children: (0, jsx_runtime_1.jsx)(PayablesTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: value, index: 3, children: (0, jsx_runtime_1.jsx)(MonthlyClosingTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: value, index: 4, children: (0, jsx_runtime_1.jsx)(FinancialReportsTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: value, index: 5, children: (0, jsx_runtime_1.jsx)(AccountingIntegrationTab_1.default, {}) })] }));
};
exports.default = AccountingManagement;
