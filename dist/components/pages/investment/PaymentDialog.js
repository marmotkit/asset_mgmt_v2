"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const dayjs_1 = __importDefault(require("dayjs"));
const PaymentDialog = ({ open, onClose, onSave, payment, defaultAmount = 0 }) => {
    const [formData, setFormData] = (0, react_1.useState)({
        amount: defaultAmount,
        dueDate: (0, dayjs_1.default)().format('YYYY-MM-DD'),
        status: 'pending',
        paymentMethod: 'transfer',
        notes: ''
    });
    (0, react_1.useEffect)(() => {
        if (payment) {
            setFormData({
                ...payment,
                dueDate: (0, dayjs_1.default)(payment.dueDate).format('YYYY-MM-DD'),
                paidDate: payment.paidDate ? (0, dayjs_1.default)(payment.paidDate).format('YYYY-MM-DD') : undefined
            });
        }
        else {
            setFormData({
                amount: defaultAmount,
                dueDate: (0, dayjs_1.default)().format('YYYY-MM-DD'),
                status: 'pending',
                paymentMethod: 'transfer',
                notes: ''
            });
        }
    }, [payment, defaultAmount]);
    const handleSubmit = async () => {
        try {
            await onSave(formData);
            onClose();
        }
        catch (error) {
            console.error('保存付款記錄失敗:', error);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onClose, maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: payment ? '編輯付款記錄' : '新增付款記錄' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u91D1\u984D", type: "number", value: formData.amount, onChange: (e) => setFormData({
                                    ...formData,
                                    amount: Number(e.target.value)
                                }), InputProps: {
                                    inputProps: { min: 0 }
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5230\u671F\u65E5", type: "date", value: formData.dueDate, onChange: (e) => setFormData({
                                    ...formData,
                                    dueDate: e.target.value
                                }), InputLabelProps: {
                                    shrink: true
                                } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u4ED8\u6B3E\u65B9\u5F0F" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { label: "\u4ED8\u6B3E\u65B9\u5F0F", value: formData.paymentMethod, onChange: (e) => setFormData({
                                            ...formData,
                                            paymentMethod: e.target.value
                                        }), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "cash", children: "\u73FE\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "bank_transfer", children: "\u9280\u884C\u8F49\u5E33" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "credit_card", children: "\u4FE1\u7528\u5361" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "check", children: "\u652F\u7968" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "transfer", children: "\u8F49\u5E33" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "other", children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5099\u8A3B", multiline: true, rows: 4, value: formData.notes || '', onChange: (e) => setFormData({
                                    ...formData,
                                    notes: e.target.value
                                }) }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onClose, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, color: "primary", children: "\u78BA\u8A8D" })] })] }));
};
exports.default = PaymentDialog;
