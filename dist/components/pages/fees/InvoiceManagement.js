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
exports.InvoiceManagement = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const DocumentIssue_1 = require("./DocumentIssue");
const invoiceService_1 = require("../../../services/invoiceService");
const feeHistoryService_1 = require("../../../services/feeHistoryService");
const documentService_1 = require("../../../services/documentService");
const api_service_1 = require("../../../services/api.service");
const DocumentListDialog = ({ open, onClose, memberId, memberName }) => {
    const [documents, setDocuments] = (0, react_1.useState)([]);
    const [selectedMemberId, setSelectedMemberId] = (0, react_1.useState)(memberId);
    const [selectedMemberName, setSelectedMemberName] = (0, react_1.useState)(memberName);
    const [members, setMembers] = (0, react_1.useState)([]);
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = (0, react_1.useState)(false);
    const [deletingDocument, setDeletingDocument] = (0, react_1.useState)(null);
    react_1.default.useEffect(() => {
        if (open) {
            loadMembers();
        }
    }, [open]);
    const loadMembers = async () => {
        try {
            // 從雲端資料庫獲取所有會員
            const allMembers = await api_service_1.ApiService.getUsers();
            // 獲取已收款的會費記錄
            const paidFees = await feeHistoryService_1.feeHistoryService.getHistories({
                status: '已收款'
            });
            // 只比對 memberNo
            const paidMemberNos = new Set(paidFees.map(fee => fee.memberId));
            const membersWithPaidFees = allMembers.filter(member => paidMemberNos.has(member.memberNo));
            setMembers(membersWithPaidFees);
        }
        catch (error) {
            console.error('載入會員資料失敗:', error);
            setSnackbar({
                open: true,
                message: '載入會員資料失敗',
                severity: 'error'
            });
        }
    };
    react_1.default.useEffect(() => {
        if (open && selectedMemberId) {
            loadDocuments();
        }
    }, [open, selectedMemberId]);
    const loadDocuments = async () => {
        try {
            const docs = await invoiceService_1.invoiceService.getDocuments({ memberId: selectedMemberId });
            setDocuments(docs);
        }
        catch (error) {
            console.error('載入文件失敗:', error);
            setSnackbar({
                open: true,
                message: '載入文件失敗',
                severity: 'error'
            });
        }
    };
    const handlePrint = async (doc) => {
        try {
            await documentService_1.documentService.printDocument(doc);
        }
        catch (error) {
            console.error('列印失敗:', error);
            setSnackbar({
                open: true,
                message: '列印失敗',
                severity: 'error'
            });
        }
    };
    const handleMemberSelect = (event) => {
        const selectedMember = members.find(m => m.id === event.target.value);
        if (selectedMember) {
            setSelectedMemberId(selectedMember.memberNo); // 使用 memberNo 而不是 UUID
            setSelectedMemberName(selectedMember.name);
        }
    };
    const handleDeleteClick = (doc) => {
        setDeletingDocument(doc);
        setDeleteConfirmOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (deletingDocument) {
            try {
                await invoiceService_1.invoiceService.deleteDocument(deletingDocument.id);
                await loadDocuments();
                setSnackbar({
                    open: true,
                    message: '刪除成功',
                    severity: 'success'
                });
            }
            catch (error) {
                console.error('刪除失敗:', error);
                setSnackbar({
                    open: true,
                    message: '刪除失敗',
                    severity: 'error'
                });
            }
        }
        setDeleteConfirmOpen(false);
        setDeletingDocument(null);
    };
    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setDeletingDocument(null);
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onClose, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsxs)(material_1.DialogTitle, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u5DF2\u958B\u7ACB\u767C\u7968/\u6536\u64DA\u5217\u8868" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", color: "textSecondary", children: selectedMemberId ?
                                    `會員：${selectedMemberName} (${selectedMemberId})` :
                                    '請選擇會員' })] }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { p: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u9078\u64C7\u6703\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: selectedMemberId, label: "\u9078\u64C7\u6703\u54E1", onChange: (e) => handleMemberSelect(e), children: members.map((member) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: member.id, children: [member.name, " (", member.memberNo, ")"] }, member.id))) })] }), selectedMemberId && ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: documents.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 5, align: "center", children: "\u5C1A\u672A\u958B\u7ACB\u4EFB\u4F55\u767C\u7968\u6216\u6536\u64DA" }) })) : (documents.map((doc) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: doc.type === '收據' ? '收據' :
                                                                    doc.type === '二聯式' ? '二聯式（存根聯、收執聯）' :
                                                                        '三聯式（存根聯、報帳聯、扣抵聯）', color: doc.type === '收據' ? 'default' : 'primary', size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: doc.type === '收據'
                                                                ? doc.receiptNumber
                                                                : doc.invoiceNumber }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: doc.date ?
                                                                new Date(doc.date).toLocaleDateString('zh-TW', {
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit'
                                                                }) :
                                                                '無日期' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: doc.amount.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", title: "\u5217\u5370", onClick: () => handlePrint(doc), children: (0, jsx_runtime_1.jsx)(icons_material_1.Print, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "error", onClick: () => handleDeleteClick(doc), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] }) })] }, doc.id)))) })] }) }))] }) }), (0, jsx_runtime_1.jsx)(material_1.DialogActions, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onClose, children: "\u95DC\u9589" }) })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: deleteConfirmOpen, onClose: handleDeleteCancel, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.DialogContentText, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u9019\u500B\u6587\u4EF6\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002" }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteCancel, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, color: "error", variant: "contained", children: "\u522A\u9664" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 6000, onClose: () => setSnackbar({ ...snackbar, open: false }), children: (0, jsx_runtime_1.jsx)(material_1.Alert, { onClose: () => setSnackbar({ ...snackbar, open: false }), severity: snackbar.severity, sx: { width: '100%' }, children: snackbar.message }) })] }));
};
const InvoiceManagement = () => {
    const [payments, setPayments] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [openDialog, setOpenDialog] = (0, react_1.useState)(false);
    const [newInvoiceData, setNewInvoiceData] = (0, react_1.useState)({
        memberId: '',
        memberName: '',
        amount: 0
    });
    const [isDocumentListOpen, setIsDocumentListOpen] = (0, react_1.useState)(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = (0, react_1.useState)(false);
    const [deletingPayment, setDeletingPayment] = (0, react_1.useState)(null);
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'success'
    });
    const [paymentMethodAnchorEl, setPaymentMethodAnchorEl] = (0, react_1.useState)(null);
    const [selectedPayment, setSelectedPayment] = (0, react_1.useState)(null);
    const loadPayments = async () => {
        try {
            const data = await feeHistoryService_1.feeHistoryService.getHistories({
                status: '已收款'
            });
            setPayments(data);
        }
        catch (error) {
            console.error('載入付款記錄失敗:', error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        loadPayments();
    }, []);
    const handlePrint = (payment) => {
        // TODO: 實作列印功能
        console.log('列印:', payment);
    };
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewInvoiceData({
            memberId: '',
            memberName: '',
            amount: 0
        });
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInvoiceData(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : value
        }));
    };
    const handleAddInvoice = () => {
        // 這裡可以添加驗證邏輯
        if (!newInvoiceData.memberId || !newInvoiceData.memberName || !newInvoiceData.amount) {
            return;
        }
        // 創建新的付款記錄
        const newPayment = {
            id: `manual-${Date.now()}`,
            memberId: newInvoiceData.memberId,
            memberName: newInvoiceData.memberName,
            userId: newInvoiceData.memberId,
            userName: newInvoiceData.memberName,
            memberType: '一般會員', // 預設值
            amount: newInvoiceData.amount,
            dueDate: new Date().toISOString().split('T')[0],
            status: '已收款',
            date: new Date().toISOString().split('T')[0],
            action: '已收款',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            paymentId: `payment-${Date.now()}`
        };
        // 更新列表
        setPayments(prev => [...prev, newPayment]);
        handleCloseDialog();
    };
    const handleDeleteClick = (payment) => {
        setDeletingPayment(payment);
        setDeleteConfirmOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (deletingPayment) {
            try {
                await feeHistoryService_1.feeHistoryService.deleteRecord(deletingPayment.id);
                await loadPayments();
                setSnackbar({
                    open: true,
                    message: '刪除成功',
                    severity: 'success'
                });
            }
            catch (error) {
                console.error('刪除失敗:', error);
                setSnackbar({
                    open: true,
                    message: '刪除失敗',
                    severity: 'error'
                });
            }
        }
        setDeleteConfirmOpen(false);
        setDeletingPayment(null);
    };
    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setDeletingPayment(null);
    };
    const handlePaymentMethodClick = (event, payment) => {
        setPaymentMethodAnchorEl(event.currentTarget);
        setSelectedPayment(payment);
    };
    const handlePaymentMethodClose = () => {
        setPaymentMethodAnchorEl(null);
        setSelectedPayment(null);
    };
    const handlePaymentMethodSelect = async (method) => {
        if (selectedPayment) {
            try {
                await feeHistoryService_1.feeHistoryService.updateRecord(selectedPayment.id, {
                    paymentMethod: method,
                    updatedAt: new Date().toISOString()
                });
                await loadPayments();
                setSnackbar({
                    open: true,
                    message: '更新收款方式成功',
                    severity: 'success'
                });
            }
            catch (error) {
                console.error('更新收款方式失敗:', error);
                setSnackbar({
                    open: true,
                    message: '更新收款方式失敗',
                    severity: 'error'
                });
            }
        }
        handlePaymentMethodClose();
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u767C\u7968\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { display: 'flex', gap: 1 }, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", onClick: () => setIsDocumentListOpen(true), startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Print, {}), children: "\u5217\u5370\u767C\u7968/\u6536\u64DA" }) })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u59D3\u540D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7E73\u8CBB\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6536\u6B3E\u65B9\u5F0F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [payments.map((payment) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.memberId }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.memberName }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.memberType }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: payment.amount.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.paymentDate ?
                                                new Date(payment.paymentDate).toLocaleDateString('zh-TW', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                }) :
                                                '未繳費' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: payment.paymentMethod || '未設定', color: payment.paymentMethod ? 'primary' : 'default', size: "small", onClick: (e) => handlePaymentMethodClick(e, payment) }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(DocumentIssue_1.DocumentIssue, { memberId: payment.memberId, memberName: payment.memberName, paymentId: payment.id, amount: payment.amount, onSuccess: loadPayments }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { color: "error", onClick: () => handleDeleteClick(payment), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] }) })] }, payment.id))), payments.length === 0 && !loading && ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 6, align: "center", children: "\u7121\u5DF2\u6536\u6B3E\u8A18\u9304" }) }))] })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: openDialog, onClose: handleCloseDialog, maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u65B0\u589E\u767C\u7968" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6703\u54E1\u7DE8\u865F", name: "memberId", value: newInvoiceData.memberId, onChange: handleInputChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6703\u54E1\u59D3\u540D", name: "memberName", value: newInvoiceData.memberName, onChange: handleInputChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u91D1\u984D", name: "amount", type: "number", value: newInvoiceData.amount, onChange: handleInputChange }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleAddInvoice, variant: "contained", color: "primary", children: "\u65B0\u589E" })] })] }), (0, jsx_runtime_1.jsx)(DocumentListDialog, { open: isDocumentListOpen, onClose: () => setIsDocumentListOpen(false), memberId: payments.length > 0 ? payments[0].memberId : '', memberName: payments.length > 0 ? payments[0].memberName : '' }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: deleteConfirmOpen, onClose: handleDeleteCancel, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.DialogContentText, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u9019\u7B46\u4ED8\u6B3E\u8A18\u9304\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002" }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteCancel, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, color: "error", autoFocus: true, children: "\u522A\u9664" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Menu, { anchorEl: paymentMethodAnchorEl, open: Boolean(paymentMethodAnchorEl), onClose: handlePaymentMethodClose, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { onClick: () => handlePaymentMethodSelect('轉帳'), children: "\u8F49\u5E33" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { onClick: () => handlePaymentMethodSelect('Line Pay'), children: "Line Pay" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { onClick: () => handlePaymentMethodSelect('現金'), children: "\u73FE\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { onClick: () => handlePaymentMethodSelect('票據'), children: "\u7968\u64DA" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { onClick: () => handlePaymentMethodSelect('其他'), children: "\u5176\u4ED6" })] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 3000, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), anchorOrigin: { vertical: 'top', horizontal: 'center' }, children: (0, jsx_runtime_1.jsx)(material_1.Alert, { onClose: () => setSnackbar(prev => ({ ...prev, open: false })), severity: snackbar.severity, children: snackbar.message }) })] }));
};
exports.InvoiceManagement = InvoiceManagement;
