"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const RentalStandardTab_1 = __importDefault(require("./RentalStandardTab"));
const ProfitSharingStandardTab_1 = __importDefault(require("./ProfitSharingStandardTab"));
const RentalPaymentTab_1 = __importDefault(require("./RentalPaymentTab"));
const MemberProfitTab_1 = __importDefault(require("./MemberProfitTab"));
const ReportTab_1 = __importDefault(require("./ReportTab"));
const services_1 = require("../../../services");
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `rental-tabpanel-${index}`, "aria-labelledby": `rental-tab-${index}`, ...other, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 3 }, children: children })) }));
}
const RentalAndProfitManagement = () => {
    const [currentTab, setCurrentTab] = (0, react_1.useState)(0);
    const [investments, setInvestments] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        loadInvestments();
    }, []);
    const loadInvestments = async () => {
        try {
            const data = await services_1.ApiService.getInvestments();
            setInvestments(data);
        }
        catch (error) {
            console.error('載入投資項目失敗:', error);
        }
    };
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { width: '100%' }, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { width: '100%', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { borderBottom: 1, borderColor: 'divider' }, children: (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: currentTab, onChange: handleTabChange, "aria-label": "\u79DF\u8CC3\u8207\u5206\u6F64\u7BA1\u7406\u6A19\u7C64", children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u79DF\u8CC3\u6A19\u6E96\u8A2D\u5B9A" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u5206\u6F64\u6A19\u6E96\u8A2D\u5B9A" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u79DF\u91D1\u6536\u6B3E\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6703\u54E1\u5206\u6F64\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u7D71\u8A08\u5831\u8868" })] }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 0, children: (0, jsx_runtime_1.jsx)(RentalStandardTab_1.default, { investments: investments }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 1, children: (0, jsx_runtime_1.jsx)(ProfitSharingStandardTab_1.default, { investments: investments }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 2, children: (0, jsx_runtime_1.jsx)(RentalPaymentTab_1.default, { investments: investments }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 3, children: (0, jsx_runtime_1.jsx)(MemberProfitTab_1.default, { investments: investments }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 4, children: (0, jsx_runtime_1.jsx)(ReportTab_1.default, { investments: investments }) })] }) }));
};
exports.default = RentalAndProfitManagement;
