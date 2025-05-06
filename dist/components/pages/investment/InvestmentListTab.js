"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const InvestmentList_1 = __importDefault(require("./InvestmentList"));
const services_1 = require("../../../services");
const notistack_1 = require("notistack");
const InvestmentListTab = ({ investments, onEdit, onRefresh }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = (0, react_1.useState)(false);
    const [investmentToDelete, setInvestmentToDelete] = (0, react_1.useState)(null);
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    const handleDeleteClick = (investment) => {
        setInvestmentToDelete(investment);
        setDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (!investmentToDelete)
            return;
        try {
            await services_1.ApiService.deleteInvestment(investmentToDelete.id);
            enqueueSnackbar('投資項目已刪除', { variant: 'success' });
            await onRefresh();
        }
        catch (error) {
            enqueueSnackbar('刪除投資項目失敗', { variant: 'error' });
        }
        finally {
            setDeleteDialogOpen(false);
            setInvestmentToDelete(null);
        }
    };
    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setInvestmentToDelete(null);
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(InvestmentList_1.default, { investments: investments, onEditInvestment: onEdit, onDeleteInvestment: handleDeleteClick }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: deleteDialogOpen, onClose: handleDeleteCancel, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsxs)(material_1.DialogContent, { children: ["\u78BA\u5B9A\u8981\u522A\u9664\u300C", investmentToDelete === null || investmentToDelete === void 0 ? void 0 : investmentToDelete.name, "\u300D\u9019\u500B\u6295\u8CC7\u9805\u76EE\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002"] }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteCancel, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, color: "error", children: "\u522A\u9664" })] })] })] }));
};
exports.default = InvestmentListTab;
