"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const icons_material_2 = require("@mui/icons-material");
const dnd_1 = require("@hello-pangea/dnd");
const api_service_1 = require("../../../services/api.service");
const MEMBER_TYPE_OPTIONS = [
    '一般會員',
    '商務會員',
    '永久會員'
];
const FeeSettings = () => {
    const [feeSettings, setFeeSettings] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [open, setOpen] = (0, react_1.useState)(false);
    const [editingFee, setEditingFee] = (0, react_1.useState)(null);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [addOpen, setAddOpen] = (0, react_1.useState)(false);
    const [newFee, setNewFee] = (0, react_1.useState)({});
    const [adding, setAdding] = (0, react_1.useState)(false);
    // 載入會費標準資料
    (0, react_1.useEffect)(() => {
        const loadFeeSettings = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await api_service_1.ApiService.getFeeSettings();
                setFeeSettings(data);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : '載入會費標準失敗');
            }
            finally {
                setLoading(false);
            }
        };
        loadFeeSettings();
    }, []);
    const handleEditClick = (fee) => {
        setEditingFee({ ...fee });
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setEditingFee(null);
        setError(null);
    };
    const handleSave = async () => {
        if (!editingFee)
            return;
        try {
            setSaving(true);
            setError(null);
            const updatedFee = await api_service_1.ApiService.updateFeeSetting(editingFee.id, {
                amount: editingFee.amount,
                period: editingFee.period,
                description: editingFee.description
            });
            setFeeSettings(feeSettings.map(fee => fee.id === editingFee.id ? updatedFee : fee));
            handleClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '更新會費標準失敗');
        }
        finally {
            setSaving(false);
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
    const handleAddOpen = () => {
        setNewFee({ memberType: '', amount: 0, period: '', description: '' });
        setAddOpen(true);
    };
    const handleAddClose = () => {
        setAddOpen(false);
        setNewFee({});
        setError(null);
    };
    const handleAddChange = (e) => {
        setNewFee({
            ...newFee,
            [e.target.name]: e.target.name === 'amount' ? Number(e.target.value) : e.target.value
        });
    };
    const handleAddSave = async () => {
        if (!newFee.memberType || !newFee.amount || !newFee.period) {
            setError('會員類型、金額、期間為必填');
            return;
        }
        setAdding(true);
        setError(null);
        try {
            const maxOrder = feeSettings.length > 0 ? Math.max(...feeSettings.map(f => { var _a; return (_a = f.order) !== null && _a !== void 0 ? _a : 0; })) : 0;
            const created = await api_service_1.ApiService.createFeeSetting({
                memberType: newFee.memberType,
                amount: newFee.amount,
                period: newFee.period,
                description: newFee.description,
                order: maxOrder + 1
            });
            setFeeSettings([...feeSettings, created]);
            handleAddClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : '新增失敗');
        }
        finally {
            setAdding(false);
        }
    };
    // 拖曳排序處理
    const handleDragEnd = async (result) => {
        if (!result.destination)
            return;
        const newList = Array.from(feeSettings);
        const [removed] = newList.splice(result.source.index, 1);
        newList.splice(result.destination.index, 0, removed);
        // 重新計算 order
        const orders = newList.map((item, idx) => ({ id: item.id, order: idx }));
        setFeeSettings(newList);
        try {
            await api_service_1.ApiService.patchFeeSettingsOrder(orders);
        }
        catch (err) {
            setError('排序更新失敗');
        }
    };
    // 上下箭頭排序
    const moveRow = async (index, direction) => {
        const newList = Array.from(feeSettings);
        if (direction === 'up' && index > 0) {
            [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
        }
        else if (direction === 'down' && index < newList.length - 1) {
            [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        }
        else {
            return;
        }
        // 重新計算 order
        const orders = newList.map((item, idx) => ({ id: item.id, order: idx }));
        setFeeSettings(newList);
        try {
            await api_service_1.ApiService.patchFeeSettingsOrder(orders);
        }
        catch (err) {
            setError('排序更新失敗');
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { mb: 2 }, children: "\u6703\u8CBB\u6A19\u6E96\u8A2D\u5B9A" }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", sx: { mb: 2 }, onClick: handleAddOpen, children: "\u65B0\u589E\u6703\u8CBB\u6A19\u6E96" }), error && ((0, jsx_runtime_1.jsx)(material_1.Alert, { severity: "error", sx: { mb: 2 }, children: error })), loading ? ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", p: 3, children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) })) : ((0, jsx_runtime_1.jsx)(dnd_1.DragDropContext, { onDragEnd: handleDragEnd, children: (0, jsx_runtime_1.jsx)(dnd_1.Droppable, { droppableId: "feeSettingsTable", children: (provided) => ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, ref: provided.innerRef, ...provided.droppableProps, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, {}), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u671F\u9593" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u8AAA\u660E" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.TableBody, { children: [feeSettings.map((fee, idx) => ((0, jsx_runtime_1.jsx)(dnd_1.Draggable, { draggableId: fee.id.toString(), index: idx, children: (provided, snapshot) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { ref: provided.innerRef, ...provided.draggableProps, style: {
                                                    ...provided.draggableProps.style,
                                                    background: snapshot.isDragging ? '#f0f0f0' : undefined
                                                }, children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { ...provided.dragHandleProps, children: (0, jsx_runtime_1.jsx)(icons_material_2.DragIndicator, { style: { cursor: 'grab' } }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: fee.memberType }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: fee.amount.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: fee.period }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: fee.description }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => moveRow(idx, 'up'), disabled: idx === 0, children: (0, jsx_runtime_1.jsx)(icons_material_2.ArrowUpward, { fontSize: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => moveRow(idx, 'down'), disabled: idx === feeSettings.length - 1, children: (0, jsx_runtime_1.jsx)(icons_material_2.ArrowDownward, { fontSize: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => handleEditClick(fee), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) })] })] })) }, fee.id))), provided.placeholder] })] }) })) }) })), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: open, onClose: handleClose, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u7DE8\u8F2F\u6703\u8CBB\u6A19\u6E96" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { pt: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "dense", disabled: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6703\u54E1\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.Select, { name: "memberType", value: (editingFee === null || editingFee === void 0 ? void 0 : editingFee.memberType) || '', label: "\u6703\u54E1\u985E\u578B", onChange: handleChange, children: MEMBER_TYPE_OPTIONS.map(type => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: type, children: type }, type))) })] }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, margin: "dense", label: "\u91D1\u984D", name: "amount", type: "number", value: (editingFee === null || editingFee === void 0 ? void 0 : editingFee.amount) || '', onChange: handleChange }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, margin: "dense", label: "\u671F\u9593", name: "period", value: (editingFee === null || editingFee === void 0 ? void 0 : editingFee.period) || '', onChange: handleChange }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, margin: "dense", label: "\u8AAA\u660E", name: "description", value: (editingFee === null || editingFee === void 0 ? void 0 : editingFee.description) || '', onChange: handleChange })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, disabled: saving, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSave, variant: "contained", disabled: saving, startIcon: saving ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : null, children: saving ? '儲存中...' : '儲存' })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: addOpen, onClose: handleAddClose, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u65B0\u589E\u6703\u8CBB\u6A19\u6E96" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { pt: 2 }, children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, margin: "dense", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6703\u54E1\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.Select, { name: "memberType", value: newFee.memberType || '', label: "\u6703\u54E1\u985E\u578B", onChange: handleAddChange, children: MEMBER_TYPE_OPTIONS.map(type => ((0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: type, children: type }, type))) })] }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, margin: "dense", label: "\u91D1\u984D", name: "amount", type: "number", value: newFee.amount || '', onChange: handleAddChange }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, margin: "dense", label: "\u671F\u9593", name: "period", value: newFee.period || '', onChange: handleAddChange }), (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, margin: "dense", label: "\u8AAA\u660E", name: "description", value: newFee.description || '', onChange: handleAddChange })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleAddClose, disabled: adding, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleAddSave, variant: "contained", disabled: adding, startIcon: adding ? (0, jsx_runtime_1.jsx)(material_1.CircularProgress, { size: 20 }) : null, children: adding ? '新增中...' : '新增' })] })] })] }));
};
exports.default = FeeSettings;
