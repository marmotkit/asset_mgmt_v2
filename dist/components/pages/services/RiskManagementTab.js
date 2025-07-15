"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const api_service_1 = require("../../../services/api.service");
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `risk-management-tabpanel-${index}`, "aria-labelledby": `risk-management-tab-${index}`, ...other, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 3 }, children: children })) }));
}
// 會員逾期繳款記錄組件
const MemberOverduePaymentsPanel = () => {
    const [overduePayments, setOverduePayments] = (0, react_1.useState)([]);
    const [page, setPage] = (0, react_1.useState)(0);
    const [rowsPerPage, setRowsPerPage] = (0, react_1.useState)(10);
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            try {
                // 使用新增的API方法獲取逾期繳款記錄
                const overdue = await api_service_1.ApiService.getOverdueMemberPayments();
                console.log('【前端】獲取到的會員逾期繳款記錄:', overdue);
                setOverduePayments(overdue);
            }
            catch (error) {
                console.error('無法獲取會員逾期繳款記錄:', error);
            }
        };
        fetchData();
    }, []);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6703\u54E1\u903E\u671F\u7E73\u6B3E\u8A18\u9304" }), (0, jsx_runtime_1.jsxs)(material_1.TableContainer, { component: material_1.Paper, children: [(0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u59D3\u540D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6708\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u61C9\u4ED8\u65E5\u671F" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: overduePayments.length > 0 ? (overduePayments
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((payment) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.memberName || '未知會員' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.year }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.month }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: Number(payment.amount).toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: "\u903E\u671F", color: "error", size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.dueDate || '未設定' })] }, payment.id)))) : ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 6, align: "center", children: "\u7121\u6703\u54E1\u903E\u671F\u7E73\u6B3E\u8A18\u9304" }) })) })] }), (0, jsx_runtime_1.jsx)(material_1.TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: overduePayments.length, rowsPerPage: rowsPerPage, page: page, onPageChange: handleChangePage, onRowsPerPageChange: handleChangeRowsPerPage, labelRowsPerPage: "\u6BCF\u9801\u5217\u6578:" })] })] }));
};
// 客戶租金逾期繳款記錄組件
const CustomerOverdueRentalsPanel = () => {
    const [overdueRentals, setOverdueRentals] = (0, react_1.useState)([]);
    const [page, setPage] = (0, react_1.useState)(0);
    const [rowsPerPage, setRowsPerPage] = (0, react_1.useState)(10);
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            try {
                // 使用新增的API方法獲取逾期租金記錄
                const overdue = await api_service_1.ApiService.getOverdueRentalPayments();
                console.log('【前端】獲取到的客戶租金逾期繳款記錄:', overdue);
                setOverdueRentals(overdue);
            }
            catch (error) {
                console.error('無法獲取客戶租金逾期繳款記錄:', error);
            }
        };
        fetchData();
    }, []);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u5BA2\u6236\u79DF\u91D1\u903E\u671F\u7E73\u6B3E\u8A18\u9304" }), (0, jsx_runtime_1.jsxs)(material_1.TableContainer, { component: material_1.Paper, children: [(0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u627F\u79DF\u4EBA" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6708\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u79DF\u8CC3\u671F\u9593" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: overdueRentals.length > 0 ? (overdueRentals
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((rental) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: rental.renterName }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: rental.year }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: rental.month }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: Number(rental.amount).toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: "\u903E\u671F", color: "error", size: "small" }) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [rental.startDate, " - ", rental.endDate] })] }, rental.id)))) : ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 6, align: "center", children: "\u7121\u5BA2\u6236\u79DF\u91D1\u903E\u671F\u7E73\u6B3E\u8A18\u9304" }) })) })] }), (0, jsx_runtime_1.jsx)(material_1.TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: overdueRentals.length, rowsPerPage: rowsPerPage, page: page, onPageChange: handleChangePage, onRowsPerPageChange: handleChangeRowsPerPage, labelRowsPerPage: "\u6BCF\u9801\u5217\u6578:" })] })] }));
};
// 其他異常記錄組件
const OtherAnomaliesPanel = () => {
    const [anomalies, setAnomalies] = (0, react_1.useState)([]);
    const [members, setMembers] = (0, react_1.useState)([]);
    const [page, setPage] = (0, react_1.useState)(0);
    const [rowsPerPage, setRowsPerPage] = (0, react_1.useState)(10);
    const [openDialog, setOpenDialog] = (0, react_1.useState)(false);
    const [newAnomaly, setNewAnomaly] = (0, react_1.useState)({
        type: '',
        personId: '',
        personName: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        status: '待處理',
        handling: ''
    });
    (0, react_1.useEffect)(() => {
        const fetchData = async () => {
            try {
                // 使用新增的API方法獲取異常記錄
                const data = await api_service_1.ApiService.getAnomalies();
                setAnomalies(data);
                // 獲取會員資料用於選擇相關人員
                const memberData = await api_service_1.ApiService.getMembers();
                setMembers(memberData);
            }
            catch (error) {
                console.error('無法獲取異常記錄:', error);
            }
        };
        fetchData();
    }, []);
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAnomaly({
            ...newAnomaly,
            [name]: value
        });
        // 如果選擇了會員，同時設置會員姓名
        if (name === 'personId') {
            const selectedMember = members.find(m => m.id === value);
            if (selectedMember) {
                setNewAnomaly({
                    ...newAnomaly,
                    personId: value,
                    personName: selectedMember.name
                });
            }
        }
    };
    const handleSaveAnomaly = async () => {
        try {
            // 保存新的異常記錄
            const savedAnomaly = await api_service_1.ApiService.recordAnomaly(newAnomaly);
            // 更新異常記錄列表
            setAnomalies([...anomalies, savedAnomaly]);
            // 重置表單並關閉對話框
            setNewAnomaly({
                type: '',
                personId: '',
                personName: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                status: '待處理',
                handling: ''
            });
            handleCloseDialog();
        }
        catch (error) {
            console.error('保存異常記錄失敗:', error);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u5176\u4ED6\u7570\u5E38\u8A18\u9304" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: handleOpenDialog, children: "\u65B0\u589E\u7570\u5E38\u8A18\u9304" })] }), (0, jsx_runtime_1.jsxs)(material_1.TableContainer, { component: material_1.Paper, children: [(0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u76F8\u95DC\u4EBA\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u767C\u751F\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u4E8B\u4EF6\u63CF\u8FF0" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u8655\u7406\u65B9\u5F0F" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: anomalies.length > 0 ? (anomalies
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((anomaly, index) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: anomaly.type }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: anomaly.personName }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: new Date(anomaly.date).toLocaleDateString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: anomaly.description }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: anomaly.status, color: anomaly.status === '已處理' ? 'success' : anomaly.status === '處理中' ? 'warning' : 'error', size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: anomaly.handling || '尚未處理' })] }, anomaly.id || index)))) : ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 6, align: "center", children: "\u7121\u5176\u4ED6\u7570\u5E38\u8A18\u9304" }) })) })] }), (0, jsx_runtime_1.jsx)(material_1.TablePagination, { rowsPerPageOptions: [5, 10, 25], component: "div", count: anomalies.length, rowsPerPage: rowsPerPage, page: page, onPageChange: handleChangePage, onRowsPerPageChange: handleChangeRowsPerPage, labelRowsPerPage: "\u6BCF\u9801\u5217\u6578:" })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: openDialog, onClose: handleCloseDialog, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u65B0\u589E\u7570\u5E38\u8A18\u9304" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "anomaly-type-label", children: "\u7570\u5E38\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "anomaly-type-label", id: "anomaly-type", name: "type", value: newAnomaly.type, label: "\u7570\u5E38\u985E\u578B", onChange: handleInputChange, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u7E73\u6B3E\u554F\u984C", children: "\u7E73\u6B3E\u554F\u984C" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u5408\u7D04\u722D\u8B70", children: "\u5408\u7D04\u722D\u8B70" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u907A\u5931\u8CC7\u6599", children: "\u907A\u5931\u8CC7\u6599" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u7CFB\u7D71\u932F\u8AA4", children: "\u7CFB\u7D71\u932F\u8AA4" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u5176\u4ED6", children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "person-label", children: "\u76F8\u95DC\u4EBA\u54E1" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "person-label", id: "person", name: "personId", value: newAnomaly.personId, label: "\u76F8\u95DC\u4EBA\u54E1", onChange: handleInputChange, children: [members.map(member => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: member.id, children: member.name }, member.id))), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "other", children: "\u5176\u4ED6\u4EBA\u54E1" })] })] }) }), newAnomaly.personId === 'other' && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, name: "personName", label: "\u76F8\u95DC\u4EBA\u54E1\u59D3\u540D", value: newAnomaly.personName, onChange: handleInputChange }) })), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, name: "date", label: "\u767C\u751F\u65E5\u671F", type: "date", value: newAnomaly.date, onChange: handleInputChange, InputLabelProps: {
                                            shrink: true,
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "status-label", children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "status-label", id: "status", name: "status", value: newAnomaly.status, label: "\u72C0\u614B", onChange: handleInputChange, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u5F85\u8655\u7406", children: "\u5F85\u8655\u7406" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u8655\u7406\u4E2D", children: "\u8655\u7406\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u5DF2\u8655\u7406", children: "\u5DF2\u8655\u7406" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, name: "description", label: "\u4E8B\u4EF6\u63CF\u8FF0", multiline: true, rows: 3, value: newAnomaly.description, onChange: handleInputChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, name: "handling", label: "\u8655\u7406\u65B9\u5F0F", multiline: true, rows: 2, value: newAnomaly.handling, onChange: handleInputChange }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSaveAnomaly, variant: "contained", color: "primary", disabled: !newAnomaly.type || (!newAnomaly.personId && !newAnomaly.personName) || !newAnomaly.date || !newAnomaly.description, children: "\u4FDD\u5B58" })] })] })] }));
};
// 風險管理頁簽主組件
const RiskManagementTab = () => {
    const [currentTab, setCurrentTab] = (0, react_1.useState)(0);
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { width: '100%' }, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { width: '100%', mb: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: currentTab, onChange: handleTabChange, "aria-label": "\u98A8\u96AA\u7BA1\u7406\u6A19\u7C64", variant: "fullWidth", children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u6703\u54E1\u903E\u671F\u7E73\u6B3E\u8A18\u9304", id: "tab-0", "aria-controls": "tabpanel-0" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u5BA2\u6236\u79DF\u91D1\u903E\u671F\u7E73\u6B3E\u8A18\u9304", id: "tab-1", "aria-controls": "tabpanel-1" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u5176\u4ED6\u7570\u5E38\u8A18\u9304", id: "tab-2", "aria-controls": "tabpanel-2" })] }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 0, children: (0, jsx_runtime_1.jsx)(MemberOverduePaymentsPanel, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 1, children: (0, jsx_runtime_1.jsx)(CustomerOverdueRentalsPanel, {}) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 2, children: (0, jsx_runtime_1.jsx)(OtherAnomaliesPanel, {}) })] }) }));
};
exports.default = RiskManagementTab;
