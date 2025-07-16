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
const AuthContext_1 = require("../../../contexts/AuthContext");
const notistack_1 = require("notistack");
const RentalPaymentStatusTab = () => {
    const { user } = (0, AuthContext_1.useAuth)();
    const [rentalPayments, setRentalPayments] = (0, react_1.useState)([]);
    const [investments, setInvestments] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [yearFilter, setYearFilter] = (0, react_1.useState)(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = (0, react_1.useState)(new Date().getMonth() + 1);
    const [showAllYear, setShowAllYear] = (0, react_1.useState)(false);
    const [sortField, setSortField] = (0, react_1.useState)('yearMonth');
    const [sortDirection, setSortDirection] = (0, react_1.useState)('desc');
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    // 檢查用戶權限
    const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'admin';
    const isManager = (user === null || user === void 0 ? void 0 : user.role) === 'business' || (user === null || user === void 0 ? void 0 : user.role) === 'lifetime';
    (0, react_1.useEffect)(() => {
        loadData();
    }, [yearFilter, monthFilter, showAllYear]);
    const loadData = async () => {
        setLoading(true);
        try {
            // 載入投資項目資料
            const investmentsData = await services_1.ApiService.getInvestments();
            setInvestments(investmentsData);
            // 根據用戶權限載入租金付款資料
            let paymentsData = [];
            if (isAdmin || isManager) {
                // 管理員和管理者可以看到全部資料
                paymentsData = await services_1.ApiService.getRentalPayments(undefined, yearFilter, showAllYear ? undefined : monthFilter);
            }
            else {
                // 一般會員只能看到自己的資料
                // 這裡需要根據投資項目的userId來篩選
                const allPayments = await services_1.ApiService.getRentalPayments(undefined, yearFilter, showAllYear ? undefined : monthFilter);
                // 篩選出屬於當前用戶的投資項目的租金付款
                const userInvestments = investmentsData.filter(inv => inv.userId === (user === null || user === void 0 ? void 0 : user.id));
                const userInvestmentIds = userInvestments.map(inv => inv.id);
                paymentsData = allPayments.filter(payment => userInvestmentIds.includes(payment.investmentId));
            }
            setRentalPayments(paymentsData);
        }
        catch (err) {
            console.error('載入租金付款狀況失敗:', err);
            setError('載入資料失敗');
            enqueueSnackbar('載入租金付款狀況失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    // 排序函數
    const sortPayments = (payments) => {
        return [...payments].sort((a, b) => {
            let aValue;
            let bValue;
            switch (sortField) {
                case 'investmentName':
                    const investmentA = investments.find(inv => inv.id === a.investmentId);
                    const investmentB = investments.find(inv => inv.id === b.investmentId);
                    aValue = (investmentA === null || investmentA === void 0 ? void 0 : investmentA.name) || '';
                    bValue = (investmentB === null || investmentB === void 0 ? void 0 : investmentB.name) || '';
                    break;
                case 'yearMonth':
                    aValue = a.year * 100 + a.month;
                    bValue = b.year * 100 + b.month;
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                case 'status':
                    aValue = getStatusText(a.status);
                    bValue = getStatusText(b.status);
                    break;
                case 'paymentDate':
                    aValue = a.paymentDate || '';
                    bValue = b.paymentDate || '';
                    break;
                case 'paymentMethod':
                    aValue = getPaymentMethodText(a.paymentMethod);
                    bValue = getPaymentMethodText(b.paymentMethod);
                    break;
                default:
                    aValue = '';
                    bValue = '';
            }
            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            }
            else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    const getSortLabel = (field, label) => ((0, jsx_runtime_1.jsx)(material_1.TableSortLabel, { active: sortField === field, direction: sortField === field ? sortDirection : 'asc', onClick: () => handleSort(field), children: label }));
    const getStatusColor = (status) => {
        switch (status) {
            case rental_1.PaymentStatus.PAID:
                return 'success';
            case rental_1.PaymentStatus.PENDING:
                return 'warning';
            case rental_1.PaymentStatus.OVERDUE:
                return 'error';
            default:
                return 'default';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case rental_1.PaymentStatus.PAID:
                return '已繳';
            case rental_1.PaymentStatus.PENDING:
                return '待繳';
            case rental_1.PaymentStatus.OVERDUE:
                return '逾期';
            default:
                return '未知';
        }
    };
    const getPaymentMethodText = (method) => {
        switch (method) {
            case rental_1.PaymentMethod.CASH:
                return '現金';
            case rental_1.PaymentMethod.BANK_TRANSFER:
                return '銀行轉帳';
            case rental_1.PaymentMethod.CHECK:
                return '支票';
            default:
                return '-';
        }
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {});
    if (error)
        return (0, jsx_runtime_1.jsx)(ErrorAlert_1.default, { message: error });
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u79DF\u91D1\u4ED8\u6B3E\u72C0\u6CC1" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { mr: 2, minWidth: 100 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "year-filter-label", children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "year-filter-label", value: yearFilter.toString(), label: "\u5E74\u5EA6", onChange: (e) => setYearFilter(Number(e.target.value)), children: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: year, children: [year, " \u5E74"] }, year))) })] }), !showAllYear && ((0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { mr: 2, minWidth: 100 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "month-filter-label", children: "\u6708\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "month-filter-label", value: monthFilter.toString(), label: "\u6708\u4EFD", onChange: (e) => setMonthFilter(Number(e.target.value)), children: Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: month, children: [month, " \u6708"] }, month))) })] })), (0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { checked: showAllYear, onChange: (e) => setShowAllYear(e.target.checked) }), label: "\u7576\u5E74\u5EA6", sx: { mr: 2 } })] })] }), !isAdmin && !isManager && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "info", sx: { mb: 2 }, children: "\u60A8\u53EA\u80FD\u67E5\u770B\u5C6C\u65BC\u81EA\u5DF1\u7684\u79DF\u91D1\u4ED8\u6B3E\u72C0\u6CC1" })), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('investmentName', '投資項目') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('yearMonth', '年月') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: getSortLabel('amount', '租金金額') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('status', '付款狀態') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('paymentMethod', '付款方式') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getSortLabel('paymentDate', '付款日期') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u627F\u79DF\u4EBA" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7E73\u6B3E\u4EBA" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5099\u8A3B" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [sortPayments(rentalPayments).map((payment) => {
                                    const investment = investments.find((inv) => inv.id === payment.investmentId);
                                    return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: `${payment.year}年${payment.month}月` }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(payment.amount) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusText(payment.status), color: getStatusColor(payment.status), size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getPaymentMethodText(payment.paymentMethod) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.paymentDate ? (0, format_1.formatDate)(payment.paymentDate) : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.renterName || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.payerName || payment.renterName || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.note || '-' })] }, payment.id));
                                }), rentalPayments.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 9, align: "center", children: "\u5C1A\u7121\u79DF\u91D1\u4ED8\u6B3E\u8CC7\u6599" }) }))] })] }) })] }));
};
exports.default = RentalPaymentStatusTab;
