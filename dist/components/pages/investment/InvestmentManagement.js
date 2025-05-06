"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const api_service_1 = require("../../../services/api.service");
const InvestmentListTab_1 = __importDefault(require("./InvestmentListTab"));
const RentalAndProfitManagement_1 = __importDefault(require("./RentalAndProfitManagement"));
const HistoryTab_1 = __importDefault(require("./HistoryTab"));
const InvoiceTab_1 = __importDefault(require("./InvoiceTab"));
const ReportTab_1 = __importDefault(require("./ReportTab"));
const InvestmentDetailDialog_1 = __importDefault(require("./InvestmentDetailDialog"));
const icons_material_1 = require("@mui/icons-material");
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `investment-tabpanel-${index}`, "aria-labelledby": `investment-tab-${index}`, ...other, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 3 }, children: children })) }));
}
const InvestmentManagement = () => {
    const [currentTab, setCurrentTab] = (0, react_1.useState)(0);
    const [investments, setInvestments] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const [selectedInvestment, setSelectedInvestment] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        loadInvestments();
    }, []);
    const loadInvestments = async () => {
        try {
            setLoading(true);
            const data = await api_service_1.ApiService.getInvestments();
            setInvestments(data);
        }
        catch (err) {
            setError('載入投資資料失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };
    const handleAddClick = () => {
        setSelectedInvestment(undefined);
        setIsDialogOpen(true);
    };
    const handleSave = async (formData) => {
        try {
            if (selectedInvestment) {
                if (formData.type === 'movable') {
                    await api_service_1.ApiService.updateInvestment({
                        ...selectedInvestment,
                        ...formData,
                    });
                }
                else {
                    await api_service_1.ApiService.updateInvestment({
                        ...selectedInvestment,
                        ...formData,
                    });
                }
            }
            else {
                await api_service_1.ApiService.createInvestment(formData);
            }
            await loadInvestments();
            setIsDialogOpen(false);
        }
        catch (err) {
            console.error('儲存投資項目失敗:', err);
            setError('儲存投資項目失敗');
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    if (error) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { m: 2, children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", children: error }) }));
    }
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { width: '100%' }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u6295\u8CC7\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: handleAddClick, children: "\u65B0\u589E\u6295\u8CC7" })] }), (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { width: '100%', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { borderBottom: 1, borderColor: 'divider' }, children: (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: currentTab, onChange: handleTabChange, "aria-label": "\u6295\u8CC7\u7BA1\u7406\u6A19\u7C64", children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u79DF\u8CC3/\u5206\u6F64" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6B77\u53F2\u8A18\u9304" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u767C\u7968\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6295\u8CC7\u5831\u8868" })] }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 0, children: (0, jsx_runtime_1.jsx)(InvestmentListTab_1.default, { investments: investments, onEdit: (investment) => {
                                setSelectedInvestment(investment);
                                setIsDialogOpen(true);
                            }, onRefresh: loadInvestments }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 1, children: (0, jsx_runtime_1.jsx)(RentalAndProfitManagement_1.default, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 2, children: (0, jsx_runtime_1.jsx)(HistoryTab_1.default, { investments: investments }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 3, children: (0, jsx_runtime_1.jsx)(InvoiceTab_1.default, { investments: investments }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 4, children: (0, jsx_runtime_1.jsx)(ReportTab_1.default, { investments: investments }) })] }), (0, jsx_runtime_1.jsx)(InvestmentDetailDialog_1.default, { open: isDialogOpen, investment: selectedInvestment, onClose: () => setIsDialogOpen(false), onSave: handleSave })] }));
};
exports.default = InvestmentManagement;
