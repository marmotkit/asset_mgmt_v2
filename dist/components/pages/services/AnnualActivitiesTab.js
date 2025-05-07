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
const LoadingSpinner_1 = __importDefault(require("../../common/LoadingSpinner"));
const ActivityRegistrationsTable_1 = __importDefault(require("./ActivityRegistrationsTable"));
const AnnualActivitiesTab = () => {
    var _a;
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
        year: new Date().getFullYear()
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
            [services_1.ActivityStatus.CANCELLED]: '已取消'
        };
        return statusMap[status] || '未知';
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
    return ((0, jsx_runtime_1.jsxs)(x_date_pickers_1.LocalizationProvider, { dateAdapter: AdapterDateFns_1.AdapterDateFns, adapterLocale: zh_TW_1.default, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", component: "h2", gutterBottom: true, children: "\u5E74\u5EA6\u6D3B\u52D5\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mb: 2 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "year-filter-label", children: "\u6D3B\u52D5\u5E74\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "year-filter-label", value: yearFilter.toString(), onChange: handleYearFilterChange, label: "\u6D3B\u52D5\u5E74\u4EFD", children: getYearOptions().map((year) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: year.toString(), children: [year, " \u5E74"] }, year))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "status-filter-label", children: "\u6D3B\u52D5\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "status-filter-label", value: statusFilter, onChange: handleStatusFilterChange, label: "\u6D3B\u52D5\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.PLANNING, children: "\u8A08\u5283\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.REGISTRATION, children: "\u5831\u540D\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.ONGOING, children: "\u9032\u884C\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.COMPLETED, children: "\u5DF2\u5B8C\u6210" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.CANCELLED, children: "\u5DF2\u53D6\u6D88" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, container: true, justifyContent: "flex-end", children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => handleOpenDialog(), children: "\u65B0\u589E\u6D3B\u52D5" }) })] }) }), loading ? ((0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {})) : ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { width: "5%" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6D3B\u52D5\u6A19\u984C" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6D3B\u52D5\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u5730\u9EDE" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u4EBA\u6578\u4E0A\u9650" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: activities.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 7, align: "center", children: "\u66AB\u7121\u6D3B\u52D5\u8A18\u9304" }) })) : (activities.map((activity) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [(0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", onClick: () => toggleExpand(activity.id), children: expandedIds.includes(activity.id) ? ((0, jsx_runtime_1.jsx)(icons_material_1.KeyboardArrowUp, {})) : ((0, jsx_runtime_1.jsx)(icons_material_1.KeyboardArrowDown, {})) }) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: activity.title }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [formatDate(activity.startDate), " ~ ", formatDate(activity.endDate)] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: activity.location }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { children: [activity.capacity, " \u4EBA"] }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getStatusChip(activity.status) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "primary", onClick: () => handleOpenDialog(activity), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, { fontSize: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleDeleteConfirm(activity.id), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, { fontSize: "small" }) })] })] }), (0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { style: { paddingBottom: 0, paddingTop: 0 }, colSpan: 7, children: (0, jsx_runtime_1.jsx)(material_1.Collapse, { in: expandedIds.includes(activity.id), timeout: "auto", unmountOnExit: true, children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { margin: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", gutterBottom: true, component: "div", children: "\u5831\u540D\u72C0\u6CC1" }), (0, jsx_runtime_1.jsx)(ActivityRegistrationsTable_1.default, { activityId: activity.id, members: members, onReload: loadActivities })] }) }) }) })] }, activity.id)))) })] }) }))] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: handleCloseDialog, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: editMode ? '編輯活動' : '新增活動' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "year-label", children: "\u6D3B\u52D5\u5E74\u4EFD" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "year-label", value: ((_a = activityForm.year) === null || _a === void 0 ? void 0 : _a.toString()) || new Date().getFullYear().toString(), onChange: handleYearChange, label: "\u6D3B\u52D5\u5E74\u4EFD", children: getYearOptions().map((year) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: year.toString(), children: [year, " \u5E74"] }, year))) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "status-label", children: "\u6D3B\u52D5\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "status-label", value: activityForm.status || services_1.ActivityStatus.PLANNING, onChange: handleStatusChange, label: "\u6D3B\u52D5\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.PLANNING, children: "\u8A08\u5283\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.REGISTRATION, children: "\u5831\u540D\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.ONGOING, children: "\u9032\u884C\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.COMPLETED, children: "\u5DF2\u5B8C\u6210" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.ActivityStatus.CANCELLED, children: "\u5DF2\u53D6\u6D88" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6D3B\u52D5\u6A19\u984C", name: "title", value: activityForm.title || '', onChange: handleInputChange, error: !!formErrors.title, helperText: formErrors.title }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6D3B\u52D5\u63CF\u8FF0", name: "description", value: activityForm.description || '', onChange: handleInputChange, multiline: true, rows: 3, error: !!formErrors.description, helperText: formErrors.description }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(x_date_pickers_1.DatePicker, { label: "\u958B\u59CB\u65E5\u671F", value: activityForm.startDate ? new Date(activityForm.startDate) : null, onChange: handleStartDateChange, slotProps: {
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
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5C01\u9762\u5716\u7247\u9023\u7D50\uFF08\u9078\u586B\uFF09", name: "coverImage", value: activityForm.coverImage || '', onChange: handleInputChange, placeholder: "https://example.com/image.jpg" }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", disabled: loading, children: loading ? '處理中...' : '儲存' })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: confirmOpen, onClose: () => setConfirmOpen(false), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u9019\u500B\u6D3B\u52D5\u55CE\uFF1F\u76F8\u95DC\u7684\u5831\u540D\u8A18\u9304\u4E5F\u6703\u4E00\u4F75\u522A\u9664\u3002" }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setConfirmOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDelete, color: "error", variant: "contained", children: "\u78BA\u5B9A\u522A\u9664" })] })] })] }));
};
exports.default = AnnualActivitiesTab;
