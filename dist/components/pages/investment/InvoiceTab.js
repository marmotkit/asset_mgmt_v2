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
const notistack_1 = require("notistack");
const LoadingSpinner_1 = __importDefault(require("../../common/LoadingSpinner"));
const ErrorAlert_1 = __importDefault(require("../../common/ErrorAlert"));
const react_router_dom_1 = require("react-router-dom");
// 發票類型枚舉
var InvoiceType;
(function (InvoiceType) {
    InvoiceType["INVOICE2"] = "invoice2";
    InvoiceType["INVOICE3"] = "invoice3";
    InvoiceType["RECEIPT"] = "receipt";
})(InvoiceType || (InvoiceType = {}));
const InvoiceTab = ({ investments }) => {
    const [selectedYear, setSelectedYear] = (0, react_1.useState)(new Date().getFullYear());
    const [rentalPayments, setRentalPayments] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [typeDialogOpen, setTypeDialogOpen] = (0, react_1.useState)(false);
    const [selectedPayment, setSelectedPayment] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        type: InvoiceType.RECEIPT,
        paymentId: '',
        buyerName: '',
        buyerTaxId: '',
        amount: 0,
        itemName: '租金收入',
        date: new Date().toISOString().split('T')[0],
        copies: 1,
        note: '',
        investmentId: ''
    });
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(() => {
        loadData();
    }, [selectedYear]);
    const loadData = async () => {
        setLoading(true);
        try {
            const payments = await services_1.ApiService.getRentalPayments(undefined, selectedYear);
            const paidPayments = payments.filter(p => p.status === rental_1.PaymentStatus.PAID);
            // 載入所有發票資訊
            const allInvoices = await services_1.ApiService.getInvoices();
            // 為每個付款項目添加發票資訊
            const paymentsWithInvoices = paidPayments.map(payment => {
                const paymentInvoices = allInvoices.filter(inv => inv.paymentId === payment.id);
                return {
                    ...payment,
                    invoices: paymentInvoices
                };
            });
            setRentalPayments(paymentsWithInvoices);
        }
        catch (err) {
            setError('載入資料失敗');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateInvoice = async (payment) => {
        setSelectedPayment(payment);
        setTypeDialogOpen(true);
    };
    const handleTypeSelect = async (type) => {
        if (!selectedPayment)
            return;
        setTypeDialogOpen(false);
        try {
            // 獲取最新的租賃標準資訊
            const standards = await services_1.ApiService.getRentalStandards(selectedPayment.investmentId);
            // 創建付款日期
            const paymentDate = new Date(selectedPayment.year, selectedPayment.month - 1, 1);
            // 查找適用的租賃標準
            const applicableStandard = standards.find(s => {
                const startDate = new Date(s.startDate);
                const endDate = s.endDate ? new Date(s.endDate) : new Date('9999-12-31');
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
                renterInfo.renterName = latestStandard.renterName || '';
                renterInfo.renterTaxId = latestStandard.renterTaxId || '';
            }
            // 設置表單資料
            setFormData({
                type: type,
                paymentId: selectedPayment.id,
                buyerName: selectedPayment.renterName || renterInfo.renterName,
                buyerTaxId: selectedPayment.renterTaxId || renterInfo.renterTaxId,
                amount: selectedPayment.amount,
                itemName: '租金收入',
                date: new Date().toISOString().split('T')[0],
                copies: 1,
                note: `${selectedPayment.year}年${selectedPayment.month}月租金`,
                investmentId: selectedPayment.investmentId
            });
            setDialogOpen(true);
        }
        catch (error) {
            console.error('載入租賃標準資訊失敗:', error);
            // 如果無法載入租賃標準，仍然顯示現有資訊
            setFormData({
                type: type,
                paymentId: selectedPayment.id,
                buyerName: selectedPayment.renterName || '',
                buyerTaxId: selectedPayment.renterTaxId || '',
                amount: selectedPayment.amount,
                itemName: '租金收入',
                date: new Date().toISOString().split('T')[0],
                copies: 1,
                note: `${selectedPayment.year}年${selectedPayment.month}月租金`,
                investmentId: selectedPayment.investmentId
            });
            setDialogOpen(true);
        }
    };
    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedPayment(null);
    };
    const handleFormSubmit = async () => {
        try {
            if (!selectedPayment)
                return;
            // 檢查必填欄位
            if (!formData.buyerName) {
                enqueueSnackbar('請輸入買受人名稱', { variant: 'error' });
                return;
            }
            if (formData.type !== InvoiceType.RECEIPT && !formData.buyerTaxId) {
                enqueueSnackbar('請輸入統一編號', { variant: 'error' });
                return;
            }
            // 建立發票
            await services_1.ApiService.createInvoice({
                type: formData.type,
                paymentId: formData.paymentId,
                buyerName: formData.buyerName,
                buyerTaxId: formData.buyerTaxId,
                amount: formData.amount,
                itemName: formData.itemName,
                date: formData.date,
                note: formData.note,
                investmentId: formData.investmentId
            });
            enqueueSnackbar('發票建立成功', { variant: 'success' });
            handleDialogClose();
            loadData(); // 重新載入資料
        }
        catch (err) {
            enqueueSnackbar('發票建立失敗', { variant: 'error' });
        }
    };
    const handlePrint = async (payment, invoiceId, type) => {
        try {
            // 導航到列印頁面
            navigate(`/investment/invoice/print/${invoiceId}`);
        }
        catch (err) {
            enqueueSnackbar('列印失敗', { variant: 'error' });
        }
    };
    const handleDeleteInvoice = async (invoiceId) => {
        try {
            if (window.confirm('確定要刪除此發票/收據嗎？')) {
                await services_1.ApiService.deleteInvoice(invoiceId);
                enqueueSnackbar('刪除成功', { variant: 'success' });
                loadData(); // 重新載入資料
            }
        }
        catch (err) {
            enqueueSnackbar('刪除失敗', { variant: 'error' });
        }
    };
    const handleSelectChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
    };
    const handleTextChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
    };
    const handleNumberChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: Number(event.target.value)
        });
    };
    const getInvestmentName = (investmentId) => {
        const investment = investments.find(inv => inv.id === investmentId);
        return investment ? investment.name : '未知項目';
    };
    if (loading)
        return (0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {});
    if (error)
        return (0, jsx_runtime_1.jsx)(ErrorAlert_1.default, { message: error });
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u767C\u7968\u7BA1\u7406" }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { sx: { minWidth: 120 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "year-select-label", children: "\u5E74\u5EA6" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "year-select-label", id: "year-select", value: selectedYear, label: "\u5E74\u5EA6", onChange: (e) => setSelectedYear(Number(e.target.value)), children: Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: year, children: year }, year))) })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6295\u8CC7\u9805\u76EE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5E74\u6708" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u767C\u7968\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5DF2\u958B\u7ACB\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: rentalPayments.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 6, align: "center", children: "\u7121\u8CC7\u6599" }) })) : (rentalPayments.map((payment) => {
                                const hasInvoice = payment.hasInvoice;
                                const invoiceTypes = payment.invoices ? payment.invoices.map((inv) => inv.type) : [];
                                const canCreateInvoice2 = !invoiceTypes.includes(InvoiceType.INVOICE2);
                                const canCreateInvoice3 = !invoiceTypes.includes(InvoiceType.INVOICE3);
                                const canCreateReceipt = !invoiceTypes.includes(InvoiceType.RECEIPT);
                                return ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getInvestmentName(payment.investmentId) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: `${payment.year}年${payment.month}月` }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, format_1.formatCurrency)(payment.amount) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: hasInvoice ? '已開立' : '未開立' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: invoiceTypes.length > 0 ? ((0, jsx_runtime_1.jsx)(material_1.Box, { children: invoiceTypes.map((type) => ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: type === InvoiceType.INVOICE2 ? '二聯式發票' :
                                                        type === InvoiceType.INVOICE3 ? '三聯式發票' : '收據', size: "small", sx: { mr: 0.5, mb: 0.5 } }, type))) })) : '無' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 1 }, children: [(canCreateInvoice2 || canCreateInvoice3 || canCreateReceipt) && ((0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", size: "small", onClick: () => handleCreateInvoice(payment), children: "\u958B\u7ACB\u767C\u7968/\u6536\u64DA" })), payment.invoices && payment.invoices.map((invoice) => ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 0.5 }, children: [(0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: `列印${invoice.type === InvoiceType.RECEIPT ? '收據' : '發票'}`, children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handlePrint(payment, invoice.id, invoice.type), children: (0, jsx_runtime_1.jsx)(icons_material_1.Print, { fontSize: "small" }) }) }), (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: `刪除${invoice.type === InvoiceType.RECEIPT ? '收據' : '發票'}`, children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleDeleteInvoice(invoice.id), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, { fontSize: "small" }) }) })] }, invoice.id)))] }) })] }, payment.id));
                            })) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: handleDialogClose, maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsxs)(material_1.DialogTitle, { children: ["\u958B\u7ACB", formData.type === InvoiceType.RECEIPT ? '收據' : '發票'] }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, required: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "invoice-type-label", children: "\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "invoice-type-label", id: "invoice-type", name: "type", value: formData.type, label: "\u985E\u578B", onChange: handleSelectChange('type'), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: InvoiceType.INVOICE2, children: "\u4E8C\u806F\u5F0F\u767C\u7968" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: InvoiceType.INVOICE3, children: "\u4E09\u806F\u5F0F\u767C\u7968" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: InvoiceType.RECEIPT, children: "\u6536\u64DA" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "buyer-name", name: "buyerName", label: "\u8CB7\u53D7\u4EBA\u540D\u7A31", value: formData.buyerName, onChange: handleTextChange('buyerName'), required: true }) }), formData.type !== InvoiceType.RECEIPT && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "buyer-tax-id", name: "buyerTaxId", label: "\u7D71\u4E00\u7DE8\u865F", value: formData.buyerTaxId, onChange: handleTextChange('buyerTaxId'), required: true }) })), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "item-name", name: "itemName", label: "\u54C1\u540D", value: formData.itemName, onChange: handleTextChange('itemName'), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "amount", name: "amount", label: "\u91D1\u984D", type: "number", value: formData.amount, onChange: handleNumberChange('amount'), required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "date", name: "date", label: "\u65E5\u671F", type: "date", value: formData.date, onChange: handleTextChange('date'), InputLabelProps: { shrink: true }, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "copies", name: "copies", label: "\u4EFD\u6578", type: "number", value: formData.copies, onChange: handleNumberChange('copies'), required: true, inputProps: { min: 1 } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, id: "note", name: "note", label: "\u5099\u8A3B", multiline: true, rows: 3, value: formData.note, onChange: handleTextChange('note') }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDialogClose, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleFormSubmit, variant: "contained", children: "\u78BA\u8A8D" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: typeDialogOpen, onClose: () => setTypeDialogOpen(false), maxWidth: "xs", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u9078\u64C7\u958B\u7ACB\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [selectedPayment && selectedPayment.invoices && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u5DF2\u958B\u7ACB\u985E\u578B\uFF1A", selectedPayment.invoices.map((inv) => ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: inv.type === InvoiceType.INVOICE2 ? '二聯式發票' :
                                                    inv.type === InvoiceType.INVOICE3 ? '三聯式發票' : '收據', size: "small", sx: { ml: 1 } }, inv.type)))] }) })), selectedPayment && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [!selectedPayment.invoices || !selectedPayment.invoices.some(inv => inv.type === InvoiceType.INVOICE2) ? ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Button, { fullWidth: true, variant: "outlined", onClick: () => handleTypeSelect(InvoiceType.INVOICE2), children: "\u4E8C\u806F\u5F0F\u767C\u7968" }) })) : null, !selectedPayment.invoices || !selectedPayment.invoices.some(inv => inv.type === InvoiceType.INVOICE3) ? ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Button, { fullWidth: true, variant: "outlined", onClick: () => handleTypeSelect(InvoiceType.INVOICE3), children: "\u4E09\u806F\u5F0F\u767C\u7968" }) })) : null, !selectedPayment.invoices || !selectedPayment.invoices.some(inv => inv.type === InvoiceType.RECEIPT) ? ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Button, { fullWidth: true, variant: "outlined", onClick: () => handleTypeSelect(InvoiceType.RECEIPT), children: "\u6536\u64DA" }) })) : null] }))] }) }), (0, jsx_runtime_1.jsx)(material_1.DialogActions, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setTypeDialogOpen(false), children: "\u53D6\u6D88" }) })] })] }));
};
exports.default = InvoiceTab;
