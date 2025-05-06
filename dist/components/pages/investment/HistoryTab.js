"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const rental_1 = require("../../../types/rental");
const services_1 = require("../../../services");
const format_1 = require("../../../utils/format");
const LoadingSpinner_1 = __importDefault(require("../../common/LoadingSpinner"));
const ErrorAlert_1 = __importDefault(require("../../common/ErrorAlert"));
const HistoryTab = ({ investments }) => {
    const [rentalPayments, setRentalPayments] = (0, react_1.useState)([]);
    const [memberProfits, setMemberProfits] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [selectedYear, setSelectedYear] = (0, react_1.useState)('all');
    const [yearlyStats, setYearlyStats] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setLoading(true);
        try {
            // 載入所有年度的資料
            const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
            const allPayments = [];
            const allProfits = [];
            // 依序載入每年的資料
            for (const year of years) {
                const [paymentsData, profitsData] = await Promise.all([
                    services_1.ApiService.getRentalPayments(undefined, year),
                    services_1.ApiService.getMemberProfits(undefined, undefined, year),
                ]);
                allPayments.push(...paymentsData);
                allProfits.push(...profitsData);
            }
            setRentalPayments(allPayments);
            setMemberProfits(allProfits);
            // 計算年度統計
            const stats = years.map(year => ({
                year,
                totalRental: allPayments
                    .filter(p => p.year === year)
                    .reduce((sum, p) => sum + Number(p.amount), 0),
                collectedRental: allPayments
                    .filter(p => p.year === year && p.status === rental_1.PaymentStatus.PAID)
                    .reduce((sum, p) => sum + Number(p.amount), 0),
                totalProfit: allProfits
                    .filter(p => p.year === year)
                    .reduce((sum, p) => sum + Number(p.amount), 0),
                paidProfit: allProfits
                    .filter(p => p.year === year && p.status === rental_1.PaymentStatus.PAID)
                    .reduce((sum, p) => sum + Number(p.amount), 0),
            }));
            setYearlyStats(stats);
        }
        catch (err) {
            setError('載入資料失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const getFilteredHistory = () => {
        const filteredPayments = rentalPayments
            .filter(payment => payment.status === rental_1.PaymentStatus.PAID &&
            (selectedYear === 'all' || payment.year === Number(selectedYear)))
            .map(payment => ({
            date: payment.paymentDate || payment.updatedAt,
            investmentId: payment.investmentId,
            type: '租金收款',
            amount: payment.amount,
            year: payment.year,
            month: payment.month,
        }));
        const filteredProfits = memberProfits
            .filter(profit => profit.status === rental_1.PaymentStatus.PAID &&
            (selectedYear === 'all' || profit.year === Number(selectedYear)))
            .map(profit => ({
            date: profit.paymentDate || profit.updatedAt,
            investmentId: profit.investmentId,
            type: '會員分潤',
            amount: profit.amount,
            year: profit.year,
            month: profit.month,
        }));
        return [...filteredPayments, ...filteredProfits]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {});
    if (error)
        return (0, jsx_runtime_1.jsx)(ErrorAlert_1.default, { message: error });
    const history = getFilteredHistory();
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3, display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "\u6295\u8CC7\u6B77\u53F2\u8A18\u9304" }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { minWidth: 120 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: selectedYear, label: "\u5E74\u5EA6", onChange: (e) => setSelectedYear(e.target.value), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "all", children: "\u5168\u90E8" }), yearlyStats.map((stat) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: stat.year.toString(), children: stat.year }, stat.year)))] })] })] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: yearlyStats.map((stat) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", gutterBottom: true, children: [stat.year, " \u5E74\u5EA6\u7D71\u8A08"] }), (0, jsx_runtime_1.jsx)(material_1.Table, { size: "small", children: (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5DF2\u6536\u79DF\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stat.collectedRental) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5DF2\u767C\u653E\u5206\u6F64" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stat.paidProfit) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6DE8\u6536\u5165" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stat.collectedRental - stat.paidProfit) })] })] }) })] }) }) }, stat.year))) }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5E74\u6708" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [history.map((record, index) => {
                                    const investment = investments.find(i => i.id === record.investmentId);
                                    return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: new Date(record.date).toLocaleDateString('zh-TW') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: `${record.year}年${record.month}月` }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.type }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(record.amount) })] }, index));
                                }), history.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 5, align: "center", children: "\u5C1A\u7121\u6B77\u53F2\u8A18\u9304" }) }))] })] }) })] }));
};
exports.default = HistoryTab;
