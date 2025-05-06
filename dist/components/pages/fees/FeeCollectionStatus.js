"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const numberUtils_1 = require("../../../utils/numberUtils");
const FeeCollectionStatus = () => {
    const [collections, setCollections] = (0, react_1.useState)([]);
    const [editingId, setEditingId] = (0, react_1.useState)(null);
    const [editData, setEditData] = (0, react_1.useState)(null);
    // 從 localStorage 載入資料
    (0, react_1.useEffect)(() => {
        const savedData = localStorage.getItem('feeCollections');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                console.log('Loading saved data:', parsedData); // 添加日誌
                setCollections(parsedData);
            }
            catch (error) {
                console.error('Error parsing saved data:', error);
                initializeDefaultData();
            }
        }
        else {
            initializeDefaultData();
        }
    }, []);
    // 初始化預設資料
    const initializeDefaultData = () => {
        const initialData = [
            {
                id: '1',
                userId: 'A001',
                userName: '系統管理員',
                memberType: '一般會員',
                amount: 30000,
                dueDate: '2024-12-31',
                status: 'pending',
                note: '2024年度會費'
            },
            {
                id: '2',
                userId: 'V001',
                userName: '梁坤榮',
                memberType: '商務會員',
                amount: 300000,
                dueDate: '2024-12-31',
                status: 'pending',
                note: '2024年度會費'
            }
        ];
        setCollections(initialData);
        localStorage.setItem('feeCollections', JSON.stringify(initialData));
    };
    // 儲存資料到 localStorage
    const saveToLocalStorage = (data) => {
        console.log('Saving data:', data); // 添加日誌
        localStorage.setItem('feeCollections', JSON.stringify(data));
        setCollections(data);
    };
    const handleEdit = (collection) => {
        setEditingId(collection.id);
        setEditData({ ...collection });
    };
    const handleSave = () => {
        if (!editData)
            return;
        console.log('準備儲存編輯資料:', editData);
        // 更新收款狀況
        const newCollections = collections.map(c => c.id === editingId ? { ...editData } : c);
        // 先儲存收款狀況
        try {
            localStorage.setItem('feeCollections', JSON.stringify(newCollections));
            setCollections(newCollections);
            console.log('已更新收款狀況:', newCollections);
            // 同步更新歷史記錄
            const existingHistory = localStorage.getItem('feeHistory');
            let historyData = [];
            try {
                historyData = existingHistory ? JSON.parse(existingHistory) : [];
            }
            catch (e) {
                console.error('解析歷史記錄失敗:', e);
                historyData = [];
            }
            console.log('現有歷史記錄:', historyData);
            // 建立新的歷史記錄
            const newHistoryEntry = {
                id: `${editData.id}_${Date.now()}`,
                userId: editData.userId,
                userName: editData.userName,
                memberType: editData.memberType,
                amount: editData.amount,
                dueDate: editData.dueDate,
                paymentDate: editData.status === 'paid' ? new Date().toISOString() : null,
                status: editData.status,
                paymentMethod: editData.paymentMethod || '',
                receiptNumber: editData.receiptNumber || '',
                note: editData.note || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            console.log('新增歷史記錄:', newHistoryEntry);
            // 添加新的歷史記錄
            historyData.push(newHistoryEntry);
            localStorage.setItem('feeHistory', JSON.stringify(historyData));
            console.log('歷史記錄已更新');
            // 重置編輯狀態
            setEditingId(null);
            setEditData(null);
        }
        catch (error) {
            console.error('儲存資料時發生錯誤:', error);
            alert('儲存失敗，請重試');
        }
    };
    const handleCancel = () => {
        setEditingId(null);
        setEditData(null);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'overdue':
                return 'error';
            default:
                return 'default';
        }
    };
    const getStatusLabel = (status) => {
        switch (status) {
            case 'paid':
                return '已收款';
            case 'pending':
                return '待收款';
            case 'overdue':
                return '逾期';
            default:
                return status;
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", sx: { mb: 2 }, children: "\u6536\u6B3E\u72C0\u6CC1" }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u59D3\u540D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5230\u671F\u65E5" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7E73\u8CBB\u65B9\u5F0F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6536\u64DA\u865F\u78BC" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5099\u8A3B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: collections.map((collection) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: collection.userId }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: collection.userName }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: collection.memberType }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: editingId === collection.id ? ((0, jsx_runtime_1.jsx)(material_1.TextField, { type: "number", value: (editData === null || editData === void 0 ? void 0 : editData.amount) || '', onChange: (e) => setEditData(prev => prev ? { ...prev, amount: Number(e.target.value) } : null), size: "small", fullWidth: true })) : ((0, numberUtils_1.formatCurrency)(collection.amount)) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: collection.dueDate }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: editingId === collection.id ? ((0, jsx_runtime_1.jsx)(material_1.FormControl, { fullWidth: true, size: "small", children: (0, jsx_runtime_1.jsxs)(material_1.Select, { value: (editData === null || editData === void 0 ? void 0 : editData.status) || '', onChange: (e) => setEditData(prev => prev ? { ...prev, status: e.target.value } : null), children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "paid", children: "\u5DF2\u6536\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "pending", children: "\u5F85\u6536\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "overdue", children: "\u903E\u671F" })] }) })) : ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusLabel(collection.status), color: getStatusColor(collection.status), size: "small" })) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: editingId === collection.id ? ((0, jsx_runtime_1.jsx)(material_1.TextField, { value: (editData === null || editData === void 0 ? void 0 : editData.paymentMethod) || '', onChange: (e) => setEditData(prev => prev ? { ...prev, paymentMethod: e.target.value } : null), size: "small", fullWidth: true })) : (collection.paymentMethod || '-') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: editingId === collection.id ? ((0, jsx_runtime_1.jsx)(material_1.TextField, { value: (editData === null || editData === void 0 ? void 0 : editData.receiptNumber) || '', onChange: (e) => setEditData(prev => prev ? { ...prev, receiptNumber: e.target.value } : null), size: "small", fullWidth: true })) : (collection.receiptNumber || '-') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: editingId === collection.id ? ((0, jsx_runtime_1.jsx)(material_1.TextField, { value: (editData === null || editData === void 0 ? void 0 : editData.note) || '', onChange: (e) => setEditData(prev => prev ? { ...prev, note: e.target.value } : null), size: "small", fullWidth: true })) : (collection.note || '-') }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: editingId === collection.id ? ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: handleSave, size: "small", color: "primary", tabIndex: 0, children: (0, jsx_runtime_1.jsx)(icons_material_1.Save, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: handleCancel, size: "small", color: "error", tabIndex: 0, children: (0, jsx_runtime_1.jsx)(icons_material_1.Cancel, {}) })] })) : ((0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: () => handleEdit(collection), size: "small", tabIndex: 0, children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) })) })] }, collection.id))) })] }) })] }));
};
exports.default = FeeCollectionStatus;
