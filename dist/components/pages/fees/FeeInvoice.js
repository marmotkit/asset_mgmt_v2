"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const mockInvoices = [
    {
        id: '1',
        memberId: 'A001',
        memberName: '系統管理員',
        companyName: '系統科技有限公司',
        taxId: '12345678',
        address: '台北市信義區信義路五段7號',
        contactPerson: '王小明',
        phone: '02-12345678',
        email: 'contact@system.com'
    },
    {
        id: '2',
        memberId: 'V001',
        memberName: '梁坤榮',
        companyName: '方正公司',
        taxId: '87654321',
        address: '台北市中山區中山北路二段45號',
        contactPerson: '梁坤榮',
        phone: '02-87654321',
        email: 'y134679@hotmail.com'
    }
];
const FeeInvoice = () => {
    const [invoices, setInvoices] = (0, react_1.useState)(mockInvoices);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [editingInvoice, setEditingInvoice] = (0, react_1.useState)(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = (0, react_1.useState)(false);
    const [deletingInvoice, setDeletingInvoice] = (0, react_1.useState)(null);
    const handleEditClick = (invoice) => {
        setEditingInvoice({ ...invoice });
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setEditingInvoice(null);
    };
    const handleSave = () => {
        if (editingInvoice) {
            setInvoices(invoices.map(invoice => invoice.id === editingInvoice.id ? editingInvoice : invoice));
            handleClose();
        }
    };
    const handleChange = (e) => {
        if (editingInvoice) {
            setEditingInvoice({
                ...editingInvoice,
                [e.target.name]: e.target.value
            });
        }
    };
    const handlePrint = (invoice) => {
        // TODO: 實作發票列印功能
        console.log('列印發票:', invoice);
    };
    const handleDeleteClick = (invoice) => {
        setDeletingInvoice(invoice);
        setDeleteConfirmOpen(true);
    };
    const handleDeleteConfirm = () => {
        if (deletingInvoice) {
            setInvoices(invoices.filter(invoice => invoice.id !== deletingInvoice.id));
            setDeleteConfirmOpen(false);
            setDeletingInvoice(null);
        }
    };
    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setDeletingInvoice(null);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "\u767C\u7968\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => {
                            setEditingInvoice({
                                id: String(invoices.length + 1),
                                memberId: '',
                                memberName: '',
                                companyName: '',
                                taxId: '',
                                address: '',
                                contactPerson: '',
                                phone: '',
                                email: ''
                            });
                            setOpen(true);
                        }, children: "\u65B0\u589E\u767C\u7968\u8CC7\u8A0A" })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u59D3\u540D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u516C\u53F8\u540D\u7A31" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7D71\u4E00\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u806F\u7D61\u4EBA" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u96FB\u8A71" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: invoices.map((invoice) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: invoice.memberId }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: invoice.memberName }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: invoice.companyName }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: invoice.taxId }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: invoice.contactPerson }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: invoice.phone }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEditClick(invoice), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handlePrint(invoice), children: (0, jsx_runtime_1.jsx)(icons_material_1.Print, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleDeleteClick(invoice), color: "error", children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) })] })] }, invoice.id))) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: handleClose, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: (editingInvoice === null || editingInvoice === void 0 ? void 0 : editingInvoice.id) ? '編輯發票資訊' : '新增發票資訊' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { pt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6703\u54E1\u7DE8\u865F", name: "memberId", value: (editingInvoice === null || editingInvoice === void 0 ? void 0 : editingInvoice.memberId) || '', onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u59D3\u540D", name: "memberName", value: (editingInvoice === null || editingInvoice === void 0 ? void 0 : editingInvoice.memberName) || '', onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u516C\u53F8\u540D\u7A31", name: "companyName", value: (editingInvoice === null || editingInvoice === void 0 ? void 0 : editingInvoice.companyName) || '', onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7D71\u4E00\u7DE8\u865F", name: "taxId", value: (editingInvoice === null || editingInvoice === void 0 ? void 0 : editingInvoice.taxId) || '', onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5730\u5740", name: "address", value: (editingInvoice === null || editingInvoice === void 0 ? void 0 : editingInvoice.address) || '', onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u806F\u7D61\u4EBA", name: "contactPerson", value: (editingInvoice === null || editingInvoice === void 0 ? void 0 : editingInvoice.contactPerson) || '', onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96FB\u8A71", name: "phone", value: (editingInvoice === null || editingInvoice === void 0 ? void 0 : editingInvoice.phone) || '', onChange: handleChange }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "Email", name: "email", type: "email", value: (editingInvoice === null || editingInvoice === void 0 ? void 0 : editingInvoice.email) || '', onChange: handleChange }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", children: "\u5132\u5B58" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: deleteConfirmOpen, onClose: handleDeleteCancel, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: ["\u78BA\u5B9A\u8981\u522A\u9664 ", deletingInvoice === null || deletingInvoice === void 0 ? void 0 : deletingInvoice.companyName, " \u7684\u767C\u7968\u8CC7\u8A0A\u55CE\uFF1F"] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteCancel, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, variant: "contained", color: "error", children: "\u522A\u9664" })] })] })] }));
};
exports.default = FeeInvoice;
