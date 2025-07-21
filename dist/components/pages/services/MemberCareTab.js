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
const AdapterDateFns_1 = require("@mui/x-date-pickers/AdapterDateFns");
const x_date_pickers_1 = require("@mui/x-date-pickers");
const zh_TW_1 = __importDefault(require("date-fns/locale/zh-TW"));
const date_fns_1 = require("date-fns");
const services_1 = require("../../../types/services");
const memberServiceAPI_1 = require("../../../services/memberServiceAPI");
const api_service_1 = require("../../../services/api.service");
const LoadingSpinner_1 = __importDefault(require("../../common/LoadingSpinner"));
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return ((0, jsx_runtime_1.jsx)("div", { role: "tabpanel", hidden: value !== index, id: `care-tabpanel-${index}`, "aria-labelledby": `care-tab-${index}`, ...other, children: value === index && ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: { p: 3 }, children: children })) }));
}
const MemberCareTab = () => {
    const [cares, setCares] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
    const [careForm, setCareForm] = (0, react_1.useState)({
        memberId: '',
        type: services_1.CareType.BIRTHDAY,
        title: '',
        description: '',
        date: (0, date_fns_1.formatISO)(new Date()),
        status: services_1.CareStatus.PLANNED,
        notes: ''
    });
    const [formErrors, setFormErrors] = (0, react_1.useState)({});
    const [confirmOpen, setConfirmOpen] = (0, react_1.useState)(false);
    const [deleteCareId, setDeleteCareId] = (0, react_1.useState)(null);
    const [selectedCare, setSelectedCare] = (0, react_1.useState)(null);
    const [editMode, setEditMode] = (0, react_1.useState)(false);
    const [typeFilter, setTypeFilter] = (0, react_1.useState)('');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('');
    const [members, setMembers] = (0, react_1.useState)([]);
    const [currentTab, setCurrentTab] = (0, react_1.useState)(0);
    const [currentDate, setCurrentDate] = (0, react_1.useState)(new Date());
    const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
    (0, react_1.useEffect)(() => {
        loadCares();
        loadMembers();
    }, [typeFilter, statusFilter]);
    const loadCares = async () => {
        try {
            setLoading(true);
            const data = await memberServiceAPI_1.MemberServiceAPI.getMemberCares(undefined, typeFilter || undefined, statusFilter || undefined);
            setCares(data);
        }
        catch (error) {
            console.error('載入會員關懷記錄失敗', error);
            enqueueSnackbar('載入會員關懷記錄失敗', { variant: 'error' });
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
    const handleOpenDialog = (care) => {
        if (care) {
            setCareForm({
                ...care
            });
            setEditMode(true);
            setSelectedCare(care);
        }
        else {
            setCareForm({
                memberId: '',
                type: services_1.CareType.BIRTHDAY,
                title: '',
                description: '',
                date: (0, date_fns_1.formatISO)(new Date()),
                status: services_1.CareStatus.PLANNED,
                notes: ''
            });
            setEditMode(false);
            setSelectedCare(null);
        }
        setFormErrors({});
        setDialogOpen(true);
    };
    const handleCloseDialog = () => {
        setDialogOpen(false);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCareForm({
            ...careForm,
            [name]: value
        });
    };
    const handleTypeChange = (e) => {
        setCareForm({
            ...careForm,
            type: e.target.value
        });
    };
    const handleStatusChange = (e) => {
        setCareForm({
            ...careForm,
            status: e.target.value
        });
    };
    const handleMemberChange = (e) => {
        setCareForm({
            ...careForm,
            memberId: e.target.value
        });
    };
    const handleDateChange = (date) => {
        if (date) {
            setCareForm({
                ...careForm,
                date: (0, date_fns_1.formatISO)(date)
            });
        }
    };
    const handleFollowUpDateChange = (date) => {
        if (date) {
            setCareForm({
                ...careForm,
                followUpDate: (0, date_fns_1.formatISO)(date)
            });
        }
        else {
            // 如果日期為 null，則清除追蹤日期
            const updatedForm = { ...careForm };
            delete updatedForm.followUpDate;
            setCareForm(updatedForm);
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!careForm.memberId)
            errors.memberId = '請選擇會員';
        if (!careForm.title)
            errors.title = '請輸入標題';
        if (!careForm.description)
            errors.description = '請輸入描述';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async () => {
        if (!validateForm())
            return;
        try {
            setLoading(true);
            if (editMode && selectedCare) {
                await memberServiceAPI_1.MemberServiceAPI.updateMemberCare(selectedCare.id, careForm);
                enqueueSnackbar('會員關懷更新成功', { variant: 'success' });
            }
            else {
                await memberServiceAPI_1.MemberServiceAPI.createMemberCare(careForm);
                enqueueSnackbar('會員關懷建立成功', { variant: 'success' });
            }
            await loadCares();
            handleCloseDialog();
        }
        catch (error) {
            console.error('儲存會員關懷失敗', error);
            enqueueSnackbar('儲存會員關懷失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
        }
    };
    const handleDeleteConfirm = (id) => {
        setDeleteCareId(id);
        setConfirmOpen(true);
    };
    const handleDelete = async () => {
        if (!deleteCareId)
            return;
        try {
            setLoading(true);
            await memberServiceAPI_1.MemberServiceAPI.deleteMemberCare(deleteCareId);
            enqueueSnackbar('會員關懷刪除成功', { variant: 'success' });
            await loadCares();
        }
        catch (error) {
            console.error('刪除會員關懷失敗', error);
            enqueueSnackbar('刪除會員關懷失敗', { variant: 'error' });
        }
        finally {
            setLoading(false);
            setConfirmOpen(false);
            setDeleteCareId(null);
        }
    };
    const handleTypeFilterChange = (e) => {
        setTypeFilter(e.target.value);
    };
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };
    const getStatusChip = (status) => {
        let color = 'default';
        switch (status) {
            case services_1.CareStatus.PLANNED:
                color = 'info';
                break;
            case services_1.CareStatus.PROCESSING:
                color = 'warning';
                break;
            case services_1.CareStatus.COMPLETED:
                color = 'success';
                break;
            case services_1.CareStatus.CANCELLED:
                color = 'error';
                break;
        }
        return (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getStatusText(status), color: color, size: "small" });
    };
    const getTypeChip = (type) => {
        let color = 'default';
        switch (type) {
            case services_1.CareType.BIRTHDAY:
                color = 'primary';
                break;
            case services_1.CareType.HOLIDAY:
                color = 'success';
                break;
            case services_1.CareType.ANNIVERSARY:
                color = 'secondary';
                break;
            case services_1.CareType.CONDOLENCE:
                color = 'error';
                break;
            case services_1.CareType.CONGRATULATION:
                color = 'success';
                break;
            case services_1.CareType.FOLLOW_UP:
                color = 'warning';
                break;
            case services_1.CareType.OTHER:
                color = 'default';
                break;
        }
        return (0, jsx_runtime_1.jsx)(material_1.Chip, { label: getTypeText(type), color: color, size: "small" });
    };
    const getStatusText = (status) => {
        const statusMap = {
            [services_1.CareStatus.PLANNED]: '計劃中',
            [services_1.CareStatus.PROCESSING]: '處理中',
            [services_1.CareStatus.COMPLETED]: '已完成',
            [services_1.CareStatus.CANCELLED]: '已取消'
        };
        return statusMap[status] || '未知';
    };
    const getTypeText = (type) => {
        const typeMap = {
            [services_1.CareType.BIRTHDAY]: '生日祝福',
            [services_1.CareType.HOLIDAY]: '節日祝福',
            [services_1.CareType.ANNIVERSARY]: '紀念日',
            [services_1.CareType.CONDOLENCE]: '慰問關懷',
            [services_1.CareType.CONGRATULATION]: '恭賀祝福',
            [services_1.CareType.FOLLOW_UP]: '追蹤關懷',
            [services_1.CareType.OTHER]: '其他'
        };
        return typeMap[type] || '未知';
    };
    const getMemberName = (memberId) => {
        const member = members.find(m => m.id === memberId);
        return member ? member.name : '未找到會員';
    };
    const formatDate = (dateString) => {
        try {
            return (0, date_fns_1.format)(new Date(dateString), 'yyyy/MM/dd');
        }
        catch (error) {
            return dateString;
        }
    };
    // 日曆視圖相關函數
    const getDaysInMonth = (date) => {
        const start = (0, date_fns_1.startOfWeek)((0, date_fns_1.startOfMonth)(date), { weekStartsOn: 1 }); // 週一開始
        const end = (0, date_fns_1.endOfWeek)((0, date_fns_1.endOfMonth)(date), { weekStartsOn: 1 });
        return (0, date_fns_1.eachDayOfInterval)({ start, end });
    };
    const getCaresForDate = (date) => {
        return cares.filter(care => {
            const careDate = new Date(care.date);
            return (0, date_fns_1.isSameDay)(careDate, date);
        });
    };
    const handleDateClick = (date) => {
        const caresForDate = getCaresForDate(date);
        if (caresForDate.length > 0) {
            // 如果該日期有關懷記錄，顯示第一個記錄的詳情
            handleOpenDialog(caresForDate[0]);
        }
        else {
            // 如果該日期沒有關懷記錄，開啟新增對話框並設定日期
            setCareForm({
                memberId: '',
                type: services_1.CareType.BIRTHDAY,
                title: '',
                description: '',
                date: (0, date_fns_1.formatISO)(date),
                status: services_1.CareStatus.PLANNED,
                notes: ''
            });
            setEditMode(false);
            setSelectedCare(null);
            setFormErrors({});
            setDialogOpen(true);
        }
    };
    const handlePrevMonth = () => {
        setCurrentDate((0, date_fns_1.subMonths)(currentDate, 1));
    };
    const handleNextMonth = () => {
        setCurrentDate((0, date_fns_1.addMonths)(currentDate, 1));
    };
    const handleToday = () => {
        setCurrentDate(new Date());
    };
    const getTypeColor = (type) => {
        switch (type) {
            case services_1.CareType.BIRTHDAY:
                return '#1976d2'; // primary blue
            case services_1.CareType.HOLIDAY:
                return '#2e7d32'; // success green
            case services_1.CareType.ANNIVERSARY:
                return '#ed6c02'; // warning orange
            case services_1.CareType.CONDOLENCE:
                return '#d32f2f'; // error red
            case services_1.CareType.CONGRATULATION:
                return '#7b1fa2'; // secondary purple
            case services_1.CareType.FOLLOW_UP:
                return '#f57c00'; // orange
            case services_1.CareType.OTHER:
                return '#757575'; // grey
            default:
                return '#757575';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case services_1.CareStatus.PLANNED:
                return '#1976d2'; // blue
            case services_1.CareStatus.PROCESSING:
                return '#ed6c02'; // orange
            case services_1.CareStatus.COMPLETED:
                return '#2e7d32'; // green
            case services_1.CareStatus.CANCELLED:
                return '#d32f2f'; // red
            default:
                return '#757575';
        }
    };
    return ((0, jsx_runtime_1.jsxs)(x_date_pickers_1.LocalizationProvider, { dateAdapter: AdapterDateFns_1.AdapterDateFns, adapterLocale: zh_TW_1.default, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", component: "h2", gutterBottom: true, children: "\u6703\u54E1\u95DC\u61F7\u7BA1\u7406" }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { mb: 2 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "type-filter-label", children: "\u95DC\u61F7\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "type-filter-label", value: typeFilter, onChange: handleTypeFilterChange, label: "\u95DC\u61F7\u985E\u578B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.BIRTHDAY, children: "\u751F\u65E5\u795D\u798F" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.HOLIDAY, children: "\u7BC0\u65E5\u795D\u798F" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.ANNIVERSARY, children: "\u7D00\u5FF5\u65E5" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.CONDOLENCE, children: "\u6170\u554F\u95DC\u61F7" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.CONGRATULATION, children: "\u606D\u8CC0\u795D\u798F" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.FOLLOW_UP, children: "\u8FFD\u8E64\u95DC\u61F7" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.OTHER, children: "\u5176\u4ED6" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 3, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, size: "small", children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "status-filter-label", children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "status-filter-label", value: statusFilter, onChange: handleStatusFilterChange, label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: "", children: "\u5168\u90E8" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareStatus.PLANNED, children: "\u8A08\u5283\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareStatus.PROCESSING, children: "\u8655\u7406\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareStatus.COMPLETED, children: "\u5DF2\u5B8C\u6210" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareStatus.CANCELLED, children: "\u5DF2\u53D6\u6D88" })] })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, container: true, justifyContent: "flex-end", children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(icons_material_1.Add, {}), onClick: () => handleOpenDialog(), children: "\u65B0\u589E\u95DC\u61F7\u8A18\u9304" }) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Box, { sx: { borderBottom: 1, borderColor: 'divider' }, children: (0, jsx_runtime_1.jsxs)(material_1.Tabs, { value: currentTab, onChange: handleTabChange, children: [(0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u95DC\u61F7\u5217\u8868" }), (0, jsx_runtime_1.jsx)(material_1.Tab, { label: "\u65E5\u66C6\u8996\u5716" })] }) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 0, children: loading ? ((0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {})) : ((0, jsx_runtime_1.jsx)(material_1.TableContainer, { component: material_1.Paper, children: (0, jsx_runtime_1.jsxs)(material_1.Table, { children: [(0, jsx_runtime_1.jsx)(material_1.TableHead, { children: (0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6A19\u984C" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u6703\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u985E\u578B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u8FFD\u8E64\u65E5\u671F" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { align: "right", children: "\u64CD\u4F5C" })] }) }), (0, jsx_runtime_1.jsx)(material_1.TableBody, { children: cares.length === 0 ? ((0, jsx_runtime_1.jsx)(material_1.TableRow, { children: (0, jsx_runtime_1.jsx)(material_1.TableCell, { colSpan: 7, align: "center", children: "\u66AB\u7121\u95DC\u61F7\u8A18\u9304" }) })) : (cares.map((care) => ((0, jsx_runtime_1.jsxs)(material_1.TableRow, { children: [(0, jsx_runtime_1.jsx)(material_1.TableCell, { children: care.title }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getMemberName(care.memberId) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getTypeChip(care.type) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: formatDate(care.date) }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: care.followUpDate ? formatDate(care.followUpDate) : '無' }), (0, jsx_runtime_1.jsx)(material_1.TableCell, { children: getStatusChip(care.status) }), (0, jsx_runtime_1.jsxs)(material_1.TableCell, { align: "right", children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "primary", onClick: () => handleOpenDialog(care), children: (0, jsx_runtime_1.jsx)(icons_material_1.Edit, { fontSize: "small" }) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { size: "small", color: "error", onClick: () => handleDeleteConfirm(care.id), children: (0, jsx_runtime_1.jsx)(icons_material_1.Delete, { fontSize: "small" }) })] })] }, care.id)))) })] }) })) }), (0, jsx_runtime_1.jsx)(TabPanel, { value: currentTab, index: 1, children: loading ? ((0, jsx_runtime_1.jsx)(LoadingSpinner_1.default, {})) : ((0, jsx_runtime_1.jsxs)(material_1.Box, { children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: (0, date_fns_1.format)(currentDate, 'yyyy年MM月', { locale: zh_TW_1.default }) }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", spacing: 1, children: [(0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: handlePrevMonth, children: (0, jsx_runtime_1.jsx)(icons_material_1.ChevronLeft, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: handleToday, children: (0, jsx_runtime_1.jsx)(icons_material_1.Today, {}) }), (0, jsx_runtime_1.jsx)(material_1.IconButton, { onClick: handleNextMonth, children: (0, jsx_runtime_1.jsx)(icons_material_1.ChevronRight, {}) })] })] }), (0, jsx_runtime_1.jsx)(material_1.Paper, { sx: { p: 2 }, children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, children: [['一', '二', '三', '四', '五', '六', '日'].map((day) => ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12 / 7, sx: { p: 1, textAlign: 'center' }, children: (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", color: "text.secondary", children: day }) }, day))), getDaysInMonth(currentDate).map((date, index) => {
                                                const caresForDate = getCaresForDate(date);
                                                const isCurrentMonth = (0, date_fns_1.isSameMonth)(date, currentDate);
                                                const isCurrentDay = (0, date_fns_1.isToday)(date);
                                                return ((0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12 / 7, sx: { p: 0.5 }, children: (0, jsx_runtime_1.jsx)(material_1.Card, { sx: {
                                                            minHeight: 80,
                                                            cursor: 'pointer',
                                                            backgroundColor: isCurrentDay ? '#e3f2fd' : 'transparent',
                                                            border: isCurrentDay ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                                            '&:hover': {
                                                                backgroundColor: '#f5f5f5',
                                                                borderColor: '#1976d2'
                                                            }
                                                        }, onClick: () => handleDateClick(date), children: (0, jsx_runtime_1.jsxs)(material_1.CardContent, { sx: { p: 1, '&:last-child': { pb: 1 } }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", sx: {
                                                                        color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                                                                        fontWeight: isCurrentDay ? 'bold' : 'normal',
                                                                        mb: 1
                                                                    }, children: (0, date_fns_1.format)(date, 'd') }), caresForDate.map((care, careIndex) => ((0, jsx_runtime_1.jsx)(material_1.Tooltip, { title: `${care.title} - ${getMemberName(care.memberId)}`, placement: "top", children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                                                                            height: 4,
                                                                            backgroundColor: getTypeColor(care.type),
                                                                            borderRadius: 1,
                                                                            mb: 0.5,
                                                                            position: 'relative'
                                                                        }, children: (0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
                                                                                position: 'absolute',
                                                                                top: -2,
                                                                                right: -2,
                                                                                width: 6,
                                                                                height: 6,
                                                                                borderRadius: '50%',
                                                                                backgroundColor: getStatusColor(care.status),
                                                                                border: '1px solid white'
                                                                            } }) }) }, care.id))), caresForDate.length > 3 && ((0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "caption", color: "text.secondary", children: ["+", caresForDate.length - 3, " \u66F4\u591A"] }))] }) }) }, index));
                                            })] }) }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mt: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "subtitle2", gutterBottom: true, children: "\u5716\u4F8B\uFF1A" }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", spacing: 2, flexWrap: "wrap", children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { width: 16, height: 4, backgroundColor: '#1976d2', borderRadius: 1 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: "\u751F\u65E5\u795D\u798F" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { width: 16, height: 4, backgroundColor: '#2e7d32', borderRadius: 1 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: "\u7BC0\u65E5\u795D\u798F" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { width: 16, height: 4, backgroundColor: '#ed6c02', borderRadius: 1 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: "\u7D00\u5FF5\u65E5" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { width: 16, height: 4, backgroundColor: '#d32f2f', borderRadius: 1 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: "\u6170\u554F\u95DC\u61F7" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { width: 16, height: 4, backgroundColor: '#7b1fa2', borderRadius: 1 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: "\u606D\u8CC0\u795D\u798F" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { width: 16, height: 4, backgroundColor: '#f57c00', borderRadius: 1 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: "\u8FFD\u8E64\u95DC\u61F7" })] }), (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Box, { sx: { width: 16, height: 4, backgroundColor: '#757575', borderRadius: 1 } }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "caption", children: "\u5176\u4ED6" })] })] })] })] })) })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: dialogOpen, onClose: handleCloseDialog, maxWidth: "md", fullWidth: true, children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: editMode ? '編輯關懷記錄' : '新增關懷記錄' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsxs)(material_1.Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [(0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, error: !!formErrors.memberId, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "member-label", children: "\u6703\u54E1" }), (0, jsx_runtime_1.jsx)(material_1.Select, { labelId: "member-label", value: careForm.memberId || '', onChange: handleMemberChange, label: "\u6703\u54E1", children: members.map((member) => ((0, jsx_runtime_1.jsxs)(material_1.MenuItem, { value: member.id, children: [member.name, " (", member.memberNo, ")"] }, member.id))) }), formErrors.memberId && (0, jsx_runtime_1.jsx)(material_1.FormHelperText, { children: formErrors.memberId })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, error: !!formErrors.type, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "type-label", children: "\u95DC\u61F7\u985E\u578B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "type-label", value: careForm.type || services_1.CareType.BIRTHDAY, onChange: handleTypeChange, label: "\u95DC\u61F7\u985E\u578B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.BIRTHDAY, children: "\u751F\u65E5\u795D\u798F" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.HOLIDAY, children: "\u7BC0\u65E5\u795D\u798F" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.ANNIVERSARY, children: "\u7D00\u5FF5\u65E5" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.CONDOLENCE, children: "\u6170\u554F\u95DC\u61F7" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.CONGRATULATION, children: "\u606D\u8CC0\u795D\u798F" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.FOLLOW_UP, children: "\u8FFD\u8E64\u95DC\u61F7" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareType.OTHER, children: "\u5176\u4ED6" })] }), formErrors.type && (0, jsx_runtime_1.jsx)(material_1.FormHelperText, { children: formErrors.type })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u6A19\u984C", name: "title", value: careForm.title || '', onChange: handleInputChange, error: !!formErrors.title, helperText: formErrors.title }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u63CF\u8FF0", name: "description", value: careForm.description || '', onChange: handleInputChange, multiline: true, rows: 3, error: !!formErrors.description, helperText: formErrors.description }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(x_date_pickers_1.DatePicker, { label: "\u95DC\u61F7\u65E5\u671F", value: careForm.date ? new Date(careForm.date) : null, onChange: handleDateChange, slotProps: {
                                            textField: {
                                                fullWidth: true,
                                                error: !!formErrors.date,
                                                helperText: formErrors.date
                                            }
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsxs)(material_1.FormControl, { fullWidth: true, error: !!formErrors.status, children: [(0, jsx_runtime_1.jsx)(material_1.InputLabel, { id: "status-label", children: "\u72C0\u614B" }), (0, jsx_runtime_1.jsxs)(material_1.Select, { labelId: "status-label", value: careForm.status || services_1.CareStatus.PLANNED, onChange: handleStatusChange, label: "\u72C0\u614B", children: [(0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareStatus.PLANNED, children: "\u8A08\u5283\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareStatus.PROCESSING, children: "\u8655\u7406\u4E2D" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareStatus.COMPLETED, children: "\u5DF2\u5B8C\u6210" }), (0, jsx_runtime_1.jsx)(material_1.MenuItem, { value: services_1.CareStatus.CANCELLED, children: "\u5DF2\u53D6\u6D88" })] }), formErrors.status && (0, jsx_runtime_1.jsx)(material_1.FormHelperText, { children: formErrors.status })] }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, sm: 6, children: (0, jsx_runtime_1.jsx)(x_date_pickers_1.DatePicker, { label: "\u8FFD\u8E64\u65E5\u671F", value: careForm.followUpDate ? new Date(careForm.followUpDate) : null, onChange: handleFollowUpDateChange, slotProps: {
                                            textField: {
                                                fullWidth: true,
                                                error: !!formErrors.followUpDate,
                                                helperText: formErrors.followUpDate
                                            }
                                        } }) }), (0, jsx_runtime_1.jsx)(material_1.Grid, { item: true, xs: 12, children: (0, jsx_runtime_1.jsx)(material_1.TextField, { fullWidth: true, label: "\u5099\u8A3B", name: "notes", value: careForm.notes || '', onChange: handleInputChange, multiline: true, rows: 2, error: !!formErrors.notes, helperText: formErrors.notes }) })] }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleCloseDialog, children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleSubmit, variant: "contained", children: editMode ? '更新' : '新增' })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: confirmOpen, onClose: () => setConfirmOpen(false), children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { children: "\u78BA\u8A8D\u522A\u9664" }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.Typography, { children: "\u78BA\u5B9A\u8981\u522A\u9664\u9019\u7B46\u95DC\u61F7\u8A18\u9304\u55CE\uFF1F\u6B64\u64CD\u4F5C\u7121\u6CD5\u5FA9\u539F\u3002" }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: () => setConfirmOpen(false), children: "\u53D6\u6D88" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleDelete, color: "error", variant: "contained", children: "\u522A\u9664" })] })] })] }));
};
exports.default = MemberCareTab;
