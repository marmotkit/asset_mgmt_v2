"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const notistack_1 = require("notistack");
const date_fns_1 = require("date-fns");
const services_1 = require("../../../types/services");
const memberServiceAPI_1 = require("../../../services/memberServiceAPI");
const LoadingSpinner_1 = __importDefault(require("../../common/LoadingSpinner"));
const ActivityRegistrationsTable = ({ activityId, members, onReload }) => {
    const [registrations, setRegistrations] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [registrationForm, setRegistrationForm] = (0, react_1.useState)({
        activityId,
        memberId: '',
        companions: 0,
        notes: '',
        status: services_1.RegistrationStatus.PENDING
    });
    const [formErrors, setFormErrors] = (0, react_1.useState)({});
    const [confirmOpen, setConfirmOpen] = (0, react_1.useState)(false);
    const [deleteRegistrationId, setDeleteRegistrationId] = (0, react_1.useState)(null);
    const [selectedRegistration, setSelectedRegistration] = (0, react_1.useState)(null);
    const [editMode, setEditMode] = (0, react_1.useState)(false);
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    (0, react_1.useEffect)(() => {
        loadRegistrations();
    }, [activityId]);
    const loadRegistrations = async () => {
        try {
            setLoading(true);
            const data = await memberServiceAPI_1.MemberServiceAPI.getRegistrations(activityId);
            setRegistrations(data);
        }
        catch (error) {
            console.error('載入報名記錄失敗', error);
            enqueueSnackbar('載入報名記錄失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const handleOpenDialog = (registration) => {
        if (registration) {
            console.log('編輯報名記錄:', registration); // 除錯用
            setRegistrationForm({
                activityId: registration.activityId,
                memberId: registration.memberId,
                companions: registration.companions || 0,
                notes: registration.notes || '',
                status: registration.status
            });
            setEditMode(true);
            setSelectedRegistration(registration);
        }
        else {
            // 新增報名時，自動帶出當前登入會員資訊
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('當前用戶資訊:', currentUser); // 除錯用
            // 找到對應的會員ID
            const currentMember = members.find(m => m.id === currentUser.id ||
                m.name === currentUser.name ||
                m.username === currentUser.username);
            setRegistrationForm({
                activityId,
                memberId: (currentMember === null || currentMember === void 0 ? void 0 : currentMember.id) || '',
                companions: 0,
                notes: '',
                status: services_1.RegistrationStatus.PENDING
            });
            setEditMode(false);
            setSelectedRegistration(null);
        }
        setFormErrors({});
        setDialogOpen(true);
    };
    const handleCloseDialog = () => {
        setDialogOpen(false);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegistrationForm({
            ...registrationForm,
            [name]: value
        });
    };
    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        console.log('狀態變更:', { oldStatus: registrationForm.status, newStatus }); // 除錯用
        setRegistrationForm({
            ...registrationForm,
            status: newStatus
        });
    };
    const handleMemberChange = (e) => {
        setRegistrationForm({
            ...registrationForm,
            memberId: e.target.value
        });
    };
    const handleCompanionsChange = (e) => {
        const companions = parseInt(e.target.value, 10);
        setRegistrationForm({
            ...registrationForm,
            companions: isNaN(companions) ? 0 : companions
        });
    };
    const validateForm = () => {
        const errors = {};
        if (!registrationForm.memberId)
            errors.memberId = '請選擇會員';
        if (registrationForm.companions && registrationForm.companions < 0) {
            errors.companions = '隨行人數不能為負數';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            setLoading(true);
            if (editMode && selectedRegistration) {
                // 更新現有報名記錄
                console.log('更新報名記錄，狀態:', registrationForm.status); // 除錯用
                console.log('更新報名記錄，完整資料:', registrationForm); // 除錯用
                const updateData = {
                    status: registrationForm.status,
                    notes: registrationForm.notes || '',
                    companions: registrationForm.companions || 0
                };
                console.log('發送到後端的資料:', updateData); // 除錯用
                await memberServiceAPI_1.MemberServiceAPI.updateRegistration(selectedRegistration.id, updateData);
                enqueueSnackbar('報名記錄更新成功', { variant: 'success' });
            }
            else {
                // 建立新報名記錄
                const member = members.find(m => m.id === registrationForm.memberId);
                await memberServiceAPI_1.MemberServiceAPI.createActivityRegistration({
                    activityId: activityId,
                    memberName: (member === null || member === void 0 ? void 0 : member.name) || '未知會員',
                    phoneNumber: (member === null || member === void 0 ? void 0 : member.phone) || '',
                    totalParticipants: (registrationForm.companions || 0) + 1,
                    maleCount: 0,
                    femaleCount: 0,
                    notes: registrationForm.notes || ''
                });
                enqueueSnackbar('報名記錄建立成功', { variant: 'success' });
            }
            await loadRegistrations();
            if (onReload)
                onReload();
            handleCloseDialog();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '儲存報名記錄失敗';
            console.error('儲存報名記錄失敗', error);
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const handleDeleteConfirm = (id) => {
        setDeleteRegistrationId(id);
        setConfirmOpen(true);
    };
    const handleDelete = async () => {
        if (!deleteRegistrationId)
            return;
        try {
            setLoading(true);
            await memberServiceAPI_1.MemberServiceAPI.deleteRegistration(deleteRegistrationId);
            enqueueSnackbar('報名記錄刪除成功', { variant: 'success' });
            await loadRegistrations();
            if (onReload)
                onReload();
        }
        catch (error) {
            console.error('刪除報名記錄失敗', error);
            enqueueSnackbar('刪除報名記錄失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
            setConfirmOpen(false);
            setDeleteRegistrationId(null);
        }
    };
    const getStatusChip = (status) => {
        let color = 'default';
        switch (status) {
            case services_1.RegistrationStatus.PENDING:
                color = 'info';
                break;
            case services_1.RegistrationStatus.CONFIRMED:
                color = 'success';
                break;
            case services_1.RegistrationStatus.CANCELLED:
                color = 'error';
                break;
            case services_1.RegistrationStatus.ATTENDED:
                color = 'primary';
                break;
            case services_1.RegistrationStatus.ABSENT:
                color = 'warning';
                break;
        }
        return (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusText(status), color: color, size: "small" });
    };
    const getStatusText = (status) => {
        const statusMap = {
            [services_1.RegistrationStatus.PENDING]: '待確認',
            [services_1.RegistrationStatus.CONFIRMED]: '已確認',
            [services_1.RegistrationStatus.CANCELLED]: '已取消',
            [services_1.RegistrationStatus.ATTENDED]: '已出席',
            [services_1.RegistrationStatus.ABSENT]: '未出席'
        };
        return statusMap[status] || '未知';
    };
    const getMemberName = (memberId, memberName) => {
        // 優先使用 member_name 欄位
        if (memberName && memberName.trim()) {
            return memberName;
        }
        // 如果沒有 member_name，則從 members 陣列中查找
        const member = members.find(m => m.id === memberId);
        return member ? member.name : '未找到會員';
    };
    const formatDate = (dateString) => {
        try {
            return (0, date_fns_1.format)(new Date(dateString), 'yyyy/MM/dd HH:mm');
        }
        catch (error) {
            return dateString;
        }
    };
    return ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mb: 2, display: 'flex', justifyContent: 'flex-end' }, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => handleOpenDialog(), children: "\u65B0\u589E\u5831\u540D" }) }), loading ? ((0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {})) : ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5831\u540D\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u96A8\u884C\u4EBA\u6578" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5099\u8A3B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: registrations.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 6, align: "center", children: "\u66AB\u7121\u5831\u540D\u8A18\u9304" }) })) : (registrations.map((registration) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getMemberName(registration.memberId, registration.memberName) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: formatDate(registration.registrationDate) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [registration.companions || 0, " \u4EBA"] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: registration.notes }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getStatusChip(registration.status) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "primary", onClick: () => handleOpenDialog(registration), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, { fontSize: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleDeleteConfirm(registration.id), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, { fontSize: "small" }) })] })] }, registration.id)))) })] }) })), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: handleCloseDialog, maxWidth: "sm", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: editMode ? '編輯報名資訊' : '新增報名' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, error: !!formErrors.memberId, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "member-label", children: "\u6703\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "member-label", value: registrationForm.memberId || '', onChange: handleMemberChange, label: "\u6703\u54E1", disabled: editMode, children: members.map((member) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: member.id, children: [member.name, " (", member.memberNo, ")"] }, member.id))) }), formErrors.memberId && (0, jsx_runtime_1.jsx)(material_1.FormHelperText, { children: formErrors.memberId })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u96A8\u884C\u4EBA\u6578", name: "companions", type: "number", value: registrationForm.companions || 0, onChange: handleCompanionsChange, error: !!formErrors.companions, helperText: formErrors.companions, InputProps: { inputProps: { min: 0 } } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, error: !!formErrors.status, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "status-label", children: "\u5831\u540D\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "status-label", value: registrationForm.status || services_1.RegistrationStatus.PENDING, onChange: handleStatusChange, label: "\u5831\u540D\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.RegistrationStatus.PENDING, children: "\u5F85\u78BA\u8A8D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.RegistrationStatus.CONFIRMED, children: "\u5DF2\u78BA\u8A8D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.RegistrationStatus.CANCELLED, children: "\u5DF2\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.RegistrationStatus.ATTENDED, children: "\u5DF2\u51FA\u5E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.RegistrationStatus.ABSENT, children: "\u672A\u51FA\u5E2D" })] }), formErrors.status && (0, jsx_runtime_1.jsx)(material_1.FormHelperText, { children: formErrors.status })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5099\u8A3B", name: "notes", value: registrationForm.notes || '', onChange: handleInputChange, multiline: true, rows: 2 }) }), registrationForm.specialRequests && ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7279\u6B8A\u9700\u6C42", name: "specialRequests", value: registrationForm.specialRequests || '', onChange: handleInputChange, multiline: true, rows: 2 }) }))] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", disabled: loading, children: loading ? '處理中...' : '儲存' })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: confirmOpen, onClose: () => setConfirmOpen(false), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u9019\u500B\u5831\u540D\u8A18\u9304\u55CE\uFF1F" }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setConfirmOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDelete, color: "error", variant: "contained", children: "\u78BA\u5B9A\u522A\u9664" })] })] })] }));
};
exports.default = ActivityRegistrationsTable;
