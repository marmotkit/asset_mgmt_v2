"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentIssue = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const DatePicker_1 = require("@mui/x-date-pickers/DatePicker");
const icons_material_1 = require("@mui/icons-material");
const invoiceService_1 = require("../../../services/invoiceService");
const documentService_1 = require("../../../services/documentService");
const DocumentIssue = ({ memberId, memberName, paymentId, amount, onSuccess }) => {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [documentType, setDocumentType] = (0, react_1.useState)('二聯式');
    const [items, setItems] = (0, react_1.useState)([{
            description: '會員年費',
            quantity: 1,
            unitPrice: amount,
            amount: amount
        }]);
    const [buyerInfo, setBuyerInfo] = (0, react_1.useState)({
        name: '',
        taxId: ''
    });
    const [issueDate, setIssueDate] = (0, react_1.useState)(new Date());
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'success'
    });
    const companyInfo = invoiceService_1.invoiceService.getCompanyInfo();
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleAddItem = () => {
        setItems([...items, {
                description: '',
                quantity: 1,
                unitPrice: 0,
                amount: 0
            }]);
    };
    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? Number(value) : items[index].quantity;
            const unitPrice = field === 'unitPrice' ? Number(value) : items[index].unitPrice;
            newItems[index] = {
                ...newItems[index],
                [field]: Number(value),
                amount: quantity * unitPrice
            };
        }
        else {
            newItems[index] = {
                ...newItems[index],
                [field]: value
            };
        }
        setItems(newItems);
    };
    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };
    const calculateTax = () => {
        return Math.round(calculateTotal() * 0.05);
    };
    const handleSubmit = async () => {
        if (!issueDate) {
            setSnackbar({
                open: true,
                message: '請選擇開立日期',
                severity: 'error'
            });
            return;
        }
        try {
            const formattedDate = issueDate.toISOString().split('T')[0];
            if (documentType === '收據') {
                await invoiceService_1.invoiceService.createReceipt({
                    type: '收據',
                    memberId,
                    memberName,
                    paymentId,
                    payerName: memberName,
                    description: items[0].description,
                    amount: calculateTotal(),
                    date: formattedDate,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            else {
                await invoiceService_1.invoiceService.createInvoice({
                    type: documentType,
                    memberId,
                    memberName,
                    paymentId,
                    sellerName: companyInfo.name,
                    sellerTaxId: companyInfo.taxId,
                    buyerName: documentType === '三聯式' ? buyerInfo.name : undefined,
                    buyerTaxId: documentType === '三聯式' ? buyerInfo.taxId : undefined,
                    items,
                    amount: calculateTotal(),
                    taxAmount: calculateTax(),
                    date: formattedDate,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            setSnackbar({
                open: true,
                message: '開立成功',
                severity: 'success'
            });
            onSuccess();
            handleClose();
        }
        catch (error) {
            console.error('開立失敗:', error);
            setSnackbar({
                open: true,
                message: '開立失敗',
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
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "primary", onClick: handleOpen, children: "\u958B\u7ACB\u767C\u7968/\u6536\u64DA" }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: handleClose, maxWidth: "md", fullWidth: true, keepMounted: false, disablePortal: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u958B\u7ACB\u767C\u7968/\u6536\u64DA" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mt: 2 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: documentType, label: "\u985E\u578B", onChange: (e) => setDocumentType(e.target.value), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u4E8C\u806F\u5F0F", children: "\u4E8C\u806F\u5F0F\u767C\u7968\uFF08\u5B58\u6839\u806F\u3001\u6536\u57F7\u806F\uFF09" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u4E09\u806F\u5F0F", children: "\u4E09\u806F\u5F0F\u767C\u7968\uFF08\u5B58\u6839\u806F\u3001\u5831\u5E33\u806F\u3001\u6263\u62B5\u806F\uFF09" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u6536\u64DA", children: "\u6536\u64DA" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(DatePicker_1.DatePicker, { label: "\u958B\u7ACB\u65E5\u671F", value: issueDate, onChange: (newValue) => setIssueDate(newValue), format: "yyyy/MM/dd", slotProps: {
                                                textField: {
                                                    fullWidth: true
                                                }
                                            } }) }), documentType !== '收據' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u8CE3\u65B9\u8CC7\u8A0A" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u516C\u53F8\u540D\u7A31", value: companyInfo.name }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7D71\u4E00\u7DE8\u865F", value: companyInfo.taxId }) })] })), documentType === '三聯式' && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u8CB7\u65B9\u8CC7\u8A0A" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u516C\u53F8\u540D\u7A31", value: buyerInfo.name, onChange: (e) => setBuyerInfo({ ...buyerInfo, name: e.target.value }) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, md: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7D71\u4E00\u7DE8\u865F", value: buyerInfo.taxId, onChange: (e) => setBuyerInfo({ ...buyerInfo, taxId: e.target.value }) }) })] })), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u5546\u54C1\u660E\u7D30" }), documentType !== '收據' && ((0, jsx_runtime_1.jsx)(material_1.Button, { startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: handleAddItem, children: "\u65B0\u589E\u9805\u76EE" }))] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u54C1\u540D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u6578\u91CF" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u55AE\u50F9" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), documentType !== '收據' && ((0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u64CD\u4F5C" }))] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: items.map((item, index) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, value: item.description, onChange: (e) => handleItemChange(index, 'description', e.target.value) }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)(material_1.TextField, { type: "number", value: item.quantity, onChange: (e) => handleItemChange(index, 'quantity', e.target.value), disabled: documentType === '收據', sx: { width: 100 } }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)(material_1.TextField, { type: "number", value: item.unitPrice, onChange: (e) => handleItemChange(index, 'unitPrice', e.target.value), disabled: documentType === '收據', sx: { width: 100 } }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: item.amount.toLocaleString() }), documentType !== '收據' && ((0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => handleRemoveItem(index), disabled: items.length === 1, children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) }) }))] }, index))) })] }) })] }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', justifyContent: 'flex-end', mt: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", sx: { mr: 2 }, children: ["\u7E3D\u8A08\uFF1A", calculateTotal().toLocaleString()] }), documentType !== '收據' && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", sx: { mr: 2 }, children: ["\u71DF\u696D\u7A05\uFF1A", calculateTax().toLocaleString()] })), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", children: ["\u7E3D\u91D1\u984D\uFF1A", (calculateTotal() + (documentType !== '收據' ? calculateTax() : 0)).toLocaleString()] })] }) })] }) }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", color: "primary", children: "\u78BA\u8A8D\u958B\u7ACB" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 6000, onClose: () => setSnackbar({ ...snackbar, open: false }), children: (0, jsx_runtime_1.jsx)(material_1.Alert, { onClose: () => setSnackbar({ ...snackbar, open: false }), severity: snackbar.severity, sx: { width: '100%' }, children: snackbar.message }) })] }));
};
exports.DocumentIssue = DocumentIssue;
