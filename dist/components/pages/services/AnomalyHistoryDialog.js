"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnomalyHistoryDialog = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const api_service_1 = require("../../../services/api.service");
const fieldNameMap = {
    type: '異常類型',
    person_id: '相關人員ID',
    person_name: '相關人員',
    description: '事件描述',
    occurrence_date: '發生日期',
    status: '狀態',
    handling_method: '處理方式'
};
const AnomalyHistoryDialog = ({ open, onClose, anomalyId }) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [changes, setChanges] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (open && anomalyId) {
            loadChangeHistory();
        }
    }, [open, anomalyId]);
    const loadChangeHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api_service_1.ApiService.getAnomalyChanges(anomalyId);
            setChanges(data);
        }
        catch (error) {
            setError('載入修改歷史失敗');
            console.error('載入修改歷史失敗:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('zh-TW');
    };
    const getStatusColor = (status) => {
        switch (status) {
            case '待處理':
                return 'warning';
            case '處理中':
                return 'info';
            case '已解決':
                return 'success';
            case '已關閉':
                return 'default';
            default:
                return 'default';
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: onClose, maxWidth: "lg", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u4FEE\u6539\u6B77\u53F2\u8A18\u9304" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: loading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", p: 3, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2 }, children: [error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 2 }, children: error })), changes.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", color: "text.secondary", textAlign: "center", py: 3, children: "\u66AB\u7121\u4FEE\u6539\u8A18\u9304" })) : ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, variant: "outlined", children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u4FEE\u6539\u6642\u9593" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u4FEE\u6539\u4EBA\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u4FEE\u6539\u6B04\u4F4D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u539F\u503C" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u65B0\u503C" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u4FEE\u6539\u539F\u56E0" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: changes.map((change) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: formatDate(change.changedAt) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: change.changedBy }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", fontWeight: "medium", children: fieldNameMap[change.fieldName] || change.fieldName }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: change.fieldName === 'status' ? ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: change.oldValue || '無', size: "small", color: getStatusColor(change.oldValue || ''), variant: "outlined" })) : ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: change.oldValue || '無' })) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: change.fieldName === 'status' ? ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: change.newValue || '無', size: "small", color: getStatusColor(change.newValue || '') })) : ((0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", fontWeight: "medium", children: change.newValue || '無' })) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: change.changeReason || '未說明' }) })] }, change.id))) })] }) }))] })) }), (0, jsx_runtime_1.jsx)(material_1.DialogActions, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: onClose, children: "\u95DC\u9589" }) })] }));
};
exports.AnomalyHistoryDialog = AnomalyHistoryDialog;
