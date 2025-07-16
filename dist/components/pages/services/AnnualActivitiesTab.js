"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const notistack_1 = require("notistack");
const AdapterDateFns_1 = require("@mui/x-date-pickers/AdapterDateFns");
const x_date_pickers_1 = require("@mui/x-date-pickers");
const zh_TW_1 = __importDefault(require("date-fns/locale/zh-TW"));
const date_fns_1 = require("date-fns");
const services_1 = require("../../../types/services");
const memberServiceAPI_1 = require("../../../services/memberServiceAPI");
const api_service_1 = require("../../../services/api.service");
const AuthContext_1 = require("../../../contexts/AuthContext");
const LoadingSpinner_1 = __importDefault(require("../../common/LoadingSpinner"));
const ActivityRegistrationsTable_1 = __importDefault(require("./ActivityRegistrationsTable"));
const AnnualActivitiesTab = () => {
    var _a;
    const { user } = (0, AuthContext_1.useAuth)(); // 新增權限控制
    const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'admin'; // 檢查是否為管理者
    const [activities, setActivities] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [activityForm, setActivityForm] = (0, react_1.useState)({
        title: '',
        description: '',
        startDate: (0, date_fns_1.formatISO)(new Date()),
        endDate: (0, date_fns_1.formatISO)(new Date()),
        location: '',
        capacity: 20,
        registrationDeadline: (0, date_fns_1.formatISO)(new Date()),
        status: services_1.ActivityStatus.PLANNING,
        year: new Date().getFullYear(),
        isVisible: true // 新增顯示狀態
    });
    const [formErrors, setFormErrors] = (0, react_1.useState)({});
    const [confirmOpen, setConfirmOpen] = (0, react_1.useState)(false);
    const [deleteActivityId, setDeleteActivityId] = (0, react_1.useState)(null);
    const [selectedActivity, setSelectedActivity] = (0, react_1.useState)(null);
    const [editMode, setEditMode] = (0, react_1.useState)(false);
    const [yearFilter, setYearFilter] = (0, react_1.useState)(new Date().getFullYear());
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('');
    const [members, setMembers] = (0, react_1.useState)([]);
    const [expandedIds, setExpandedIds] = (0, react_1.useState)([]);
    // 新增報名相關狀態
    const [registrationDialogOpen, setRegistrationDialogOpen] = (0, react_1.useState)(false);
    const [registrationForm, setRegistrationForm] = (0, react_1.useState)({
        activityId: '',
        memberName: '',
        totalParticipants: 1,
        maleCount: 0,
        femaleCount: 0,
        phoneNumber: '',
        notes: ''
    });
    const [registrationErrors, setRegistrationErrors] = (0, react_1.useState)({});
    const [myRegistrations, setMyRegistrations] = (0, react_1.useState)([]);
    const [showMyRegistrations, setShowMyRegistrations] = (0, react_1.useState)(false);
    // 管理者專用狀態
    const [managementDialogOpen, setManagementDialogOpen] = (0, react_1.useState)(false);
    const [selectedActivityForManagement, setSelectedActivityForManagement] = (0, react_1.useState)(null);
    const [activityRegistrations, setActivityRegistrations] = (0, react_1.useState)([]);
    const [selectedRegistrations, setSelectedRegistrations] = (0, react_1.useState)([]);
    const [bulkStatusUpdate, setBulkStatusUpdate] = (0, react_1.useState)(services_1.RegistrationStatus.PENDING);
    const [statistics, setStatistics] = (0, react_1.useState)(null);
    const [showStatistics, setShowStatistics] = (0, react_1.useState)(false);
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    (0, react_1.useEffect)(() => {
        loadActivities();
        loadMembers();
    }, [yearFilter, statusFilter]);
    const loadActivities = async () => {
        try {
            setLoading(true);
            const data = await memberServiceAPI_1.MemberServiceAPI.getActivities(yearFilter, statusFilter || undefined);
            setActivities(data);
        }
        catch (error) {
            console.error('載入年度活動失敗', error);
            enqueueSnackbar('載入年度活動失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const loadMembers = async () => {
        try {
            const data = await api_service_1.ApiService.getUsers();
            setMembers(data);
        }
        catch (error) {
            console.error('載入會員資料失敗', error);
        }
    };
    const handleOpenDialog = (activity) => {
        if (activity) {
            setActivityForm({
                ...activity
            });
            setEditMode(true);
            setSelectedActivity(activity);
        }
        else {
            setActivityForm({
                title: '',
                description: '',
                startDate: (0, date_fns_1.formatISO)(new Date()),
                endDate: (0, date_fns_1.formatISO)(new Date()),
                location: '',
                capacity: 20,
                registrationDeadline: (0, date_fns_1.formatISO)(new Date()),
                status: services_1.ActivityStatus.PLANNING,
                year: yearFilter
            });
            setEditMode(false);
            setSelectedActivity(null);
        }
        setFormErrors({});
        setDialogOpen(true);
    };
    const handleCloseDialog = () => {
        setDialogOpen(false);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setActivityForm({
            ...activityForm,
            [name]: value
        });
    };
    const handleStatusChange = (e) => {
        setActivityForm({
            ...activityForm,
            status: e.target.value
        });
    };
    const handleYearChange = (e) => {
        setActivityForm({
            ...activityForm,
            year: parseInt(e.target.value, 10)
        });
    };
    const handleCapacityChange = (e) => {
        const capacity = parseInt(e.target.value, 10);
        setActivityForm({
            ...activityForm,
            capacity: isNaN(capacity) ? 0 : capacity
        });
    };
    const handleStartDateChange = (date) => {
        if (date) {
            setActivityForm({
                ...activityForm,
                startDate: (0, date_fns_1.formatISO)(date)
            });
        }
    };
    const handleEndDateChange = (date) => {
        if (date) {
            setActivityForm({
                ...activityForm,
                endDate: (0, date_fns_1.formatISO)(date)
            });
        }
    };
    const handleDeadlineChange = (date) => {
        if (date) {
            setActivityForm({
                ...activityForm,
                registrationDeadline: (0, date_fns_1.formatISO)(date)
            });
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!activityForm.title)
            errors.title = '請輸入活動標題';
        if (!activityForm.description)
            errors.description = '請輸入活動描述';
        if (!activityForm.location)
            errors.location = '請輸入活動地點';
        if (!activityForm.capacity)
            errors.capacity = '請輸入活動人數上限';
        if (activityForm.capacity && activityForm.capacity < 0) {
            errors.capacity = '人數上限不能為負數';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm())
            return;
        try {
            setLoading(true);
            if (editMode && selectedActivity) {
                await memberServiceAPI_1.MemberServiceAPI.updateActivity(selectedActivity.id, activityForm);
                enqueueSnackbar('活動更新成功', { variant: 'success' });
            }
            else {
                await memberServiceAPI_1.MemberServiceAPI.createActivity(activityForm);
                enqueueSnackbar('活動建立成功', { variant: 'success' });
            }
            await loadActivities();
            handleCloseDialog();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '儲存活動失敗';
            console.error('儲存活動失敗', error);
            enqueueSnackbar(errorMessage, { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const handleDeleteConfirm = (id) => {
        setDeleteActivityId(id);
        setConfirmOpen(true);
    };
    const handleDelete = async () => {
        if (!deleteActivityId)
            return;
        try {
            setLoading(true);
            await memberServiceAPI_1.MemberServiceAPI.deleteActivity(deleteActivityId);
            enqueueSnackbar('活動刪除成功', { variant: 'success' });
            await loadActivities();
        }
        catch (error) {
            console.error('刪除活動失敗', error);
            enqueueSnackbar('刪除活動失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
            setConfirmOpen(false);
            setDeleteActivityId(null);
        }
    };
    const handleYearFilterChange = (e) => {
        setYearFilter(parseInt(e.target.value, 10));
    };
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };
    const toggleExpand = (activityId) => {
        setExpandedIds(prev => prev.includes(activityId)
            ? prev.filter(id => id !== activityId)
            : [...prev, activityId]);
    };
    const getStatusChip = (status) => {
        let color = 'default';
        switch (status) {
            case services_1.ActivityStatus.PLANNING:
                color = 'info';
                break;
            case services_1.ActivityStatus.REGISTRATION:
                color = 'primary';
                break;
            case services_1.ActivityStatus.ONGOING:
                color = 'success';
                break;
            case services_1.ActivityStatus.COMPLETED:
                color = 'secondary';
                break;
            case services_1.ActivityStatus.CANCELLED:
                color = 'error';
                break;
        }
        return (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusText(status), color: color, size: "small" });
    };
    const getStatusText = (status) => {
        const statusMap = {
            [services_1.ActivityStatus.PLANNING]: '計劃中',
            [services_1.ActivityStatus.REGISTRATION]: '報名中',
            [services_1.ActivityStatus.ONGOING]: '進行中',
            [services_1.ActivityStatus.COMPLETED]: '已完成',
            [services_1.ActivityStatus.CANCELLED]: '已取消',
            [services_1.ActivityStatus.HIDDEN]: '已隱藏'
        };
        return statusMap[status] || status;
    };
    const formatDate = (dateString) => {
        try {
            return (0, date_fns_1.format)(new Date(dateString), 'yyyy/MM/dd');
        }
        catch (error) {
            return dateString;
        }
    };
    // 計算年份選項，從當前年份往前五年、往後五年
    const getYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            years.push(i);
        }
        return years;
    };
    // 新增報名相關處理函數
    const handleOpenRegistrationDialog = (activity) => {
        // 自動帶出登入會員資訊
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('當前用戶資訊:', currentUser); // 除錯用
        setRegistrationForm({
            activityId: activity.id,
            memberName: currentUser.name || currentUser.username || '',
            phoneNumber: currentUser.phone || currentUser.phoneNumber || '',
            totalParticipants: 1,
            maleCount: 0,
            femaleCount: 0,
            notes: ''
        });
        setRegistrationErrors({});
        setRegistrationDialogOpen(true);
    };
    const handleCloseRegistrationDialog = () => {
        setRegistrationDialogOpen(false);
    };
    const handleRegistrationInputChange = (e) => {
        const { name, value } = e.target;
        setRegistrationForm({
            ...registrationForm,
            [name]: value
        });
        // 清除錯誤訊息
        if (registrationErrors[name]) {
            setRegistrationErrors({
                ...registrationErrors,
                [name]: ''
            });
        }
    };
    const handleRegistrationNumberChange = (e) => {
        const { name, value } = e.target;
        const numValue = parseInt(value, 10) || 0;
        setRegistrationForm({
            ...registrationForm,
            [name]: numValue
        });
        // 清除錯誤訊息
        if (registrationErrors[name]) {
            setRegistrationErrors({
                ...registrationErrors,
                [name]: ''
            });
        }
    };
    const validateRegistrationForm = () => {
        var _a, _b;
        const errors = {};
        if (!((_a = registrationForm.memberName) === null || _a === void 0 ? void 0 : _a.trim())) {
            errors.memberName = '請輸入報名姓名';
        }
        if (!((_b = registrationForm.phoneNumber) === null || _b === void 0 ? void 0 : _b.trim())) {
            errors.phoneNumber = '請輸入聯絡電話';
        }
        if (!registrationForm.totalParticipants || registrationForm.totalParticipants < 1) {
            errors.totalParticipants = '總人數至少為1人';
        }
        if (registrationForm.maleCount < 0) {
            errors.maleCount = '男性人數不能為負數';
        }
        if (registrationForm.femaleCount < 0) {
            errors.femaleCount = '女性人數不能為負數';
        }
        const total = (registrationForm.maleCount || 0) + (registrationForm.femaleCount || 0);
        if (total !== registrationForm.totalParticipants) {
            errors.totalParticipants = '男性人數 + 女性人數必須等於總人數';
        }
        setRegistrationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleRegistrationSubmit = async () => {
        if (!validateRegistrationForm()) {
            return;
        }
        try {
            setLoading(true);
            await memberServiceAPI_1.MemberServiceAPI.createActivityRegistration({
                activityId: registrationForm.activityId,
                memberName: registrationForm.memberName,
                phoneNumber: registrationForm.phoneNumber,
                totalParticipants: registrationForm.totalParticipants,
                maleCount: registrationForm.maleCount,
                femaleCount: registrationForm.femaleCount,
                notes: registrationForm.notes
            });
            enqueueSnackbar('報名成功！', { variant: 'success' });
            handleCloseRegistrationDialog();
            // 重新載入活動列表和我的報名記錄
            await loadActivities();
            if (!isAdmin) {
                await loadMyRegistrations();
            }
            // 強制更新組件狀態
            setRegistrationForm({
                activityId: '',
                memberName: '',
                totalParticipants: 1,
                maleCount: 0,
                femaleCount: 0,
                phoneNumber: '',
                notes: ''
            });
        }
        catch (error) {
            console.error('報名失敗', error);
            enqueueSnackbar(error.message || '報名失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const loadMyRegistrations = async () => {
        try {
            const data = await memberServiceAPI_1.MemberServiceAPI.getMyRegistrations();
            setMyRegistrations(data);
        }
        catch (error) {
            console.error('載入我的報名記錄失敗', error);
            enqueueSnackbar('載入我的報名記錄失敗', { variant: 'error' });
        }
    };
    const handleToggleActivityVisibility = async (activity) => {
        try {
            setLoading(true);
            await memberServiceAPI_1.MemberServiceAPI.updateActivity(activity.id, {
                ...activity,
                isVisible: !activity.isVisible
            });
            enqueueSnackbar(`活動已${activity.isVisible ? '隱藏' : '顯示'}`, { variant: 'success' });
            await loadActivities();
        }
        catch (error) {
            console.error('更新活動顯示狀態失敗', error);
            enqueueSnackbar('更新失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    // 管理者專用功能
    const handleOpenManagementDialog = async (activity) => {
        setSelectedActivityForManagement(activity);
        setManagementDialogOpen(true);
        await loadActivityRegistrations(activity.id);
        await calculateStatistics(activity.id);
    };
    const handleCloseManagementDialog = () => {
        setManagementDialogOpen(false);
        setSelectedActivityForManagement(null);
        setActivityRegistrations([]);
        setSelectedRegistrations([]);
        setStatistics(null);
    };
    const loadActivityRegistrations = async (activityId) => {
        try {
            const data = await memberServiceAPI_1.MemberServiceAPI.getRegistrations(activityId);
            // 轉換為ActivityRegistrationDetail格式
            const convertedData = data.map((reg) => ({
                id: reg.id,
                activityId: reg.activityId,
                memberId: reg.memberId,
                registrationDate: reg.registrationDate,
                status: reg.status,
                notes: reg.notes,
                createdAt: reg.createdAt,
                updatedAt: reg.updatedAt,
                memberName: reg.memberName,
                phoneNumber: reg.phoneNumber,
                maleCount: reg.maleCount,
                femaleCount: reg.femaleCount,
                totalParticipants: reg.totalParticipants,
                companions: reg.companions || 0,
                activityTitle: (selectedActivityForManagement === null || selectedActivityForManagement === void 0 ? void 0 : selectedActivityForManagement.title) || '',
                activityDate: (selectedActivityForManagement === null || selectedActivityForManagement === void 0 ? void 0 : selectedActivityForManagement.startDate) || '',
                activityLocation: (selectedActivityForManagement === null || selectedActivityForManagement === void 0 ? void 0 : selectedActivityForManagement.location) || ''
            }));
            setActivityRegistrations(convertedData);
        }
        catch (error) {
            console.error('載入活動報名記錄失敗', error);
            enqueueSnackbar('載入報名記錄失敗', { variant: 'error' });
        }
    };
    const calculateStatistics = async (activityId) => {
        try {
            const registrations = await memberServiceAPI_1.MemberServiceAPI.getRegistrations(activityId);
            const stats = {
                totalRegistrations: registrations.length,
                totalParticipants: registrations.reduce((sum, reg) => sum + (reg.totalParticipants || 0), 0),
                maleCount: registrations.reduce((sum, reg) => sum + (reg.maleCount || 0), 0),
                femaleCount: registrations.reduce((sum, reg) => sum + (reg.femaleCount || 0), 0),
                statusBreakdown: {
                    pending: registrations.filter(reg => reg.status === 'pending').length,
                    confirmed: registrations.filter(reg => reg.status === 'confirmed').length,
                    attended: registrations.filter(reg => reg.status === 'attended').length,
                    cancelled: registrations.filter(reg => reg.status === 'cancelled').length,
                    absent: registrations.filter(reg => reg.status === 'absent').length
                }
            };
            setStatistics(stats);
        }
        catch (error) {
            console.error('計算統計資料失敗', error);
        }
    };
    const handleSelectAllRegistrations = () => {
        if (selectedRegistrations.length === activityRegistrations.length) {
            setSelectedRegistrations([]);
        }
        else {
            setSelectedRegistrations(activityRegistrations.map(reg => reg.id));
        }
    };
    const handleSelectRegistration = (registrationId) => {
        setSelectedRegistrations(prev => prev.includes(registrationId)
            ? prev.filter(id => id !== registrationId)
            : [...prev, registrationId]);
    };
    const handleBulkStatusUpdate = async () => {
        if (selectedRegistrations.length === 0) {
            enqueueSnackbar('請選擇要更新的報名記錄', { variant: 'warning' });
            return;
        }
        try {
            setLoading(true);
            // 批量更新選中的報名記錄
            for (const registrationId of selectedRegistrations) {
                await memberServiceAPI_1.MemberServiceAPI.updateRegistration(registrationId, {
                    status: bulkStatusUpdate
                });
            }
            enqueueSnackbar(`已更新 ${selectedRegistrations.length} 筆報名記錄`, { variant: 'success' });
            // 重新載入資料
            if (selectedActivityForManagement) {
                await loadActivityRegistrations(selectedActivityForManagement.id);
                await calculateStatistics(selectedActivityForManagement.id);
            }
            setSelectedRegistrations([]);
        }
        catch (error) {
            console.error('批量更新失敗', error);
            enqueueSnackbar('批量更新失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const handleExportRegistrations = () => {
        if (!selectedActivityForManagement)
            return;
        const csvData = [
            ['報名者姓名', '聯絡電話', '總人數', '男性人數', '女性人數', '報名狀態', '報名日期', '備註'],
            ...activityRegistrations.map(reg => [
                reg.memberName || '未知',
                reg.phoneNumber || '',
                reg.totalParticipants || 0,
                reg.maleCount || 0,
                reg.femaleCount || 0,
                reg.status === 'pending' ? '待確認' :
                    reg.status === 'confirmed' ? '已確認' :
                        reg.status === 'attended' ? '已出席' :
                            reg.status === 'cancelled' ? '已取消' :
                                reg.status === 'absent' ? '未出席' : '未知',
                formatDate(reg.registrationDate),
                reg.notes || ''
            ])
        ];
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedActivityForManagement.title}_報名名單_${(0, date_fns_1.format)(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        enqueueSnackbar('報名名單匯出成功', { variant: 'success' });
    };
    const getRegistrationStatusText = (status) => {
        const statusMap = {
            [services_1.RegistrationStatus.PENDING]: '待確認',
            [services_1.RegistrationStatus.CONFIRMED]: '已確認',
            [services_1.RegistrationStatus.CANCELLED]: '已取消',
            [services_1.RegistrationStatus.ATTENDED]: '已出席',
            [services_1.RegistrationStatus.ABSENT]: '未出席'
        };
        return statusMap[status] || '未知';
    };
    const getRegistrationStatusChip = (status) => {
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
        return (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getRegistrationStatusText(status), color: color, size: "small" });
    };
    // 載入我的報名記錄
    (0, react_1.useEffect)(() => {
        if (!isAdmin) {
            loadMyRegistrations();
        }
    }, [user]);
    return ((0, jsx_runtime_1.jsxs)(x_date_pickers_1.LocalizationProvider, { dateAdapter: AdapterDateFns_1.AdapterDateFns, adapterLocale: zh_TW_1.default, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", component: "h2", gutterBottom: true, children: isAdmin ? '年度活動管理' : '年度活動' }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mb: 2 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "year-filter-label", children: "\u6D3B\u52D5\u5E74\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "year-filter-label", value: yearFilter.toString(), onChange: handleYearFilterChange, label: "\u6D3B\u52D5\u5E74\u4EFD", children: getYearOptions().map((year) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: year.toString(), children: [year, " \u5E74"] }, year))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "status-filter-label", children: "\u6D3B\u52D5\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "status-filter-label", value: statusFilter, onChange: handleStatusFilterChange, label: "\u6D3B\u52D5\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.PLANNING, children: "\u8A08\u5283\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.REGISTRATION, children: "\u5831\u540D\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.ONGOING, children: "\u9032\u884C\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.COMPLETED, children: "\u5DF2\u5B8C\u6210" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.CANCELLED, children: "\u5DF2\u53D6\u6D88" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, container: true, justifyContent: "flex-end", spacing: 1, children: isAdmin ? ((0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => handleOpenDialog(), children: "\u65B0\u589E\u6D3B\u52D5" })) : ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Assessment, {}), onClick: () => setShowMyRegistrations(!showMyRegistrations), children: showMyRegistrations ? '隱藏我的報名' : '我的報名' }) })) })] }) }), !isAdmin && showMyRegistrations && ((0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u6211\u7684\u5831\u540D\u8A18\u9304" }), myRegistrations.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.Typography, { color: "text.secondary", children: "\u60A8\u9084\u6C92\u6709\u5831\u540D\u4EFB\u4F55\u6D3B\u52D5" })) : ((0, jsx_runtime_1.jsx)(material_1.Grid, { container: true, spacing: 2, children: myRegistrations.map((registration) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.Card, { variant: "outlined", children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", fontWeight: "bold", children: registration.activityTitle }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u6D3B\u52D5\u65E5\u671F\uFF1A", formatDate(registration.activityDate)] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u6D3B\u52D5\u5730\u9EDE\uFF1A", registration.activityLocation] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u7E3D\u4EBA\u6578\uFF1A", registration.totalParticipants, " \u4EBA (\u7537\uFF1A", registration.maleCount, " \u4EBA\uFF0C\u5973\uFF1A", registration.femaleCount, " \u4EBA)"] }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u806F\u7D61\u96FB\u8A71\uFF1A", registration.phoneNumber] }), registration.notes && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body2", color: "text.secondary", children: ["\u5099\u8A3B\uFF1A", registration.notes] })), (0, jsx_runtime_1.jsx)(material_1.Chip, { label: registration.status === 'confirmed' ? '已確認' : '待確認', color: registration.status === 'confirmed' ? 'success' : 'warning', size: "small", sx: { mt: 1 } })] }) }) }, registration.id))) }))] }) })), loading ? ((0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {})) : ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { width: "5%" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6D3B\u52D5\u6A19\u984C" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6D3B\u52D5\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5730\u9EDE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u4EBA\u6578\u4E0A\u9650" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: activities.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 7, align: "center", children: "\u66AB\u7121\u6D3B\u52D5\u8A18\u9304" }) })) : (activities.map((activity) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => toggleExpand(activity.id), children: expandedIds.includes(activity.id) ? ((0, jsx_runtime_1.jsx)(icons_material_1.KeyboardArrowUp, {})) : ((0, jsx_runtime_1.jsx)(icons_material_1.KeyboardArrowDown, {})) }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: activity.title }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [formatDate(activity.startDate), " ~ ", formatDate(activity.endDate)] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: activity.location }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [activity.capacity, " \u4EBA"] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getStatusChip(activity.status) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: isAdmin ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "primary", onClick: () => handleOpenDialog(activity), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, { fontSize: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "info", onClick: () => handleOpenManagementDialog(activity), title: "\u7BA1\u7406\u5831\u540D", children: (0, jsx_runtime_1.jsx)(icons_material_1.People, { fontSize: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "secondary", onClick: () => handleToggleActivityVisibility(activity), title: activity.isVisible ? '隱藏活動' : '顯示活動', children: activity.isVisible ? ((0, jsx_runtime_1.jsx)(icons_material_1.Visibility, { fontSize: "small" })) : ((0, jsx_runtime_1.jsx)(icons_material_1.VisibilityOff, { fontSize: "small" })) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleDeleteConfirm(activity.id), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, { fontSize: "small" }) })] })) : (activity.status === services_1.ActivityStatus.REGISTRATION && activity.isVisible && (
                                                        // 檢查是否已經報名過這個活動
                                                        myRegistrations.some(reg => reg.activityId === activity.id) ? ((0, jsx_runtime_1.jsx)(material_1.Chip, { label: "\u5DF2\u5831\u540D", color: "success", size: "small" })) : ((0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", size: "small", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.PersonAdd, {}), onClick: () => handleOpenRegistrationDialog(activity), children: "\u5831\u540D\u6D3B\u52D5" })))) })] }), (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { style: { paddingBottom: 0, paddingTop: 0 }, colSpan: 7, children: (0, jsx_runtime_1.jsx)(material_1.Collapse, { in: expandedIds.includes(activity.id), timeout: "auto", unmountOnExit: true, children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { margin: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, component: "div", children: "\u5831\u540D\u72C0\u6CC1" }), (0, jsx_runtime_1.jsx)(ActivityRegistrationsTable_1.default, { activityId: activity.id, members: members, onReload: loadActivities })] }) }) }) })] }, activity.id)))) })] }) }))] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: handleCloseDialog, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: editMode ? '編輯活動' : '新增活動' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "year-label", children: "\u6D3B\u52D5\u5E74\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "year-label", value: ((_a = activityForm.year) === null || _a === void 0 ? void 0 : _a.toString()) || new Date().getFullYear().toString(), onChange: handleYearChange, label: "\u6D3B\u52D5\u5E74\u4EFD", children: getYearOptions().map((year) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: year.toString(), children: [year, " \u5E74"] }, year))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "status-label", children: "\u6D3B\u52D5\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "status-label", value: activityForm.status || services_1.ActivityStatus.PLANNING, onChange: handleStatusChange, label: "\u6D3B\u52D5\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.PLANNING, children: "\u8A08\u5283\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.REGISTRATION, children: "\u5831\u540D\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.ONGOING, children: "\u9032\u884C\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.COMPLETED, children: "\u5DF2\u5B8C\u6210" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.CANCELLED, children: "\u5DF2\u53D6\u6D88" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6D3B\u52D5\u6A19\u984C", name: "title", value: activityForm.title || '', onChange: handleInputChange, error: !!formErrors.title, helperText: formErrors.title }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6D3B\u52D5\u63CF\u8FF0", name: "description", value: activityForm.description || '', onChange: handleInputChange, multiline: true, rows: 3, error: !!formErrors.description, helperText: formErrors.description }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(x_date_pickers_1.DatePicker, { label: "\u958B\u59CB\u65E5\u671F", value: activityForm.startDate ? new Date(activityForm.startDate) : null, onChange: handleStartDateChange, slotProps: {
                                            textField: {
                                                fullWidth: true,
                                                error: !!formErrors.startDate,
                                                helperText: formErrors.startDate
                                            }
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(x_date_pickers_1.DatePicker, { label: "\u7D50\u675F\u65E5\u671F", value: activityForm.endDate ? new Date(activityForm.endDate) : null, onChange: handleEndDateChange, slotProps: {
                                            textField: {
                                                fullWidth: true,
                                                error: !!formErrors.endDate,
                                                helperText: formErrors.endDate
                                            }
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6D3B\u52D5\u5730\u9EDE", name: "location", value: activityForm.location || '', onChange: handleInputChange, error: !!formErrors.location, helperText: formErrors.location }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u4EBA\u6578\u4E0A\u9650", name: "capacity", type: "number", value: activityForm.capacity || '', onChange: handleCapacityChange, error: !!formErrors.capacity, helperText: formErrors.capacity, InputProps: { inputProps: { min: 1 } } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(x_date_pickers_1.DatePicker, { label: "\u5831\u540D\u622A\u6B62\u65E5\u671F", value: activityForm.registrationDeadline ? new Date(activityForm.registrationDeadline) : null, onChange: handleDeadlineChange, slotProps: {
                                            textField: {
                                                fullWidth: true,
                                                error: !!formErrors.registrationDeadline,
                                                helperText: formErrors.registrationDeadline
                                            }
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5C01\u9762\u5716\u7247\u9023\u7D50\uFF08\u9078\u586B\uFF09", name: "coverImage", value: activityForm.coverImage || '', onChange: handleInputChange, placeholder: "https://example.com/image.jpg" }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", disabled: loading, children: loading ? '處理中...' : '儲存' })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: confirmOpen, onClose: () => setConfirmOpen(false), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u9019\u500B\u6D3B\u52D5\u55CE\uFF1F\u76F8\u95DC\u7684\u5831\u540D\u8A18\u9304\u4E5F\u6703\u4E00\u4F75\u522A\u9664\u3002" }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setConfirmOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDelete, color: "error", variant: "contained", children: "\u78BA\u5B9A\u522A\u9664" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: registrationDialogOpen, onClose: handleCloseRegistrationDialog, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u6D3B\u52D5\u5831\u540D" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5831\u540D\u59D3\u540D", name: "memberName", value: registrationForm.memberName, onChange: handleRegistrationInputChange, error: !!registrationErrors.memberName, helperText: registrationErrors.memberName, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u806F\u7D61\u96FB\u8A71", name: "phoneNumber", value: registrationForm.phoneNumber, onChange: handleRegistrationInputChange, error: !!registrationErrors.phoneNumber, helperText: registrationErrors.phoneNumber, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7E3D\u4EBA\u6578", name: "totalParticipants", type: "number", value: registrationForm.totalParticipants, onChange: handleRegistrationNumberChange, error: !!registrationErrors.totalParticipants, helperText: registrationErrors.totalParticipants, InputProps: { inputProps: { min: 1 } }, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u7537\u6027\u4EBA\u6578", name: "maleCount", type: "number", value: registrationForm.maleCount, onChange: handleRegistrationNumberChange, error: !!registrationErrors.maleCount, helperText: registrationErrors.maleCount, InputProps: { inputProps: { min: 0 } }, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5973\u6027\u4EBA\u6578", name: "femaleCount", type: "number", value: registrationForm.femaleCount, onChange: handleRegistrationNumberChange, error: !!registrationErrors.femaleCount, helperText: registrationErrors.femaleCount, InputProps: { inputProps: { min: 0 } }, required: true }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5099\u8A3B", name: "notes", value: registrationForm.notes || '', onChange: handleRegistrationInputChange, multiline: true, rows: 3, placeholder: "\u7279\u6B8A\u9700\u6C42\u3001\u98F2\u98DF\u9650\u5236\u7B49" }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseRegistrationDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleRegistrationSubmit, variant: "contained", disabled: loading, children: loading ? '處理中...' : '確認報名' })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: managementDialogOpen, onClose: handleCloseManagementDialog, maxWidth: "lg", fullWidth: true, children: [(0, jsx_runtime_1.jsxs)(material_1.DialogTitle, { children: [selectedActivityForManagement === null || selectedActivityForManagement === void 0 ? void 0 : selectedActivityForManagement.title, " - \u5831\u540D\u7BA1\u7406"] }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: selectedActivityForManagement && ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsx)(material_1.Card, { sx: { mb: 3 }, children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, children: "\u7D71\u8A08\u8CC7\u8A0A" }), statistics && ((0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, children: [(0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u7E3D\u5831\u540D\u6578" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", color: "primary", children: statistics.totalRegistrations })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u7E3D\u4EBA\u6578" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", color: "secondary", children: statistics.totalParticipants })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u7537\u6027" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", color: "info.main", children: statistics.maleCount })] }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { item: true, xs: 12, sm: 3, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", color: "text.secondary", children: "\u5973\u6027" }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", color: "error.main", children: statistics.femaleCount })] })] })), statistics && ((0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle1", gutterBottom: true, children: "\u72C0\u614B\u5206\u5E03" }), (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 1, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: `待確認: ${statistics.statusBreakdown.pending}`, color: "info", size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: `已確認: ${statistics.statusBreakdown.confirmed}`, color: "success", size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: `已出席: ${statistics.statusBreakdown.attended}`, color: "primary", size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: `已取消: ${statistics.statusBreakdown.cancelled}`, color: "error", size: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, children: (0, jsx_runtime_1.jsx)(material_1.Chip, { label: `未出席: ${statistics.statusBreakdown.absent}`, color: "warning", size: "small" }) })] })] }))] }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Download, {}), onClick: handleExportRegistrations, children: "\u532F\u51FA\u5831\u540D\u540D\u55AE" }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsxs)(material_1.FormControl, { size: "small", sx: { minWidth: 120 }, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { children: "\u6279\u91CF\u66F4\u65B0\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { value: bulkStatusUpdate, onChange: (e) => setBulkStatusUpdate(e.target.value), label: "\u6279\u91CF\u66F4\u65B0\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.RegistrationStatus.PENDING, children: "\u5F85\u78BA\u8A8D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.RegistrationStatus.CONFIRMED, children: "\u5DF2\u78BA\u8A8D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.RegistrationStatus.ATTENDED, children: "\u5DF2\u51FA\u5E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.RegistrationStatus.CANCELLED, children: "\u5DF2\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.RegistrationStatus.ABSENT, children: "\u672A\u51FA\u5E2D" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Button, { variant: "contained", onClick: handleBulkStatusUpdate, disabled: selectedRegistrations.length === 0, children: ["\u66F4\u65B0\u9078\u4E2D\u9805\u76EE (", selectedRegistrations.length, ")"] })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { padding: "checkbox", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: handleSelectAllRegistrations, children: selectedRegistrations.length === activityRegistrations.length ? ((0, jsx_runtime_1.jsx)(icons_material_1.CheckBox, {})) : ((0, jsx_runtime_1.jsx)(icons_material_1.CheckBoxOutlineBlank, {})) }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5831\u540D\u8005" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u806F\u7D61\u96FB\u8A71" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7E3D\u4EBA\u6578" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u7537\u6027" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5973\u6027" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5831\u540D\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5099\u8A3B" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: activityRegistrations.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 9, align: "center", children: "\u66AB\u7121\u5831\u540D\u8A18\u9304" }) })) : (activityRegistrations.map((registration) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { padding: "checkbox", children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => handleSelectRegistration(registration.id), children: selectedRegistrations.includes(registration.id) ? ((0, jsx_runtime_1.jsx)(icons_material_1.CheckBox, {})) : ((0, jsx_runtime_1.jsx)(icons_material_1.CheckBoxOutlineBlank, {})) }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: registration.memberName }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: registration.phoneNumber }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: registration.totalParticipants }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: registration.maleCount }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: registration.femaleCount }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: formatDate(registration.registrationDate) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getRegistrationStatusChip(registration.status) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: registration.notes })] }, registration.id)))) })] }) })] })) }), (0, jsx_runtime_1.jsx)(material_1.DialogActions, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseManagementDialog, children: "\u95DC\u9589" }) })] })] }));
};
exports.default = AnnualActivitiesTab;
