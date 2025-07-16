"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const dayjs_1 = __importDefault(require("dayjs"));
const accountingApi_service_1 = require("../../../../services/accountingApi.service");
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `business-receivables-tabpanel-${index}`, "aria-labelledby": `business-receivables-tab-${index}`, ...other, children: value === index && (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { py: 3 }, children: children }) }));
}
function a11yProps(index) {
    return {
        id: `business-receivables-tab-${index}`,
        'aria-controls': `business-receivables-tabpanel-${index}`,
    };
}
const BusinessReceivablesTab = () => {
    const [tabValue, setTabValue] = (0, react_1.useState)(0);
    const [receivables, setReceivables] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [filterStatus, setFilterStatus] = (0, react_1.useState)('all');
    (0, react_1.useEffect)(() => {
        loadReceivables();
    }, []);
    const loadReceivables = async () => {
        setLoading(true);
        try {
            const data = await accountingApi_service_1.receivablesApiService.getReceivables();
            setReceivables(data);
        }
        catch (error) {
            console.error('獲取應收帳款失敗:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };
    const getBusinessType = (description) => {
        if (description.includes('會費'))
            return '會費';
        if (description.includes('租金'))
            return '租金';
        return '其他';
    };
    const getStatusChip = (status) => {
        const statusConfig = {
            pending: { label: '待付款', color: 'warning' },
            partially_paid: { label: '部分付款', color: 'info' },
            paid: { label: '已付款', color: 'success' },
            overdue: { label: '逾期', color: 'error' }
        };
        const config = statusConfig[status] || { label: status, color: 'default' };
        return (0, jsx_runtime_1.jsx)(material_1.Chip, { label: config.label, color: config.color, size: "small" });
    };
    const filterReceivables = (type) => {
        return receivables.filter(receivable => {
            // 業務類型過濾
            if (type !== 'all') {
                const description = receivable.description || '';
                if (type === 'membership' && !description.includes('會費')) {
                    return false;
                }
                if (type === 'rental' && !description.includes('租金')) {
                    return false;
                }
            }
            // 狀態過濾
            if (filterStatus !== 'all' && receivable.status !== filterStatus) {
                return false;
            }
            // 搜尋條件過濾
            const searchLower = (searchTerm || '').toLowerCase();
            return ((receivable.customer_name && receivable.customer_name.toLowerCase().includes(searchLower)) ||
                (receivable.description && receivable.description.toLowerCase().includes(searchLower)) ||
                (receivable.invoice_number && receivable.invoice_number.toLowerCase().includes(searchLower)));
        });
    };
    const getFilteredReceivables = () => {
        switch (tabValue) {
            case 0: return filterReceivables('membership');
            case 1: return filterReceivables('rental');
            default: return filterReceivables('all');
        }
    };
    const filteredReceivables = getFilteredReceivables();
    const getTabTitle = () => {
        switch (tabValue) {
            case 0: return '會費應收帳款';
            case 1: return '租金應收帳款';
            default: return '其他應收帳款';
        }
    };
    const getTotalAmount = () => {
        return filteredReceivables.reduce((sum, item) => sum + ((item.amount || 0) - (item.payment_amount || 0)), 0);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", gutterBottom: true, children: getTabTitle() }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { borderBottom: 1, borderColor: 'divider', mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: tabValue, onChange: handleTabChange, "aria-label": "\u696D\u52D9\u985E\u578B\u5206\u9801", children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6703\u8CBB", ...a11yProps(0) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u79DF\u91D1", ...a11yProps(1) }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u5176\u4ED6", ...a11yProps(2) })] }) }), (0, jsx_runtime_1.jsxs)(TabPanel, { value: tabValue, index: 0, children: [(0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 2, mb: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, placeholder: "\u641C\u5C0B\u5BA2\u6236\u3001\u63CF\u8FF0\u6216\u767C\u7968\u865F\u78BC", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), InputProps: {
                                                startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Search, {}) }))
                                            } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 2, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "all", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "pending", children: "\u5F85\u4ED8\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "partially_paid", children: "\u90E8\u5206\u4ED8\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "paid", children: "\u5DF2\u4ED8\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "overdue", children: "\u903E\u671F" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', gap: 1, justifyContent: 'flex-end' }, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => { }, children: "\u65B0\u589E\u6703\u8CBB\u61C9\u6536\u5E33\u6B3E" }) }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "textSecondary", children: ["\u7E3D\u8A08: ", getTotalAmount().toLocaleString(), " \u5143, \u5171 ", filteredReceivables.length, " \u7B46\u8A18\u9304"] })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u59D3\u540D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5230\u671F\u65E5" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u63CF\u8FF0" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u5DF2\u4ED8\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u9918\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: filteredReceivables.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 9, align: "center", children: "\u7121\u7B26\u5408\u689D\u4EF6\u7684\u6703\u8CBB\u61C9\u6536\u5E33\u6B3E" }) })) : (filteredReceivables.map((receivable) => {
                                        const balance = (receivable.amount || 0) - (receivable.payment_amount || 0);
                                        return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { sx: balance > 0 ? { bgcolor: 'rgba(255, 152, 0, 0.05)' } : {}, children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.customer_name || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.customer_name || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.due_date ? (0, dayjs_1.default)(receivable.due_date).format('YYYY/MM/DD') : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.description || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (receivable.amount || 0).toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (receivable.payment_amount || 0).toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: {
                                                        fontWeight: 'bold',
                                                        color: balance > 0 ? 'error.main' : 'success.main'
                                                    }, children: (balance || 0).toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getStatusChip(receivable.status) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "primary", onClick: () => { }, title: "\u7DE8\u8F2F", children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => { }, title: "\u522A\u9664", children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, receivable.id));
                                    })) })] }) })] }), (0, jsx_runtime_1.jsxs)(TabPanel, { value: tabValue, index: 1, children: [(0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 2, mb: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, placeholder: "\u641C\u5C0B\u5BA2\u6236\u3001\u63CF\u8FF0\u6216\u767C\u7968\u865F\u78BC", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), InputProps: {
                                                startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Search, {}) }))
                                            } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 2, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "all", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "pending", children: "\u5F85\u4ED8\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "partially_paid", children: "\u90E8\u5206\u4ED8\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "paid", children: "\u5DF2\u4ED8\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "overdue", children: "\u903E\u671F" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', gap: 1, justifyContent: 'flex-end' }, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => { }, children: "\u65B0\u589E\u79DF\u91D1\u61C9\u6536\u5E33\u6B3E" }) }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "textSecondary", children: ["\u7E3D\u8A08: ", getTotalAmount().toLocaleString(), " \u5143, \u5171 ", filteredReceivables.length, " \u7B46\u8A18\u9304"] })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u627F\u79DF\u4EBA" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5230\u671F\u65E5" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u63CF\u8FF0" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u5DF2\u4ED8\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u9918\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: filteredReceivables.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 9, align: "center", children: "\u7121\u7B26\u5408\u689D\u4EF6\u7684\u79DF\u91D1\u61C9\u6536\u5E33\u6B3E" }) })) : (filteredReceivables.map((receivable) => {
                                        const balance = (receivable.amount || 0) - (receivable.payment_amount || 0);
                                        return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { sx: balance > 0 ? { bgcolor: 'rgba(255, 152, 0, 0.05)' } : {}, children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.customer_name || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.customer_name || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.due_date ? (0, dayjs_1.default)(receivable.due_date).format('YYYY/MM/DD') : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: receivable.description || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (receivable.amount || 0).toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (receivable.payment_amount || 0).toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: {
                                                        fontWeight: 'bold',
                                                        color: balance > 0 ? 'error.main' : 'success.main'
                                                    }, children: (balance || 0).toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getStatusChip(receivable.status) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "primary", onClick: () => { }, title: "\u7DE8\u8F2F", children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => { }, title: "\u522A\u9664", children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, receivable.id));
                                    })) })] }) })] }), (0, jsx_runtime_1.jsx)(TabPanel, { value: tabValue, index: 2, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", color: "textSecondary", align: "center", children: "\u5176\u4ED6\u985E\u578B\u7684\u61C9\u6536\u5E33\u6B3E\u5C07\u5728\u6B64\u986F\u793A" }) })] }));
};
exports.default = BusinessReceivablesTab;
