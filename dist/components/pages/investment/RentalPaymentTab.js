"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const rental_1 = require("../../../types/rental");
const services_1 = require("../../../services");
const format_1 = require("../../../utils/format");
const LoadingSpinner_1 = __importDefault(require("../../common/LoadingSpinner"));
const ErrorAlert_1 = __importDefault(require("../../common/ErrorAlert"));
const notistack_1 = require("notistack");
const RentalPaymentTab = ({ investments }) => {
    const [rentalPayments, setRentalPayments] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [selectedPayment, setSelectedPayment] = (0, react_1.useState)(null);
    const [yearFilter, setYearFilter] = (0, react_1.useState)(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = (0, react_1.useState)(new Date().getMonth() + 1);
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    const [formData, setFormData] = (0, react_1.useState)({
        investmentId: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        amount: 0,
        status: rental_1.PaymentStatus.PENDING,
        paymentMethod: rental_1.PaymentMethod.BANK_TRANSFER,
        paymentDate: '',
        renterName: '',
        payerName: '',
        note: '',
    });
    // 新增投資項目選擇相關狀態
    const [selectionDialogOpen, setSelectionDialogOpen] = (0, react_1.useState)(false);
    const [investmentSelections, setInvestmentSelections] = (0, react_1.useState)([]);
    // 添加清除對話框狀態
    const [clearDialogOpen, setClearDialogOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        loadData();
    }, [yearFilter, monthFilter]);
    const loadData = async () => {
        setLoading(true);
        try {
            // 載入租金收款資料
            const paymentsData = await services_1.ApiService.getRentalPayments(undefined, yearFilter, monthFilter);
            // 載入所有相關的租賃標準
            const investmentIds = Array.from(new Set(paymentsData.map(p => p.investmentId)));
            const standardsPromises = investmentIds.map(investmentId => services_1.ApiService.getRentalStandards(investmentId));
            const standardsResults = await Promise.all(standardsPromises);
            const standards = standardsResults.reduce((acc, curr) => acc.concat(curr), []);
            // 更新租金收款資料，確保承租人資訊正確
            const updatedPayments = paymentsData.map(payment => {
                const applicableStandard = standards.find(s => {
                    const startDate = new Date(s.startDate);
                    const endDate = s.endDate ? new Date(s.endDate) : new Date('9999-12-31');
                    const paymentDate = new Date(payment.year, payment.month - 1, 1);
                    return s.investmentId === payment.investmentId &&
                        startDate <= paymentDate && paymentDate <= endDate;
                });
                return {
                    ...payment,
                    renterName: payment.renterName || (applicableStandard === null || applicableStandard === void 0 ? void 0 : applicableStandard.renterName) || '',
                    renterTaxId: payment.renterTaxId || (applicableStandard === null || applicableStandard === void 0 ? void 0 : applicableStandard.renterTaxId) || '',
                    payerName: payment.payerName || payment.renterName || (applicableStandard === null || applicableStandard === void 0 ? void 0 : applicableStandard.renterName) || ''
                };
            });
            setRentalPayments(updatedPayments);
        }
        catch (err) {
            setError('載入資料失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleGeneratePayments = async () => {
        // 檢查是否有選擇年度
        if (!yearFilter) {
            enqueueSnackbar('請選擇要生成的年度', { variant: 'error' });
            return;
        }
        try {
            // 載入最新的收款資料以檢查重複
            const existingPayments = await services_1.ApiService.getRentalPayments(undefined, yearFilter);
            // 準備投資項目選擇清單
            const selections = investments.map(inv => ({
                id: inv.id,
                name: inv.name,
                selected: false,
                hasExistingPayments: existingPayments.some(p => p.investmentId === inv.id)
            }));
            setInvestmentSelections(selections);
            setSelectionDialogOpen(true);
        }
        catch (err) {
            enqueueSnackbar('生成租金收款項目失敗', { variant: 'error' });
        }
    };
    // 添加清除租金項目的處理函數
    const handleClearPayments = () => {
        setClearDialogOpen(true);
    };
    // 確認清除租金項目
    const handleClearConfirm = async () => {
        try {
            await services_1.ApiService.clearRentalPayments(yearFilter, monthFilter);
            enqueueSnackbar(`已清除 ${yearFilter}年${monthFilter ? monthFilter + '月' : ''}的租金項目`, { variant: 'success' });
            await loadData();
        }
        catch (err) {
            enqueueSnackbar('清除租金項目失敗', { variant: 'error' });
        }
        finally {
            setClearDialogOpen(false);
        }
    };
    const handleGenerateConfirm = async () => {
        setSelectionDialogOpen(false);
        setLoading(true);
        let hasError = false;
        let errorMessage = '';
        try {
            // 取得選擇的投資項目
            const selectedInvestments = investmentSelections.filter(inv => inv.selected);
            // 依序處理每個選擇的投資項目
            for (const inv of selectedInvestments) {
                try {
                    await services_1.ApiService.generateRentalPayments(inv.id, yearFilter);
                }
                catch (error) {
                    hasError = true;
                    errorMessage += `${inv.name}: ${error instanceof Error ? error.message : '生成失敗'}\n`;
                }
            }
            if (hasError) {
                enqueueSnackbar(errorMessage, { variant: 'warning' });
            }
            else {
                enqueueSnackbar('租金收款項目生成完成', { variant: 'success' });
            }
            await loadData();
        }
        catch (error) {
            enqueueSnackbar('生成租金收款項目時發生錯誤', { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const handleEditPayment = async (payment) => {
        try {
            // 獲取最新的租賃標準資訊
            const standards = await services_1.ApiService.getRentalStandards(payment.investmentId);
            console.log('所有租賃標準:', standards);
            // 創建付款日期
            const paymentDate = new Date(payment.year, payment.month - 1, 1);
            console.log('付款日期:', paymentDate);
            // 查找適用的租賃標準
            const applicableStandard = standards.find(s => {
                const startDate = new Date(s.startDate);
                const endDate = s.endDate ? new Date(s.endDate) : new Date('9999-12-31');
                console.log('比較日期:', {
                    標準ID: s.id,
                    標準開始日期: startDate,
                    標準結束日期: endDate,
                    付款日期: paymentDate,
                    是否適用: startDate <= paymentDate && paymentDate <= endDate
                });
                return startDate <= paymentDate && paymentDate <= endDate;
            });
            // 如果沒有找到適用的標準，使用最新的標準
            let renterInfo = {
                renterName: '',
                renterTaxId: ''
            };
            if (applicableStandard) {
                renterInfo.renterName = applicableStandard.renterName || '';
                renterInfo.renterTaxId = applicableStandard.renterTaxId || '';
            }
            else if (standards.length > 0) {
                // 如果沒有找到適用的標準，使用最新的標準
                const latestStandard = standards.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
                console.log('使用最新的標準:', latestStandard);
                renterInfo.renterName = latestStandard.renterName || '';
                renterInfo.renterTaxId = latestStandard.renterTaxId || '';
            }
            console.log('最終承租人資訊:', {
                payment,
                applicableStandard,
                renterInfo,
                renterName: payment.renterName || renterInfo.renterName
            });
            setSelectedPayment(payment);
            setFormData({
                ...payment, // 保留所有原始資料
                paymentMethod: payment.paymentMethod || rental_1.PaymentMethod.BANK_TRANSFER,
                paymentDate: payment.paymentDate || '',
                renterName: payment.renterName || renterInfo.renterName,
                renterTaxId: payment.renterTaxId || renterInfo.renterTaxId,
                payerName: payment.payerName || payment.renterName || renterInfo.renterName,
                note: payment.note || ''
            });
            setDialogOpen(true);
        }
        catch (error) {
            console.error('載入租賃標準資訊失敗:', error);
            // 如果無法載入租賃標準，仍然顯示現有資訊
            setSelectedPayment(payment);
            setFormData({
                ...payment, // 保留所有原始資料
                paymentMethod: payment.paymentMethod || rental_1.PaymentMethod.BANK_TRANSFER,
                paymentDate: payment.paymentDate || '',
                renterName: payment.renterName || '',
                renterTaxId: payment.renterTaxId || '',
                payerName: payment.payerName || payment.renterName || '',
                note: payment.note || ''
            });
            setDialogOpen(true);
        }
    };
    const handleSave = async () => {
        if (!formData.investmentId || !formData.amount || !formData.status) {
            setError('請填寫必要欄位');
            return;
        }
        setLoading(true);
        try {
            if (selectedPayment) {
                await services_1.ApiService.updateRentalPayment(selectedPayment.id, formData);
            }
            await loadData();
            setDialogOpen(false);
        }
        catch (err) {
            setError('儲存租金收款項目失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleInputChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
    };
    const handleSelectChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
    };
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
                return '已收款';
            case rental_1.PaymentStatus.PENDING:
                return '待收款';
            case rental_1.PaymentStatus.OVERDUE:
                return '逾期';
            default:
                return '未知';
        }
    };
    const handleDeletePayment = async (payment) => {
        if (!window.confirm('確定要刪除此筆租金收款項目？'))
            return;
        setLoading(true);
        try {
            await services_1.ApiService.deleteRentalPayment(payment.id);
            await loadData();
        }
        catch (err) {
            setError('刪除租金收款項目失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSelectionChange = (investmentId) => {
        setInvestmentSelections(prev => prev.map(inv => inv.id === investmentId
            ? { ...inv, selected: !inv.selected }
            : inv));
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {});
    if (error)
        return (0, jsx_runtime_1.jsx)(ErrorAlert_1.default, { message: error });
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u79DF\u91D1\u6536\u6B3E\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { mr: 2, minWidth: 100 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "year-filter-label", htmlFor: "year-filter", children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "year-filter-label", id: "year-filter", name: "year-filter", value: yearFilter.toString(), label: "\u5E74\u5EA6", onChange: (e) => setYearFilter(Number(e.target.value)), inputProps: {
                                            'aria-labelledby': 'year-filter-label'
                                        }, children: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: year, id: `year-option-${year}`, children: year }, year))) })] }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { mr: 2, minWidth: 100 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "month-filter-label", htmlFor: "month-filter", children: "\u6708\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "month-filter-label", id: "month-filter", name: "month-filter", value: monthFilter.toString(), label: "\u6708\u4EFD", onChange: (e) => setMonthFilter(Number(e.target.value)), inputProps: {
                                            'aria-labelledby': 'month-filter-label'
                                        }, children: Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: month, id: `month-option-${month}`, children: month }, month))) })] }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Refresh, {}), onClick: handleGeneratePayments, sx: { mr: 1 }, "aria-label": "\u751F\u6210\u6536\u6B3E\u9805\u76EE", children: "\u751F\u6210\u6536\u6B3E\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", color: "error", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}), onClick: handleClearPayments, children: "\u6E05\u9664\u79DF\u91D1\u9805\u76EE" })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5E74\u6708" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u79DF\u91D1\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6536\u6B3E\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6536\u6B3E\u65B9\u5F0F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6536\u6B3E\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u627F\u79DF\u4EBA" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7E73\u6B3E\u4EBA" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5099\u8A3B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [rentalPayments.map((payment) => {
                                    const investment = investments.find((inv) => inv.id === payment.investmentId);
                                    return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: `${payment.year}年${payment.month}月` }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, format_1.formatCurrency)(payment.amount) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusText(payment.status), color: getStatusColor(payment.status), size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.paymentMethod === rental_1.PaymentMethod.CASH ? '現金' :
                                                    payment.paymentMethod === rental_1.PaymentMethod.BANK_TRANSFER ? '銀行轉帳' :
                                                        payment.paymentMethod === rental_1.PaymentMethod.CHECK ? '支票' : '其他' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.paymentDate ? (0, format_1.formatDate)(payment.paymentDate) : '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.renterName || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.payerName || payment.renterName || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.note || '-' }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEditPayment(payment), "aria-label": `編輯 ${(investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目'} ${payment.year}年${payment.month}月 的收款項目`, children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleDeletePayment(payment), color: "error", "aria-label": `刪除 ${(investment === null || investment === void 0 ? void 0 : investment.name) || '未知項目'} ${payment.year}年${payment.month}月 的收款項目`, children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, payment.id));
                                }), rentalPayments.length === 0 && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 10, align: "center", children: "\u5C1A\u7121\u79DF\u91D1\u6536\u6B3E\u8CC7\u6599" }) }))] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "sm", fullWidth: true, "aria-labelledby": "edit-rental-payment-title", disableEnforceFocus: true, keepMounted: false, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { id: "edit-rental-payment-title", children: "\u7DE8\u8F2F\u79DF\u91D1\u6536\u6B3E\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, required: true, disabled: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "rental-investment-label", htmlFor: "rental-investment", children: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "rental-investment-label", id: "rental-investment", name: "investmentId", value: formData.investmentId, label: "\u6295\u8CC7\u9805\u76EE", onChange: handleSelectChange('investmentId'), inputProps: {
                                                    'aria-labelledby': 'rental-investment-label'
                                                }, children: investments.map((investment) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: investment.id, id: `investment-option-${investment.id}`, children: investment.name }, investment.id))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "rental-year", name: "year", label: "\u5E74\u5EA6", value: formData.year, disabled: true, InputLabelProps: {
                                            htmlFor: "rental-year"
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "rental-month", name: "month", label: "\u6708\u4EFD", value: formData.month, disabled: true, InputLabelProps: {
                                            htmlFor: "rental-month"
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "rental-amount", name: "amount", label: "\u79DF\u91D1\u91D1\u984D", type: "number", value: formData.amount, onChange: handleInputChange('amount'), required: true, InputLabelProps: {
                                            htmlFor: "rental-amount"
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, required: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "rental-status-label", htmlFor: "rental-status", children: "\u6536\u6B3E\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "rental-status-label", id: "rental-status", name: "status", value: formData.status, label: "\u6536\u6B3E\u72C0\u614B", onChange: handleSelectChange('status'), inputProps: {
                                                    'aria-labelledby': 'rental-status-label'
                                                }, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentStatus.PENDING, id: "status-option-pending", children: "\u5F85\u6536\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentStatus.PAID, id: "status-option-paid", children: "\u5DF2\u6536\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentStatus.OVERDUE, id: "status-option-overdue", children: "\u903E\u671F" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "rental-payment-method-label", htmlFor: "rental-payment-method", children: "\u6536\u6B3E\u65B9\u5F0F" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "rental-payment-method-label", id: "rental-payment-method", name: "paymentMethod", value: formData.paymentMethod, label: "\u6536\u6B3E\u65B9\u5F0F", onChange: handleSelectChange('paymentMethod'), inputProps: {
                                                    'aria-labelledby': 'rental-payment-method-label'
                                                }, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.CASH, id: "payment-method-option-cash", children: "\u73FE\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.BANK_TRANSFER, id: "payment-method-option-bank", children: "\u9280\u884C\u8F49\u5E33" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.CHECK, id: "payment-method-option-check", children: "\u652F\u7968" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: rental_1.PaymentMethod.OTHER, id: "payment-method-option-other", children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "rental-payment-date", name: "paymentDate", label: "\u6536\u6B3E\u65E5\u671F", type: "date", value: formData.paymentDate, onChange: handleInputChange('paymentDate'), InputLabelProps: {
                                            shrink: true,
                                            htmlFor: "rental-payment-date"
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "rental-renter-name", name: "renterName", label: "\u627F\u79DF\u4EBA", value: formData.renterName, disabled: true, InputLabelProps: {
                                            htmlFor: "rental-renter-name"
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "rental-payer-name", name: "payerName", label: "\u7E73\u6B3E\u4EBA", value: formData.payerName, onChange: handleInputChange('payerName'), placeholder: "\u9810\u8A2D\u540C\u627F\u79DF\u4EBA", InputLabelProps: {
                                            htmlFor: "rental-payer-name"
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "rental-note", name: "note", label: "\u5099\u8A3B", multiline: true, rows: 3, value: formData.note, onChange: handleInputChange('note'), InputLabelProps: {
                                            htmlFor: "rental-note"
                                        } }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDialogOpen(false), "aria-label": "\u53D6\u6D88\u7DE8\u8F2F", tabIndex: 0, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", "aria-label": "\u5132\u5B58\u8B8A\u66F4", tabIndex: 0, children: "\u5132\u5B58" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: clearDialogOpen, onClose: () => setClearDialogOpen(false), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u6E05\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.DialogContentText, { children: ["\u78BA\u5B9A\u8981\u6E05\u9664 ", yearFilter, "\u5E74", monthFilter ? monthFilter + '月' : '', "\u7684\u6240\u6709\u79DF\u91D1\u9805\u76EE\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002"] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setClearDialogOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClearConfirm, color: "error", children: "\u78BA\u8A8D\u6E05\u9664" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: selectionDialogOpen, onClose: () => setSelectionDialogOpen(false), maxWidth: "sm", fullWidth: true, "aria-labelledby": "select-investments-title", disableEnforceFocus: true, keepMounted: false, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { id: "select-investments-title", children: "\u9078\u64C7\u8981\u751F\u6210\u6536\u6B3E\u9805\u76EE\u7684\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: investmentSelections.map((inv) => ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.FormControlLabel, { control: (0, jsx_runtime_1.jsx)(material_1.Checkbox, { id: `investment-selection-${inv.id}`, name: `investment-selection-${inv.id}`, checked: inv.selected, onChange: () => handleSelectionChange(inv.id), disabled: inv.hasExistingPayments }), label: inv.name, htmlFor: `investment-selection-${inv.id}` }), inv.hasExistingPayments && ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", color: "error", component: "span", children: "\uFF08\u5DF2\u5B58\u5728\u6536\u6B3E\u9805\u76EE\uFF09" }))] }, inv.id))) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setSelectionDialogOpen(false), "aria-label": "\u53D6\u6D88\u9078\u64C7", tabIndex: 0, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleGenerateConfirm, variant: "contained", disabled: !investmentSelections.some(inv => inv.selected), "aria-label": "\u78BA\u8A8D\u751F\u6210\u9078\u64C7\u7684\u6536\u6B3E\u9805\u76EE", tabIndex: 0, children: "\u751F\u6210" })] })] })] }));
};
exports.default = RentalPaymentTab;
