"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const AnnualActivitiesTab_1 = __importDefault(require("./AnnualActivitiesTab"));
const MemberCareTab_1 = __importDefault(require("./MemberCareTab"));
const RiskManagementTab_1 = __importDefault(require("./RiskManagementTab"));
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `services-tabpanel-${index}`, "aria-labelledby": `services-tab-${index}`, ...other, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 3 }, children: children })) }));
}
const MemberServicesManagement = ({ initialTab = 0 }) => {
    const [currentTab, setCurrentTab] = (0, react_1.useState)(initialTab);
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { width: '100%' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", component: "h1", gutterBottom: true, children: "\u6703\u54E1\u670D\u52D9\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { width: '100%', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { borderBottom: 1, borderColor: 'divider' }, children: (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: currentTab, onChange: handleTabChange, "aria-label": "\u6703\u54E1\u670D\u52D9\u7BA1\u7406\u6A19\u7C64", children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u5E74\u5EA6\u6D3B\u52D5" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6703\u54E1\u95DC\u61F7" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u98A8\u96AA\u7BA1\u7406" })] }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 0, children: (0, jsx_runtime_1.jsx)(AnnualActivitiesTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 1, children: (0, jsx_runtime_1.jsx)(MemberCareTab_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 2, children: (0, jsx_runtime_1.jsx)(RiskManagementTab_1.default, {}) })] })] }));
};
exports.default = MemberServicesManagement;
