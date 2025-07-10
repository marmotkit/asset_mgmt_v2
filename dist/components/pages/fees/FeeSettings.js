"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const initialFeeSettings = [
    {
        id: '1',
        memberType: '一般會員',
        amount: 30000,
        period: '年',
        description: '一般會員年費'
    },
    {
        id: '2',
        memberType: '永久會員',
        amount: 300000,
        period: '5年',
        description: '永久會員5年費用'
    },
    {
        id: '3',
        memberType: '商務會員',
        amount: 3000000,
        period: '5年',
        description: '商務會員5年費用'
    },
    {
        id: '4',
        memberType: '管理員',
        amount: 0,
        period: '永久',
        description: '管理員免費'
    }
];
const FeeSettings = () => {
    const [feeSettings, setFeeSettings] = (0, react_1.useState)(initialFeeSettings);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [editingFee, setEditingFee] = (0, react_1.useState)(null);
    const handleEditClick = (fee) => {
        setEditingFee({ ...fee });
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setEditingFee(null);
    };
    const handleSave = () => {
        if (editingFee) {
            setFeeSettings(feeSettings.map(fee => fee.id === editingFee.id ? editingFee : fee));
            handleClose();
        }
    };
    const handleChange = (e) => {
        if (editingFee) {
            setEditingFee({
                ...editingFee,
                [e.target.name]: e.target.name === 'amount' ? Number(e.target.value) : e.target.value
            });
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { mb: 2 }, children: "\u6703\u8CBB\u6A19\u6E96\u8A2D\u5B9A" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u671F\u9593" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u8AAA\u660E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: feeSettings.map((fee) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: fee.memberType }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: fee.amount.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: fee.period }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: fee.description }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => handleEditClick(fee), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }) })] }, fee.id))) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: handleClose, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u7DE8\u8F2F\u6703\u8CBB\u6A19\u6E96" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { pt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, margin: "dense", label: "\u6703\u54E1\u985E\u578B", name: "memberType", value: (editingFee === null || editingFee === void 0 ? void 0 : editingFee.memberType) || '', onChange: handleChange, disabled: true }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, margin: "dense", label: "\u91D1\u984D", name: "amount", type: "number", value: (editingFee === null || editingFee === void 0 ? void 0 : editingFee.amount) || '', onChange: handleChange }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, margin: "dense", label: "\u671F\u9593", name: "period", value: (editingFee === null || editingFee === void 0 ? void 0 : editingFee.period) || '', onChange: handleChange }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, margin: "dense", label: "\u8AAA\u660E", name: "description", value: (editingFee === null || editingFee === void 0 ? void 0 : editingFee.description) || '', onChange: handleChange })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", children: "\u5132\u5B58" })] })] })] }));
};
exports.default = FeeSettings;
