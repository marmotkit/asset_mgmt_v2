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
const ReportTab = ({ investments }) => {
    const [rentalPayments, setRentalPayments] = (0, react_1.useState)([]);
    const [memberProfits, setMemberProfits] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [filterYear, setFilterYear] = (0, react_1.useState)(new Date().getFullYear());
    (0, react_1.useEffect)(() => {
        loadData();
    }, [filterYear]);
    const loadData = async () => {
        setLoading(true);
        try {
            const [investmentsData, paymentsData, profitsData] = await Promise.all([
                services_1.ApiService.getInvestments(),
                services_1.ApiService.getRentalPayments(undefined, filterYear),
                services_1.ApiService.getMemberProfits(undefined, undefined, filterYear),
            ]);
            setRentalPayments(paymentsData);
            setMemberProfits(profitsData);
        }
        catch (err) {
            setError('載入資料失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const calculateRentalStats = () => {
        const totalRental = rentalPayments.reduce((sum, payment) => {
            if (payment.year === filterYear) {
                return sum + payment.amount;
            }
            return sum;
        }, 0);
        const collectedRental = rentalPayments
            .filter(payment => payment.status === rental_1.PaymentStatus.PAID &&
            payment.year === filterYear)
            .reduce((sum, payment) => sum + payment.amount, 0);
        const pendingRental = rentalPayments
            .filter(payment => payment.status === rental_1.PaymentStatus.PENDING &&
            payment.year === filterYear)
            .reduce((sum, payment) => sum + payment.amount, 0);
        const overdueRental = rentalPayments
            .filter(payment => payment.status === rental_1.PaymentStatus.OVERDUE &&
            payment.year === filterYear)
            .reduce((sum, payment) => sum + payment.amount, 0);
        return { totalRental, collectedRental, pendingRental, overdueRental };
    };
    const calculateProfitStats = () => {
        const totalProfit = memberProfits.reduce((sum, profit) => {
            if (profit.year === filterYear) {
                return sum + profit.amount;
            }
            return sum;
        }, 0);
        const paidProfit = memberProfits
            .filter(profit => profit.status === rental_1.PaymentStatus.PAID &&
            profit.year === filterYear)
            .reduce((sum, profit) => sum + profit.amount, 0);
        const pendingProfit = memberProfits
            .filter(profit => profit.status === rental_1.PaymentStatus.PENDING &&
            profit.year === filterYear)
            .reduce((sum, profit) => sum + profit.amount, 0);
        const overdueProfit = memberProfits
            .filter(profit => profit.status === rental_1.PaymentStatus.OVERDUE &&
            profit.year === filterYear)
            .reduce((sum, profit) => sum + profit.amount, 0);
        return { totalProfit, paidProfit, pendingProfit, overdueProfit };
    };
    const calculateInvestmentStats = () => {
        return investments.map(investment => {
            const investmentRentals = rentalPayments.filter(payment => payment.investmentId === investment.id &&
                payment.year === filterYear);
            const investmentProfits = memberProfits.filter(profit => profit.investmentId === investment.id &&
                profit.year === filterYear);
            const totalRental = investmentRentals.reduce((sum, payment) => sum + payment.amount, 0);
            const collectedRental = investmentRentals
                .filter(payment => payment.status === rental_1.PaymentStatus.PAID)
                .reduce((sum, payment) => sum + payment.amount, 0);
            const totalProfit = investmentProfits.reduce((sum, profit) => sum + profit.amount, 0);
            const paidProfit = investmentProfits
                .filter(profit => profit.status === rental_1.PaymentStatus.PAID)
                .reduce((sum, profit) => sum + profit.amount, 0);
            const netIncome = collectedRental - paidProfit;
            return {
                investment,
                totalRental,
                collectedRental,
                totalProfit,
                paidProfit,
                netIncome,
            };
        });
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {});
    if (error)
        return (0, jsx_runtime_1.jsx)(ErrorAlert_1.default, { message: error });
    const rentalStats = calculateRentalStats();
    const profitStats = calculateProfitStats();
    const investmentStats = calculateInvestmentStats();
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2, display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "\u7D71\u8A08\u5831\u8868" }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { minWidth: 100 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: filterYear.toString(), label: "\u5E74\u5EA6", onChange: (e) => setFilterYear(Number(e.target.value)), children: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: year, children: year }, year))) })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u79DF\u91D1\u6536\u6B3E\u7D71\u8A08" }), (0, jsx_runtime_1.jsx)(material_1.Table, { size: "small", children: (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7E3D\u79DF\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(rentalStats.totalRental) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5DF2\u6536\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(rentalStats.collectedRental) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5F85\u6536\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(rentalStats.pendingRental) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u903E\u671F\u672A\u6536" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(rentalStats.overdueRental) })] })] }) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.Paper, { sx: { p: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6703\u54E1\u5206\u6F64\u7D71\u8A08" }), (0, jsx_runtime_1.jsx)(material_1.Table, { size: "small", children: (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7E3D\u5206\u6F64" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(profitStats.totalProfit) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5DF2\u767C\u653E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(profitStats.paidProfit) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5F85\u767C\u653E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(profitStats.pendingProfit) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u903E\u671F\u672A\u767C" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(profitStats.overdueProfit) })] })] }) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { mt: 2 }, children: (0, jsx_runtime_1.jsx)(material_1.TableContainer, { children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u7E3D\u79DF\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u5DF2\u6536\u79DF\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u7E3D\u5206\u6F64" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u5DF2\u767C\u653E\u5206\u6F64" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u6DE8\u6536\u5165" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [investmentStats.map((stats) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: stats.investment.name }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stats.totalRental) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stats.collectedRental) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stats.totalProfit) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stats.paidProfit) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stats.netIncome) })] }, stats.investment.id))), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { sx: { fontWeight: 'bold' }, children: "\u7E3D\u8A08" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { fontWeight: 'bold' }, children: (0, format_1.formatCurrency)(investmentStats.reduce((sum, stats) => sum + stats.totalRental, 0)) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { fontWeight: 'bold' }, children: (0, format_1.formatCurrency)(investmentStats.reduce((sum, stats) => sum + stats.collectedRental, 0)) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { fontWeight: 'bold' }, children: (0, format_1.formatCurrency)(investmentStats.reduce((sum, stats) => sum + stats.totalProfit, 0)) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { fontWeight: 'bold' }, children: (0, format_1.formatCurrency)(investmentStats.reduce((sum, stats) => sum + stats.paidProfit, 0)) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", sx: { fontWeight: 'bold' }, children: (0, format_1.formatCurrency)(investmentStats.reduce((sum, stats) => sum + stats.netIncome, 0)) })] })] })] }) }) }) })] })] }));
};
exports.default = ReportTab;
