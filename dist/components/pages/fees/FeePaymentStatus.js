"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const feeService_1 = require("../../../services/feeService");
const api_service_1 = require("../../../services/api.service");
const getStatusChip = (status) => {
    const statusConfig = {
        '待收款': { label: '待收款', color: 'warning' },
        '已收款': { label: '已收款', color: 'success' },
        '逾期': { label: '逾期', color: 'error' },
        '終止': { label: '終止', color: 'default' }
    };
    const config = statusConfig[status] || { label: status, color: 'default' };
    return (0, jsx_runtime_1.jsx)(material_1.Chip, { label: config.label, color: config.color, size: "small" });
};
const getPaymentMethodLabel = (method) => {
    if (!method || method === '')
        return '-';
    const methodConfig = {
        '轉帳': '轉帳',
        'transfer': '轉帳',
        'Line Pay': 'Line Pay',
        'linepay': 'Line Pay',
        '現金': '現金',
        'cash': '現金',
        '票據': '票據',
        'check': '票據',
        '其他': '其他',
        'other': '其他'
    };
    return methodConfig[method.toLowerCase()] || method;
};
const FeePaymentStatus = () => {
    const [payments, setPayments] = (0, react_1.useState)([]);
    const [feeSettings, setFeeSettings] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [editingPayment, setEditingPayment] = (0, react_1.useState)(null);
    const [deletePayment, setDeletePayment] = (0, react_1.useState)(null);
    const [filter, setFilter] = (0, react_1.useState)({
        status: '',
        memberType: '',
        search: ''
    });
    const [open, setOpen] = (0, react_1.useState)(false);
    const [snackbar, setSnackbar] = (0, react_1.useState)({
        open: false,
        message: '',
        severity: 'success'
    });
    const [createAnnualOpen, setCreateAnnualOpen] = (0, react_1.useState)(false);
    const [selectedMember, setSelectedMember] = (0, react_1.useState)('');
    const [selectedFeeSetting, setSelectedFeeSetting] = (0, react_1.useState)('');
    const [selectedYear, setSelectedYear] = (0, react_1.useState)(new Date().getFullYear());
    const [availableMembers, setAvailableMembers] = (0, react_1.useState)([
        { id: 'M001', name: '張三', type: '一般會員' },
        { id: 'M002', name: '李四', type: '商務會員' },
        // 這裡應該從 API 獲取會員列表
    ]);
    const [currentTab, setCurrentTab] = (0, react_1.useState)(() => {
        // 根據當前 URL 判斷是否在歷史記錄頁面
        return window.location.pathname.includes('歷史記錄') ? '歷史記錄' : '收款狀況';
    });
    // 載入資料
    (0, react_1.useEffect)(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [paymentData, settingsData] = await Promise.all([
                    feeService_1.feeService.getPayments({ isHistoryPage: window.location.pathname.includes('歷史記錄') }),
                    feeService_1.feeService.getFeeSettings()
                ]);
                setPayments(paymentData || []);
                setFeeSettings(settingsData || []);
                // 轉換會員資料格式
                const users = await api_service_1.ApiService.getUsers();
                const members = users.map((user) => ({
                    id: user.memberNo,
                    name: user.name,
                    type: user.role === 'lifetime' ? '永久會員' :
                        user.role === 'admin' ? '管理員' :
                            user.role === 'business' ? '商務會員' : '一般會員'
                }));
                setAvailableMembers(members);
            }
            catch (error) {
                console.error('載入資料失敗:', error);
                setSnackbar({
                    open: true,
                    message: '載入資料失敗',
                    severity: 'error'
                });
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    // 處理刪除
    const handleDeleteClick = (payment) => {
        setDeletePayment(payment);
    };
    const handleDeleteConfirm = async () => {
        if (deletePayment) {
            try {
                // 刪除付款記錄
                const success = await feeService_1.feeService.deletePayment(deletePayment.id);
                if (success) {
                    // 從本地狀態中移除記錄
                    setPayments(prev => prev.filter(p => p.id !== deletePayment.id));
                    setSnackbar({
                        open: true,
                        message: '成功刪除記錄',
                        severity: 'success'
                    });
                }
            }
            catch (error) {
                console.error('刪除失敗:', error);
                setSnackbar({
                    open: true,
                    message: '刪除失敗',
                    severity: 'error'
                });
            }
            setDeletePayment(null);
        }
    };
    // 處理編輯
    const handleEditClick = (payment) => {
        setEditingPayment({ ...payment });
    };
    const handleEditSave = async () => {
        if (editingPayment) {
            try {
                const updated = await feeService_1.feeService.updatePayment(editingPayment.id, editingPayment);
                if (updated) {
                    setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
                }
            }
            catch (error) {
                console.error('更新失敗:', error);
            }
            setEditingPayment(null);
        }
    };
    // 處理篩選
    const handleFilterChange = (field, value) => {
        setFilter(prev => ({
            ...prev,
            [field]: value
        }));
    };
    // 篩選資料
    const filteredPayments = payments
        .filter(payment => {
        const matchStatus = !filter.status || payment.status === filter.status;
        const matchType = !filter.memberType || payment.memberType === filter.memberType;
        const matchSearch = !filter.search ||
            payment.memberName.toLowerCase().includes(filter.search.toLowerCase()) ||
            payment.memberId.toLowerCase().includes(filter.search.toLowerCase());
        return matchStatus && matchType && matchSearch;
    })
        .sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateB.getTime() - dateA.getTime();
    });
    // 取得會員類型選項
    const memberTypes = Array.from(new Set(payments.map(p => p.memberType)));
    const handleCreateAnnual = async () => {
        if (!selectedMember || !selectedFeeSetting)
            return;
        const member = availableMembers.find(m => m.id === selectedMember);
        const feeSetting = feeSettings.find(f => f.id === selectedFeeSetting);
        if (!member || !feeSetting)
            return;
        try {
            const newPayment = {
                memberId: member.id,
                memberName: member.name,
                memberType: member.type,
                amount: feeSetting.amount,
                dueDate: `${selectedYear}-12-31`,
                status: '待收款',
                note: `${selectedYear}年度會費`,
                feeSettingId: feeSetting.id
            };
            const created = await feeService_1.feeService.createPayment(newPayment);
            if (created) {
                setPayments(prev => [...prev, created]);
                setSnackbar({
                    open: true,
                    message: '成功建立年度應收項目',
                    severity: 'success'
                });
            }
        }
        catch (error) {
            setSnackbar({
                open: true,
                message: '建立年度應收項目失敗',
                severity: 'error'
            });
        }
        setCreateAnnualOpen(false);
        setSelectedMember('');
        setSelectedFeeSetting('');
    };
    // 過濾掉已經存在的會員和管理員，同時考慮年度
    const filteredAvailableMembers = availableMembers.filter(member => !payments.some(p => {
        var _a;
        return p.memberId === member.id &&
            ((_a = p.note) === null || _a === void 0 ? void 0 : _a.includes(`${selectedYear}年度會費`));
    }) && member.type !== '管理員');
    const handleMemberSelect = (memberId) => {
        setSelectedMember(memberId);
        const member = availableMembers.find(m => m.id === memberId);
        if (member) {
            console.log('選擇的會員:', member);
            // 根據會員類型自動選擇對應的會費標準
            const memberTypeMap = {
                '一般會員': '一般會員年費',
                '商務會員': '商務會員年費',
                '永久會員': '永久會員5年費用',
                '管理員': '管理員免費'
            };
            const expectedFeeName = memberTypeMap[member.type];
            console.log('預期的會費名稱:', expectedFeeName);
            console.log('可用的會費設定:', feeSettings);
            const matchingFeeSetting = feeSettings.find(setting => {
                console.log('比對:', setting.name, expectedFeeName);
                return setting.name === expectedFeeName;
            });
            console.log('匹配的會費設定:', matchingFeeSetting);
            if (matchingFeeSetting) {
                setSelectedFeeSetting(matchingFeeSetting.id);
            }
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(material_1.Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: (0, jsx_runtime_1.jsx)(material_1.CircularProgress, {}) }));
    }
    const handleFieldChange = (field, value) => {
        if (editingPayment) {
            const newPayment = { ...editingPayment };
            switch (field) {
                case 'amount':
                    newPayment.amount = Number(value);
                    break;
                case 'status':
                    newPayment.status = value;
                    break;
                case 'paymentMethod':
                    newPayment.paymentMethod = value;
                    break;
                case 'dueDate':
                case 'paidDate':
                case 'note':
                    newPayment[field] = value;
                    break;
            }
            setEditingPayment(newPayment);
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => setCreateAnnualOpen(true), sx: { mr: 2 }, children: "\u7522\u751F\u5E74\u5EA6\u61C9\u6536" }), (0, jsx_runtime_1.jsx)(material_1.TextField, { size: "small", placeholder: "\u641C\u5C0B\u6703\u54E1\u7DE8\u865F\u6216\u59D3\u540D", value: filter.search, onChange: (e) => handleFilterChange('search', e.target.value), InputProps: {
                            startAdornment: ((0, jsx_runtime_1.jsx)(material_1.InputAdornment, { position: "start", children: (0, jsx_runtime_1.jsx)(icons_material_1.Search, {}) })),
                        }, sx: { width: 250 } })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u7DE8\u865F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u59D3\u540D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u91D1\u984D" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5230\u671F\u65E5" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7E73\u8CBB\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6536\u6B3E\u65B9\u5F0F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5099\u8A3B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: filteredPayments.map((payment) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.memberId }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.memberName }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.memberType }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: payment.amount.toLocaleString() }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.dueDate }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.paidDate || '-' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getPaymentMethodLabel(payment.paymentMethod) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getStatusChip(payment.status) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: payment.note || '-' }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [(0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u7DE8\u8F2F", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleEditClick(payment), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, {}) }) }), (0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: "\u522A\u9664", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleDeleteClick(payment), color: "error", children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, {}) }) })] })] }, payment.id))) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: !!editingPayment, onClose: () => setEditingPayment(null), maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u7DE8\u8F2F\u6536\u6B3E\u8CC7\u8A0A" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { pt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6703\u54E1\u7DE8\u865F", name: "memberId", value: (editingPayment === null || editingPayment === void 0 ? void 0 : editingPayment.memberId) || '', disabled: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u59D3\u540D", name: "memberName", value: (editingPayment === null || editingPayment === void 0 ? void 0 : editingPayment.memberName) || '', disabled: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6703\u54E1\u985E\u578B", name: "memberType", value: (editingPayment === null || editingPayment === void 0 ? void 0 : editingPayment.memberType) || '', disabled: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u91D1\u984D", name: "amount", type: "number", value: (editingPayment === null || editingPayment === void 0 ? void 0 : editingPayment.amount) || '', onChange: (e) => handleFieldChange('amount', e.target.value) }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5230\u671F\u65E5", name: "dueDate", type: "date", value: (editingPayment === null || editingPayment === void 0 ? void 0 : editingPayment.dueDate) || '', onChange: (e) => handleFieldChange('dueDate', e.target.value), InputLabelProps: { shrink: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: (editingPayment === null || editingPayment === void 0 ? void 0 : editingPayment.status) || '', onChange: (e) => {
                                                    if (editingPayment) {
                                                        const newStatus = e.target.value;
                                                        const newPayment = {
                                                            ...editingPayment,
                                                            status: newStatus,
                                                            // 如果狀態改為已收款且尚未設定收款方式，預設為轉帳
                                                            paymentMethod: newStatus === '已收款' && !editingPayment.paymentMethod ? '轉帳' : editingPayment.paymentMethod,
                                                            // 如果狀態改為已收款且尚未設定繳費日期，設定為今天
                                                            paidDate: newStatus === '已收款' && !editingPayment.paidDate ? new Date().toISOString().split('T')[0] : editingPayment.paidDate
                                                        };
                                                        setEditingPayment(newPayment);
                                                    }
                                                }, label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u5F85\u6536\u6B3E", children: "\u5F85\u6536\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u5DF2\u6536\u6B3E", children: "\u5DF2\u6536\u6B3E" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u903E\u671F", children: "\u903E\u671F" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u7D42\u6B62", children: "\u7D42\u6B62" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6536\u6B3E\u65B9\u5F0F" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: (editingPayment === null || editingPayment === void 0 ? void 0 : editingPayment.paymentMethod) || '', onChange: (e) => {
                                                    if (editingPayment) {
                                                        setEditingPayment({
                                                            ...editingPayment,
                                                            paymentMethod: e.target.value
                                                        });
                                                    }
                                                }, label: "\u6536\u6B3E\u65B9\u5F0F", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u8F49\u5E33", children: "\u8F49\u5E33" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "Line Pay", children: "Line Pay" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u73FE\u91D1", children: "\u73FE\u91D1" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u7968\u64DA", children: "\u7968\u64DA" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "\u5176\u4ED6", children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7E73\u8CBB\u65E5\u671F", name: "paidDate", type: "date", value: (editingPayment === null || editingPayment === void 0 ? void 0 : editingPayment.paidDate) || '', onChange: (e) => handleFieldChange('paidDate', e.target.value), InputLabelProps: { shrink: true } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5099\u8A3B", name: "note", multiline: true, rows: 4, value: (editingPayment === null || editingPayment === void 0 ? void 0 : editingPayment.note) || '', onChange: (e) => handleFieldChange('note', e.target.value) }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setEditingPayment(null), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleEditSave, variant: "contained", children: "\u5132\u5B58" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: !!deletePayment, onClose: () => setDeletePayment(null), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Typography, { children: ["\u78BA\u5B9A\u8981\u522A\u9664 ", deletePayment === null || deletePayment === void 0 ? void 0 : deletePayment.memberName, " \u7684\u7E73\u8CBB\u8A18\u9304\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002"] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setDeletePayment(null), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDeleteConfirm, variant: "contained", color: "error", children: "\u522A\u9664" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: createAnnualOpen, onClose: () => setCreateAnnualOpen(false), maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u7522\u751F\u5E74\u5EA6\u61C9\u6536" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { pt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5E74\u5EA6", type: "number", value: selectedYear, onChange: (e) => {
                                            const year = parseInt(e.target.value);
                                            if (year >= 1911) { // 設定最小年度為1911年
                                                setSelectedYear(year);
                                            }
                                        }, InputProps: {
                                            inputProps: { min: 1911 }
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u9078\u64C7\u6703\u54E1" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: selectedMember || '', onChange: (e) => handleMemberSelect(e.target.value), fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u8ACB\u9078\u64C7\u6703\u54E1" }), filteredAvailableMembers.map((member) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: member.id, children: [member.name, " (", member.type, ")"] }, member.id)))] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6703\u8CBB\u6A19\u6E96" }), (0, jsx_runtime_1.jsx)(material_1.Select, { value: selectedFeeSetting, label: "\u6703\u8CBB\u6A19\u6E96", onChange: (e) => setSelectedFeeSetting(e.target.value), children: (feeSettings || []).map((setting) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: setting.id, children: [setting.name, " - ", setting.amount.toLocaleString(), " \u5143"] }, setting.id))) })] }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setCreateAnnualOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCreateAnnual, variant: "contained", disabled: !selectedMember || !selectedFeeSetting, children: "\u5EFA\u7ACB" })] })] }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackbar.open, autoHideDuration: 3000, onClose: () => setSnackbar(prev => ({ ...prev, open: false })), anchorOrigin: { vertical: 'top', horizontal: 'center' }, children: (0, jsx_runtime_1.jsx)(material_1.Alert, { onClose: () => setSnackbar(prev => ({ ...prev, open: false })), severity: snackbar.severity, children: snackbar.message }) })] }));
};
exports.default = FeePaymentStatus;
