"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditAnomalyDialog = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const api_service_1 = require("../../../services/api.service");
const anomalyTypes = [
    '合約爭議',
    '系統錯誤',
    '服務品質問題',
    '付款問題',
    '其他'
];
const statusOptions = [
    '待處理',
    '處理中',
    '已解決',
    '已關閉'
];
const EditAnomalyDialog = ({ open, onClose, anomalyId, onSuccess }) => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        id: '',
        type: '',
        personName: '',
        description: '',
        occurrenceDate: '',
        status: '待處理',
        handlingMethod: ''
    });
    const [changeReason, setChangeReason] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        if (open && anomalyId) {
            loadAnomalyData();
        }
    }, [open, anomalyId]);
    const loadAnomalyData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api_service_1.ApiService.getAnomaly(anomalyId);
            setFormData({
                id: data.id,
                type: data.type,
                personId: data.personId,
                personName: data.personName,
                description: data.description,
                occurrenceDate: data.occurrenceDate,
                status: data.status,
                handlingMethod: data.handlingMethod || ''
            });
        }
        catch (error) {
            setError('載入異常記錄失敗');
            console.error('載入異常記錄失敗:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubmit = async () => {
        if (!formData.type || !formData.personName || !formData.description || !formData.occurrenceDate) {
            setError('請填寫所有必填欄位');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await api_service_1.ApiService.updateAnomaly(anomalyId, {
                ...formData,
                changeReason: changeReason || '系統更新'
            });
            onSuccess();
            onClose();
        }
        catch (error) {
            setError('更新異常記錄失敗');
            console.error('更新異常記錄失敗:', error);
        }
        finally {
            setSaving(false);
        }
    };
    const handleClose = () => {
        if (!saving) {
            setFormData({
                id: '',
                type: '',
                personName: '',
                description: '',
                occurrenceDate: '',
                status: '待處理',
                handlingMethod: ''
            });
            setChangeReason('');
            setError(null);
            onClose();
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: handleClose, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u7DE8\u8F2F\u7570\u5E38\u8A18\u9304" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: loading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", p: 3, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2 }, children: [error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 2 }, children: error })), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u7570\u5E38\u985E\u578B *" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), label: "\u7570\u5E38\u985E\u578B *", children: anomalyTypes.map((type) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: type, children: type }, type))) })] }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u76F8\u95DC\u4EBA\u54E1 *", value: formData.personName, onChange: (e) => setFormData({ ...formData, personName: e.target.value }) })] }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u767C\u751F\u65E5\u671F *", type: "date", value: formData.occurrenceDate, onChange: (e) => setFormData({ ...formData, occurrenceDate: e.target.value }), InputLabelProps: { shrink: true }, sx: { mb: 2 } }), (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: formData.status, onChange: (e) => setFormData({ ...formData, status: e.target.value }), label: "\u72C0\u614B", children: statusOptions.map((status) => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: status, children: status }, status))) })] }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u4E8B\u4EF6\u63CF\u8FF0 *", multiline: true, rows: 3, value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u8655\u7406\u65B9\u5F0F", multiline: true, rows: 3, value: formData.handlingMethod, onChange: (e) => setFormData({ ...formData, handlingMethod: e.target.value }), sx: { mb: 2 } }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u4FEE\u6539\u539F\u56E0", multiline: true, rows: 2, value: changeReason, onChange: (e) => setChangeReason(e.target.value), placeholder: "\u8ACB\u8AAA\u660E\u4FEE\u6539\u7684\u539F\u56E0\uFF08\u53EF\u9078\uFF09", helperText: "\u8A18\u9304\u4FEE\u6539\u539F\u56E0\u6709\u52A9\u65BC\u8FFD\u8E64\u8655\u7406\u904E\u7A0B" })] })) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, disabled: saving, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", disabled: saving || loading, startIcon: saving ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : null, children: saving ? '保存中...' : '保存' })] })] }));
};
exports.EditAnomalyDialog = EditAnomalyDialog;
