"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeReport = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const feeHistoryService_1 = require("../../../services/feeHistoryService");
const invoiceService_1 = require("../../../services/invoiceService");
const memberService_1 = require("../../../services/memberService");
const XLSX = __importStar(require("xlsx"));
const FeeReport = () => {
    const [selectedYear, setSelectedYear] = (0, react_1.useState)('all');
    const [yearOptions, setYearOptions] = (0, react_1.useState)([]);
    const [stats, setStats] = (0, react_1.useState)({
        yearlyTotal: 0,
        yearlyPending: 0,
        memberTypeStats: {
            '一般會員': 0,
            '商務會員': 0,
            '終身會員': 0
        }
    });
    const [feeRecords, setFeeRecords] = (0, react_1.useState)([]);
    const [columns, setColumns] = (0, react_1.useState)([
        { id: 'memberId', label: '會員編號', selected: true },
        { id: 'memberName', label: '會員姓名', selected: true },
        { id: 'memberType', label: '會員類別', selected: true },
        { id: 'paymentDate', label: '繳費日期', selected: true },
        { id: 'paymentMethod', label: '繳費方式', selected: true },
        { id: 'status', label: '繳費狀態', selected: true },
        { id: 'hasInvoice', label: '發票/收據', selected: true }
    ]);
    const [invoiceStatus, setInvoiceStatus] = (0, react_1.useState)({});
    const [members, setMembers] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        // 生成年度選項（從2020年到當前年度）
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 2019 }, (_, i) => (currentYear - i).toString());
        setYearOptions(years);
        loadData();
    }, []);
    (0, react_1.useEffect)(() => {
        loadData();
    }, [selectedYear]);
    const loadData = async () => {
        try {
            const records = await feeHistoryService_1.feeHistoryService.getHistories();
            let filteredRecords = records;
            if (selectedYear !== 'all') {
                const targetYear = parseInt(selectedYear);
                filteredRecords = records.filter(r => {
                    if (r.paymentDate) {
                        return new Date(r.paymentDate).getFullYear() === targetYear;
                    }
                    return false;
                });
            }
            // 載入會員資料
            const allMembers = await memberService_1.memberService.getMembers();
            const memberMap = allMembers.reduce((acc, member) => {
                acc[member.id] = member;
                return acc;
            }, {});
            setMembers(memberMap);
            setFeeRecords(filteredRecords);
            // 載入發票狀態
            const invoiceStatusMap = {};
            for (const record of filteredRecords) {
                const docs = await invoiceService_1.invoiceService.getDocuments({ memberId: record.memberId });
                invoiceStatusMap[record.id] = docs.length > 0;
            }
            setInvoiceStatus(invoiceStatusMap);
            // 計算統計數據
            const yearlyTotal = filteredRecords
                .filter(r => {
                if (!r.paymentDate)
                    return false;
                return r.status === '已收款';
            })
                .reduce((sum, r) => sum + r.amount, 0);
            const yearlyPending = filteredRecords
                .filter(r => {
                if (!r.dueDate)
                    return false;
                return r.status === '待收款';
            })
                .reduce((sum, r) => sum + r.amount, 0);
            const memberTypeStats = filteredRecords
                .filter(r => {
                if (!r.paymentDate)
                    return false;
                return r.status === '已收款';
            })
                .reduce((acc, r) => {
                if (r.memberType) {
                    acc[r.memberType] = (acc[r.memberType] || 0) + r.amount;
                }
                return acc;
            }, {});
            setStats({
                yearlyTotal,
                yearlyPending,
                memberTypeStats: {
                    '一般會員': memberTypeStats['一般會員'] || 0,
                    '商務會員': memberTypeStats['商務會員'] || 0,
                    '終身會員': memberTypeStats['終身會員'] || 0
                }
            });
        }
        catch (error) {
            console.error('載入資料失敗:', error);
        }
    };
    const handleColumnToggle = (columnId) => {
        setColumns(columns.map(col => col.id === columnId ? { ...col, selected: !col.selected } : col));
    };
    const handleExportExcel = () => {
        const selectedColumns = columns.filter(col => col.selected);
        // 準備 Excel 資料
        const excelData = feeRecords.map((record, index) => {
            const rowData = {
                '序號': index + 1
            };
            selectedColumns.forEach(column => {
                rowData[column.label] = getCellValue(record, column.id);
            });
            return rowData;
        });
        // 創建工作表
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '會費收款報表');
        // 下載檔案
        const fileName = selectedYear === 'all' ?
            '會費收款總表.xlsx' :
            `${selectedYear}年度會費收款總表.xlsx`;
        XLSX.writeFile(wb, fileName);
    };
    const getCellValue = (record, columnId) => {
        if (columnId === 'hasInvoice') {
            return invoiceStatus[record.id] ? '是' : '否';
        }
        return record[columnId] || '-';
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { mb: 2 }, children: "\u6703\u8CBB\u5831\u8868" }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { minWidth: 120 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u9078\u64C7\u5E74\u5EA6" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: selectedYear, label: "\u9078\u64C7\u5E74\u5EA6", onChange: (e) => setSelectedYear(e.target.value), size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "all", children: "\u5168\u90E8" }), yearOptions.map(year => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: year, children: [year, "\u5E74"] }, year)))] })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 3, sx: { mb: 4 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Card, { sx: { height: '100%', minHeight: 200 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { sx: {
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { color: "textSecondary", gutterBottom: true, children: selectedYear === 'all' ? '全部總收' : `${selectedYear}年度總收` }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", children: ["$", stats.yearlyTotal.toLocaleString()] })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Card, { sx: { height: '100%', minHeight: 200 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { sx: {
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { color: "textSecondary", gutterBottom: true, children: selectedYear === 'all' ? '全部待收' : `${selectedYear}年度待收` }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h4", children: ["$", stats.yearlyPending.toLocaleString()] })] }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Card, { sx: { height: '100%', minHeight: 200 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { sx: {
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { color: "textSecondary", gutterBottom: true, children: selectedYear === 'all' ? '全部類別會員總收' : `${selectedYear}年度各類別會員總收` }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }, children: Object.entries(stats.memberTypeStats).map(([type, amount]) => ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1,
                                                alignItems: 'center'
                                            }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", children: [type, ":"] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", children: ["$", amount.toLocaleString()] })] }, type))) })] }) }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 2, mb: 3 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: selectedYear === 'all' ? '會費收款總表' : `${selectedYear}年度會費收款總表` }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Download, {}), onClick: handleExportExcel, children: "\u532F\u51FA Excel" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", sx: { mb: 1 }, children: "\u9078\u64C7\u986F\u793A\u6B04\u4F4D\uFF1A" }), (0, jsx_runtime_1.jsx)(material_1.FormGroup, { row: true, children: columns.map(column => ((0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { checked: column.selected, onChange: () => handleColumnToggle(column.id) }), label: column.label }, column.id))) })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5E8F\u865F" }), columns.map(column => column.selected && ((0, jsx_runtime_1.jsx)(material_1.TableCell, { children: column.label }, column.id)))] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: feeRecords.map((record, index) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: index + 1 }), columns.map(column => column.selected && ((0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getCellValue(record, column.id) }, column.id)))] }, record.id))) })] }) })] })] }));
};
exports.FeeReport = FeeReport;
