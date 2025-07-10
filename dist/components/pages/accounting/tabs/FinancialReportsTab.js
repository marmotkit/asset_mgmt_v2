"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const LocalizationProvider_1 = require("@mui/x-date-pickers/LocalizationProvider");
const AdapterDayjs_1 = require("@mui/x-date-pickers/AdapterDayjs");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const dayjs_1 = __importDefault(require("dayjs"));
const accounting_service_1 = require("../../../../services/accounting.service");
// 導入報表組件
const IncomeExpenseReport_1 = __importDefault(require("./reports/IncomeExpenseReport"));
const BalanceSheetReport_1 = __importDefault(require("./reports/BalanceSheetReport"));
const CashFlowReport_1 = __importDefault(require("./reports/CashFlowReport"));
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `report-tabpanel-${index}`, "aria-labelledby": `report-tab-${index}`, ...other, style: { paddingTop: '1rem' }, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { children: children })) }));
}
const FinancialReportsTab = () => {
    // 狀態變數
    const [reportType, setReportType] = (0, react_1.useState)(0);
    const [year, setYear] = (0, react_1.useState)((0, dayjs_1.default)().year());
    const [month, setMonth] = (0, react_1.useState)((0, dayjs_1.default)().month() + 1);
    const [date, setDate] = (0, react_1.useState)((0, dayjs_1.default)());
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [reportData, setReportData] = (0, react_1.useState)(null);
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'success'
    });
    // 獲取當前年份和可選年份範圍
    const currentYear = (0, dayjs_1.default)().year();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    // 處理報表類型切換
    const handleReportTypeChange = (event, newValue) => {
        setReportType(newValue);
        setReportData(null);
    };
    // 載入報表數據
    const loadReportData = async () => {
        setLoading(true);
        try {
            let data;
            switch (reportType) {
                case 0: // 收支報表
                    data = await accounting_service_1.accountingService.getFinancialReport({ year, month: month || undefined });
                    break;
                case 1: // 資產負債表
                    data = await accounting_service_1.accountingService.getBalanceSheet({ date: date.format('YYYY-MM-DD') });
                    break;
                case 2: // 現金流量表
                    data = await accounting_service_1.accountingService.getCashFlowStatement({ year, month: month || undefined });
                    break;
                default:
                    data = null;
            }
            setReportData(data);
        }
        catch (error) {
            console.error('載入報表數據失敗:', error);
            setSnackbar({
                open: true,
                message: '載入報表數據失敗',
                severity: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    // 當選擇參數變化時，重新載入報表
    (0, react_1.useEffect)(() => {
        if (reportType !== null) {
            loadReportData();
        }
    }, [reportType, year, month, date]);
    // 渲染報表篩選條件
    const renderReportFilters = () => {
        return ((0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { p: 2, mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", children: [reportType === 0 || reportType === 2 ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: year, label: "\u5E74\u5EA6", onChange: (e) => setYear(Number(e.target.value)), children: yearOptions.map(y => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: y, children: y }, y))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6708\u4EFD" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: month || '', label: "\u6708\u4EFD", onChange: (e) => {
                                                const value = e.target.value;
                                                setMonth(value === '' ? null : Number(value));
                                            }, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u5E74" }), Array.from({ length: 12 }, (_, i) => i + 1).map(m => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: m, children: [m, "\u6708"] }, m)))] })] }) })] })) : reportType === 1 ? ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(LocalizationProvider_1.LocalizationProvider, { dateAdapter: AdapterDayjs_1.AdapterDayjs, children: (0, jsx_runtime_1.jsx)(DatePicker_1.DatePicker, { label: "\u8CC7\u7522\u8CA0\u50B5\u8868\u65E5\u671F", value: date, onChange: (newDate) => {
                                    if (newDate) {
                                        setDate(newDate);
                                    }
                                }, format: "YYYY/MM/DD", slotProps: {
                                    textField: {
                                        fullWidth: true
                                    }
                                } }) }) })) : null, (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 3, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Download, {}), disabled: !reportData, onClick: () => { }, fullWidth: true, children: "\u532F\u51FA\u5831\u8868" }) })] }) }));
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 3 }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", children: "\u8CA1\u52D9\u5831\u8868" }) }), (0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: reportType, onChange: handleReportTypeChange, variant: "scrollable", scrollButtons: "auto", "aria-label": "financial reports tabs", children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.BarChart, {}), label: "\u6536\u652F\u5831\u8868" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.AccountBalance, {}), label: "\u8CC7\u7522\u8CA0\u50B5\u8868" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { icon: (0, jsx_runtime_1.jsx)(icons_material_1.TrendingUp, {}), label: "\u73FE\u91D1\u6D41\u91CF\u8868" })] }) }), renderReportFilters(), loading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', justifyContent: 'center', mt: 5, mb: 5 }, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(TabPanel, { value: reportType, index: 0, children: reportData && (0, jsx_runtime_1.jsx)(IncomeExpenseReport_1.default, { data: reportData }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: reportType, index: 1, children: reportData && (0, jsx_runtime_1.jsx)(BalanceSheetReport_1.default, { data: reportData }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: reportType, index: 2, children: reportData && (0, jsx_runtime_1.jsx)(CashFlowReport_1.default, { data: reportData }) })] })), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 5000, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), children: (0, jsx_runtime_1.jsx)(material_1.Alert, { severity: snackbar.severity, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), children: snackbar.message }) })] }));
};
exports.default = FinancialReportsTab;
