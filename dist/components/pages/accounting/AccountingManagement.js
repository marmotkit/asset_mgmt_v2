"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const JournalTab_1 = __importDefault(require("./tabs/JournalTab"));
const ReceivablesTab_1 = __importDefault(require("./tabs/ReceivablesTab"));
const PayablesTab_1 = __importDefault(require("./tabs/PayablesTab"));
const MonthlyClosingTab_1 = __importDefault(require("./tabs/MonthlyClosingTab"));
const FinancialReportsTab_1 = __importDefault(require("./tabs/FinancialReportsTab"));
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `accounting-tabpanel-${index}`, "aria-labelledby": `accounting-tab-${index}`, ...other, style: { paddingTop: '1rem' }, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { children: children })) }));
}
function a11yProps(index) {
    return {
        id: `accounting-tab-${index}`,
        'aria-controls': `accounting-tabpanel-${index}`,
    };
}
const AccountingManagement = () => {
    const theme = (0, material_1.useTheme)();
    const [tabValue, setTabValue] = (0, react_1.useState)(0);
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Container, { maxWidth: "xl", children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { mb: 4, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", component: "h1", gutterBottom: true, children: "\u5E33\u52D9\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", gutterBottom: true, children: "\u7BA1\u7406\u8CA1\u52D9\u8A18\u9304\u3001\u61C9\u6536\u61C9\u4ED8\u5E33\u6B3E\u53CA\u67E5\u770B\u8CA1\u52D9\u5831\u8868" })] }), (0, jsx_runtime_1.jsxs)(material_1.Paper, { elevation: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                            borderBottom: 1,
                            borderColor: 'divider',
                            bgcolor: theme.palette.background.paper
                        }, children: (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: tabValue, onChange: handleTabChange, variant: "scrollable", scrollButtons: "auto", "aria-label": "accounting management tabs", children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.Book, {}), label: "\u65E5\u8A18\u5E33", ...a11yProps(0) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.MonetizationOn, {}), label: "\u61C9\u6536\u5E33\u6B3E", ...a11yProps(1) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.PriceCheck, {}), label: "\u61C9\u4ED8\u5E33\u6B3E", ...a11yProps(2) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.EventNote, {}), label: "\u6708\u7D50", ...a11yProps(3) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.Assessment, {}), label: "\u8CA1\u52D9\u5831\u8868", ...a11yProps(4) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { p: 2 }, children: [(0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 0, children: (0, jsx_runtime_1.jsx)(JournalTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 1, children: (0, jsx_runtime_1.jsx)(ReceivablesTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 2, children: (0, jsx_runtime_1.jsx)(PayablesTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 3, children: (0, jsx_runtime_1.jsx)(MonthlyClosingTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 4, children: (0, jsx_runtime_1.jsx)(FinancialReportsTab_1.default, {}) })] })] })] }));
};
exports.default = AccountingManagement;
