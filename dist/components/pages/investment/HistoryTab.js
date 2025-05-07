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
const Delete_1 = __importDefault(require("@mui/icons-material/Delete"));
const notistack_1 = require("notistack");
const icons_material_1 = require("@mui/icons-material");
const HistoryTab = ({ investments }) => {
    const [rentalPayments, setRentalPayments] = (0, react_1.useState)([]);
    const [memberProfits, setMemberProfits] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [selectedYear, setSelectedYear] = (0, react_1.useState)('all');
    const [yearlyStats, setYearlyStats] = (0, react_1.useState)([]);
    const [clearConfirmOpen, setClearConfirmOpen] = (0, react_1.useState)(false);
    const [yearToClear, setYearToClear] = (0, react_1.useState)(null);
    const [yearFilter, setYearFilter] = (0, react_1.useState)(new Date().getFullYear());
    const [clearDialogOpen, setClearDialogOpen] = (0, react_1.useState)(false);
    const [confirmText, setConfirmText] = (0, react_1.useState)('');
    const [confirmClearDialogOpen, setConfirmClearDialogOpen] = (0, react_1.useState)(false);
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    (0, react_1.useEffect)(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setLoading(true);
        try {
            console.log('歷史記錄 - 開始載入資料');
            // 載入所有年度的資料
            const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
            console.log('歷史記錄 - 準備載入的年度:', years);
            const allPayments = [];
            const allProfits = [];
            // 依序載入每年的資料
            for (const year of years) {
                console.log(`歷史記錄 - 正在載入 ${year} 年度的資料`);
                try {
                    const [paymentsData, profitsData] = await Promise.all([
                        services_1.ApiService.getRentalPayments(undefined, year),
                        services_1.ApiService.getMemberProfits(undefined, undefined, year),
                    ]);
                    console.log(`歷史記錄 - ${year} 年度租金收款: ${paymentsData.length} 筆, 會員分潤: ${profitsData.length} 筆`);
                    allPayments.push(...paymentsData);
                    allProfits.push(...profitsData);
                }
                catch (yearErr) {
                    console.error(`歷史記錄 - 載入 ${year} 年度資料時出錯:`, yearErr);
                }
            }
            console.log(`歷史記錄 - 總共載入: 租金收款 ${allPayments.length} 筆, 會員分潤 ${allProfits.length} 筆`);
            setRentalPayments(allPayments);
            setMemberProfits(allProfits);
            // 計算年度統計
            const stats = years.map(year => {
                const yearPayments = allPayments.filter(p => p.year === year);
                const yearProfits = allProfits.filter(p => p.year === year);
                const paidPayments = yearPayments.filter(p => p.status === rental_1.PaymentStatus.PAID);
                const paidProfits = yearProfits.filter(p => p.status === rental_1.PaymentStatus.PAID);
                console.log(`歷史記錄 - ${year} 年度統計: 租金 ${yearPayments.length} 筆, 已收 ${paidPayments.length} 筆, 分潤 ${yearProfits.length} 筆, 已發放 ${paidProfits.length} 筆`);
                return {
                    year,
                    totalRental: yearPayments.reduce((sum, p) => sum + Number(p.amount), 0),
                    collectedRental: paidPayments.reduce((sum, p) => sum + Number(p.amount), 0),
                    totalProfit: yearProfits.reduce((sum, p) => sum + Number(p.amount), 0),
                    paidProfit: paidProfits.reduce((sum, p) => sum + Number(p.amount), 0),
                };
            });
            setYearlyStats(stats);
            setError(null);
        }
        catch (err) {
            setError('載入資料失敗');
            console.error('載入資料失敗:', err);
        }
        finally {
            setLoading(false);
            console.log('歷史記錄 - 資料載入完成');
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
    const handleClearClick = () => {
        if (selectedYear === 'all') {
            enqueueSnackbar('請先選擇要清除的年度', { variant: 'warning' });
            return;
        }
        setYearToClear(Number(selectedYear));
        setClearConfirmOpen(true);
    };
    const handleClearConfirm = async () => {
        if (!yearToClear)
            return;
        setLoading(true);
        console.log(`開始清除 ${yearToClear} 年度的歷史資料`);
        try {
            // 使用直接清除本地存儲的方法
            console.log(`使用 purgeLocalStorage 清除 ${yearToClear} 年度的資料...`);
            try {
                await services_1.ApiService.purgeLocalStorage(yearToClear);
                console.log(`${yearToClear} 年度的數據已從本地存儲中清除`);
            }
            catch (purgeError) {
                console.error('使用 purgeLocalStorage 清除失敗，嘗試直接操作本地存儲:', purgeError);
                // 備用清除機制：直接操作本地存儲
                // 清除租金收款記錄
                try {
                    const storedPayments = localStorage.getItem('rentalPayments');
                    if (storedPayments) {
                        const allPayments = JSON.parse(storedPayments);
                        const filteredPayments = allPayments.filter((payment) => payment.year !== yearToClear);
                        console.log(`備用方法 - 租金收款：從 ${allPayments.length} 筆過濾到 ${filteredPayments.length} 筆`);
                        localStorage.setItem('rentalPayments', JSON.stringify(filteredPayments));
                    }
                }
                catch (e) {
                    console.error('備用方法 - 清除租金收款時出錯:', e);
                }
                // 清除會員分潤記錄
                try {
                    const storedProfits = localStorage.getItem('memberProfits');
                    if (storedProfits) {
                        const allProfits = JSON.parse(storedProfits);
                        const filteredProfits = allProfits.filter((profit) => profit.year !== yearToClear);
                        console.log(`備用方法 - 會員分潤：從 ${allProfits.length} 筆過濾到 ${filteredProfits.length} 筆`);
                        localStorage.setItem('memberProfits', JSON.stringify(filteredProfits));
                    }
                }
                catch (e) {
                    console.error('備用方法 - 清除會員分潤時出錯:', e);
                }
                console.log(`備用方法 - ${yearToClear} 年度的數據已從本地存儲中清除`);
            }
            // 重新載入資料
            console.log('重新載入資料...');
            await loadData();
            console.log('資料重新載入完成');
            // 清除選擇的年份和關閉對話框
            setYearToClear(null);
            setClearConfirmOpen(false);
            // 顯示成功通知
            enqueueSnackbar(`${yearToClear}年度的歷史記錄已清除`, { variant: 'success' });
            // 強制刷新頁面 (可以解決部分緩存問題)
            setTimeout(() => {
                console.log('使用路由導航...');
                window.location.href = '#/investment/history';
            }, 500);
        }
        catch (error) {
            console.error('清除資料失敗:', error);
            enqueueSnackbar('清除資料失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
            console.log(`${yearToClear} 年度的歷史記錄清除操作完成`);
        }
    };
    const handleYearFilterChange = (event) => {
        setYearFilter(event.target.value);
    };
    const handleClearAllData = async () => {
        setLoading(true);
        try {
            // 清除所有本地存儲資料
            localStorage.removeItem('investments');
            localStorage.removeItem('rentalStandards');
            localStorage.removeItem('rentalPayments');
            localStorage.removeItem('memberProfits');
            localStorage.removeItem('profitSharingStandards');
            // 刷新本地緩存
            await services_1.ApiService.getInvestments();
            enqueueSnackbar('所有資料已清除', { variant: 'success' });
            // 延遲重新載入頁面
            setTimeout(() => {
                console.log('使用路由導航...');
                window.location.href = '#/investment/history';
            }, 500);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : '未知錯誤';
            console.error('清除資料失敗:', errorMsg);
            enqueueSnackbar(`清除資料失敗: ${errorMsg}`, { variant: 'error' });
            setError(`清除資料失敗: ${errorMsg}`);
        }
        finally {
            setLoading(false);
            setConfirmClearDialogOpen(false);
            setConfirmText('');
        }
    };
    const handleClearHistoryData = async () => {
        if (!yearFilter) {
            enqueueSnackbar('請選擇要清除的年度', { variant: 'error' });
            return;
        }
        setLoading(true);
        try {
            // 清除指定年度的租金收款和分潤資料
            const rentalPayments = await services_1.ApiService.getRentalPayments();
            const memberProfits = await services_1.ApiService.getMemberProfits();
            // 過濾出非選定年度的資料
            const filteredRentalPayments = rentalPayments.filter(p => p.year !== yearFilter);
            const filteredMemberProfits = memberProfits.filter(p => p.year !== yearFilter);
            // 保存到本地存儲
            localStorage.setItem('rentalPayments', JSON.stringify(filteredRentalPayments));
            localStorage.setItem('memberProfits', JSON.stringify(filteredMemberProfits));
            enqueueSnackbar(`${yearFilter} 年度的租金收款和分潤資料已清除`, { variant: 'success' });
            // 延遲重新載入頁面
            setTimeout(() => {
                console.log('使用路由導航...');
                window.location.href = '#/investment/history';
            }, 500);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : '未知錯誤';
            console.error('清除歷史資料失敗:', errorMsg);
            enqueueSnackbar(`清除歷史資料失敗: ${errorMsg}`, { variant: 'error' });
            setError(`清除歷史資料失敗: ${errorMsg}`);
        }
        finally {
            setLoading(false);
            handleCloseDialog();
        }
    };
    const handleCloseDialog = () => {
        setClearDialogOpen(false);
    };
    const handleConfirmClick = () => {
        setClearDialogOpen(false);
        setConfirmClearDialogOpen(true);
    };
    const handleCloseConfirmDialog = () => {
        setConfirmClearDialogOpen(false);
        setConfirmText('');
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {});
    if (error)
        return (0, jsx_runtime_1.jsx)(ErrorAlert_1.default, { message: error });
    const history = getFilteredHistory();
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3, display: 'flex', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "\u6295\u8CC7\u6B77\u53F2\u8A18\u9304" }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { minWidth: 120, mr: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "year-select-label", children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "year-select-label", id: "year-select", name: "year-select", value: selectedYear, label: "\u5E74\u5EA6", onChange: (e) => setSelectedYear(e.target.value), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "all", children: "\u5168\u90E8" }), yearlyStats.map((stat) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: stat.year.toString(), children: stat.year }, stat.year)))] })] }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", color: "error", startIcon: (0, jsx_runtime_1.jsx)(Delete_1.default, {}), onClick: handleClearClick, id: "clear-history-btn", "aria-label": "\u6E05\u9664\u6B77\u53F2\u8CC7\u6599", children: "\u6E05\u9664\u6B77\u53F2\u8CC7\u6599" })] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: yearlyStats.map((stat) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 4, children: (0, jsx_runtime_1.jsx)(material_1.Card, { children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", gutterBottom: true, children: [stat.year, " \u5E74\u5EA6\u7D71\u8A08"] }), (0, jsx_runtime_1.jsx)(material_1.Table, { size: "small", children: (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5DF2\u6536\u79DF\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stat.collectedRental) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5DF2\u767C\u653E\u5206\u6F64" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stat.paidProfit) })] }), (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6DE8\u6536\u5165" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(stat.collectedRental - stat.paidProfit) })] })] }) })] }) }) }, stat.year))) }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5E74\u6708" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [history.map((record, index) => {
                                    const investment = investments.find(i => i.id === record.investmentId);
                                    return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: new Date(record.date).toLocaleDateString('zh-TW') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: `${record.year}年${record.month}月` }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: record.type }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(record.amount) })] }, index));
                                }), history.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 5, align: "center", children: "\u5C1A\u7121\u6B77\u53F2\u8A18\u9304" }) }))] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: clearConfirmOpen, onClose: () => setClearConfirmOpen(false), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u6E05\u9664\u6B77\u53F2\u8CC7\u6599" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.DialogContentText, { children: ["\u60A8\u78BA\u5B9A\u8981\u6E05\u9664 ", yearToClear, " \u5E74\u5EA6\u7684\u6240\u6709\u6B77\u53F2\u8CC7\u6599\u55CE\uFF1F\u6B64\u64CD\u4F5C\u5C07\u522A\u9664\u6240\u6709\u79DF\u91D1\u6536\u6B3E\u548C\u6703\u54E1\u5206\u6F64\u8A18\u9304\uFF0C\u4E14\u7121\u6CD5\u6062\u5FA9\u3002"] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setClearConfirmOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClearConfirm, color: "error", variant: "contained", children: "\u78BA\u8A8D\u6E05\u9664" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 4, md: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u9078\u64C7\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: yearFilter, onChange: handleYearFilterChange, label: "\u9078\u64C7\u5E74\u5EA6", children: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: year, children: year }, year))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 4, md: 3, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", color: "warning", onClick: handleClearClick, fullWidth: true, sx: { height: '100%' }, children: "\u6E05\u9664\u6B77\u53F2\u8CC7\u6599" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 4, md: 3, children: (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u8B66\u544A\uFF1A\u6B64\u64CD\u4F5C\u5C07\u6E05\u9664\u6240\u6709\u6295\u8CC7\u3001\u79DF\u91D1\u3001\u5206\u6F64\u8CC7\u6599\uFF01\u50C5\u7528\u65BC\u6E2C\u8A66\u74B0\u5883", children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "error", onClick: () => setConfirmClearDialogOpen(true), fullWidth: true, sx: { height: '100%' }, startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.WarningAmber, {}), children: "\u6E05\u9664\u6240\u6709\u8CC7\u6599" }) }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: clearDialogOpen, onClose: handleCloseDialog, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u6E05\u9664\u6B77\u53F2\u8CC7\u6599" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.DialogContentText, { children: ["\u78BA\u5B9A\u8981\u6E05\u9664 ", yearFilter, " \u5E74\u5EA6\u7684\u6240\u6709\u6B77\u53F2\u8CC7\u6599\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u64A4\u6D88\u3002"] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleConfirmClick, color: "warning", children: "\u78BA\u8A8D\u6E05\u9664" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: confirmClearDialogOpen, onClose: handleCloseConfirmDialog, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u5371\u96AA\u64CD\u4F5C\u78BA\u8A8D" }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: [(0, jsx_runtime_1.jsxs)(material_1.DialogContentText, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(icons_material_1.WarningAmber, { color: "error", sx: { verticalAlign: 'middle', mr: 1 } }), "\u6B64\u64CD\u4F5C\u5C07\u6E05\u9664\u6240\u6709\u6295\u8CC7\u9805\u76EE\u3001\u79DF\u91D1\u6536\u6B3E\u3001\u5206\u6F64\u8CC7\u6599\u7B49\u7CFB\u7D71\u6578\u64DA\uFF0C\u4E14\u7121\u6CD5\u6062\u5FA9\uFF01"] }), (0, jsx_runtime_1.jsx)(material_1.DialogContentText, { sx: { mb: 2 }, children: "\u8ACB\u8F38\u5165\u300C\u78BA\u8A8D\u6E05\u9664\u300D\u4E26\u9EDE\u64CA\u78BA\u8A8D\u6309\u9215\u4EE5\u7E7C\u7E8C\u64CD\u4F5C\uFF1A" }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, value: confirmText, onChange: (e) => setConfirmText(e.target.value), placeholder: "\u78BA\u8A8D\u6E05\u9664" })] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseConfirmDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClearAllData, color: "error", disabled: confirmText !== '確認清除', children: "\u78BA\u8A8D\u6E05\u9664\u6240\u6709\u8CC7\u6599" })] })] })] }));
};
exports.default = HistoryTab;
