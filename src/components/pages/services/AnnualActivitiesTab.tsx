import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Chip,
    Grid,
    Collapse,
    SelectChangeEvent,
    Switch,
    FormControlLabel,
    Alert,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    PersonAdd as PersonAddIcon,
    Assessment as AssessmentIcon,
    Download as DownloadIcon,
    Analytics as AnalyticsIcon,
    People as PeopleIcon,
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import zhTW from 'date-fns/locale/zh-TW';
import { format, formatISO } from 'date-fns';

import { AnnualActivity, ActivityStatus, ActivityRegistrationForm, ActivityRegistrationDetail, RegistrationStatus } from '../../../types/services';
import { MemberServiceAPI } from '../../../services/memberServiceAPI';
import { User } from '../../../types/user';
import { ApiService } from '../../../services/api.service';
import { useAuth } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ActivityRegistrationsTable from './ActivityRegistrationsTable';

const AnnualActivitiesTab: React.FC = () => {
    const { user } = useAuth(); // 新增權限控制
    const isAdmin = user?.role === 'admin'; // 檢查是否為管理者

    const [activities, setActivities] = useState<AnnualActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activityForm, setActivityForm] = useState<Partial<AnnualActivity>>({
        title: '',
        description: '',
        startDate: formatISO(new Date()),
        endDate: formatISO(new Date()),
        location: '',
        capacity: 20,
        registrationDeadline: formatISO(new Date()),
        status: ActivityStatus.PLANNING,
        year: new Date().getFullYear(),
        isVisible: true // 新增顯示狀態
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<AnnualActivity | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
    const [statusFilter, setStatusFilter] = useState<ActivityStatus | ''>('');
    const [members, setMembers] = useState<User[]>([]);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    // 新增報名相關狀態
    const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
    const [registrationForm, setRegistrationForm] = useState<ActivityRegistrationForm>({
        activityId: '',
        memberName: '',
        totalParticipants: 1,
        maleCount: 0,
        femaleCount: 0,
        phoneNumber: '',
        notes: ''
    });
    const [registrationErrors, setRegistrationErrors] = useState<Record<string, string>>({});
    const [myRegistrations, setMyRegistrations] = useState<ActivityRegistrationDetail[]>([]);
    const [showMyRegistrations, setShowMyRegistrations] = useState(false);

    // 管理者專用狀態
    const [managementDialogOpen, setManagementDialogOpen] = useState(false);
    const [selectedActivityForManagement, setSelectedActivityForManagement] = useState<AnnualActivity | null>(null);
    const [activityRegistrations, setActivityRegistrations] = useState<ActivityRegistrationDetail[]>([]);
    const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
    const [bulkStatusUpdate, setBulkStatusUpdate] = useState<RegistrationStatus>(RegistrationStatus.PENDING);
    const [statistics, setStatistics] = useState<any>(null);
    const [showStatistics, setShowStatistics] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        loadActivities();
        loadMembers();
    }, [yearFilter, statusFilter]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const data = await MemberServiceAPI.getActivities(
                yearFilter,
                statusFilter || undefined
            );
            setActivities(data);
        } catch (error) {
            console.error('載入年度活動失敗', error);
            enqueueSnackbar('載入年度活動失敗', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async () => {
        try {
            const data = await ApiService.getUsers();
            setMembers(data);
        } catch (error) {
            console.error('載入會員資料失敗', error);
        }
    };

    const handleOpenDialog = (activity?: AnnualActivity) => {
        if (activity) {
            setActivityForm({
                ...activity
            });
            setEditMode(true);
            setSelectedActivity(activity);
        } else {
            setActivityForm({
                title: '',
                description: '',
                startDate: formatISO(new Date()),
                endDate: formatISO(new Date()),
                location: '',
                capacity: 20,
                registrationDeadline: formatISO(new Date()),
                status: ActivityStatus.PLANNING,
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setActivityForm({
            ...activityForm,
            [name]: value
        });
    };

    const handleStatusChange = (e: SelectChangeEvent<ActivityStatus>) => {
        setActivityForm({
            ...activityForm,
            status: e.target.value as ActivityStatus
        });
    };

    const handleYearChange = (e: SelectChangeEvent<string>) => {
        setActivityForm({
            ...activityForm,
            year: parseInt(e.target.value, 10)
        });
    };

    const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const capacity = parseInt(e.target.value, 10);
        setActivityForm({
            ...activityForm,
            capacity: isNaN(capacity) ? 0 : capacity
        });
    };

    const handleStartDateChange = (date: Date | null) => {
        if (date) {
            setActivityForm({
                ...activityForm,
                startDate: formatISO(date)
            });
        }
    };

    const handleEndDateChange = (date: Date | null) => {
        if (date) {
            setActivityForm({
                ...activityForm,
                endDate: formatISO(date)
            });
        }
    };

    const handleDeadlineChange = (date: Date | null) => {
        if (date) {
            setActivityForm({
                ...activityForm,
                registrationDeadline: formatISO(date)
            });
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!activityForm.title) errors.title = '請輸入活動標題';
        if (!activityForm.description) errors.description = '請輸入活動描述';
        if (!activityForm.location) errors.location = '請輸入活動地點';
        if (!activityForm.capacity) errors.capacity = '請輸入活動人數上限';
        if (activityForm.capacity && activityForm.capacity < 0) {
            errors.capacity = '人數上限不能為負數';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            if (editMode && selectedActivity) {
                await MemberServiceAPI.updateActivity(selectedActivity.id, activityForm);
                enqueueSnackbar('活動更新成功', { variant: 'success' });
            } else {
                await MemberServiceAPI.createActivity(activityForm);
                enqueueSnackbar('活動建立成功', { variant: 'success' });
            }

            await loadActivities();
            handleCloseDialog();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '儲存活動失敗';
            console.error('儲存活動失敗', error);
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = (id: string) => {
        setDeleteActivityId(id);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteActivityId) return;

        try {
            setLoading(true);
            await MemberServiceAPI.deleteActivity(deleteActivityId);
            enqueueSnackbar('活動刪除成功', { variant: 'success' });
            await loadActivities();
        } catch (error) {
            console.error('刪除活動失敗', error);
            enqueueSnackbar('刪除活動失敗', { variant: 'error' });
        } finally {
            setLoading(false);
            setConfirmOpen(false);
            setDeleteActivityId(null);
        }
    };

    const handleYearFilterChange = (e: SelectChangeEvent<string>) => {
        setYearFilter(parseInt(e.target.value, 10));
    };

    const handleStatusFilterChange = (e: SelectChangeEvent<ActivityStatus | ''>) => {
        setStatusFilter(e.target.value as ActivityStatus | '');
    };

    const toggleExpand = (activityId: string) => {
        setExpandedIds(prev =>
            prev.includes(activityId)
                ? prev.filter(id => id !== activityId)
                : [...prev, activityId]
        );
    };

    const getStatusChip = (status: ActivityStatus) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (status) {
            case ActivityStatus.PLANNING:
                color = 'info';
                break;
            case ActivityStatus.REGISTRATION:
                color = 'primary';
                break;
            case ActivityStatus.ONGOING:
                color = 'success';
                break;
            case ActivityStatus.COMPLETED:
                color = 'secondary';
                break;
            case ActivityStatus.CANCELLED:
                color = 'error';
                break;
        }

        return <Chip label={getStatusText(status)} color={color} size="small" />;
    };

    const getStatusText = (status: ActivityStatus) => {
        const statusMap: Record<ActivityStatus, string> = {
            [ActivityStatus.PLANNING]: '計劃中',
            [ActivityStatus.REGISTRATION]: '報名中',
            [ActivityStatus.ONGOING]: '進行中',
            [ActivityStatus.COMPLETED]: '已完成',
            [ActivityStatus.CANCELLED]: '已取消',
            [ActivityStatus.HIDDEN]: '已隱藏'
        };
        return statusMap[status] || status;
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'yyyy/MM/dd');
        } catch (error) {
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
    const handleOpenRegistrationDialog = (activity: AnnualActivity) => {
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

    const handleRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleRegistrationNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const errors: Record<string, string> = {};

        if (!registrationForm.memberName?.trim()) {
            errors.memberName = '請輸入報名姓名';
        }

        if (!registrationForm.phoneNumber?.trim()) {
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
            await MemberServiceAPI.createActivityRegistration({
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
        } catch (error: any) {
            console.error('報名失敗', error);
            enqueueSnackbar(error.message || '報名失敗', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const loadMyRegistrations = async () => {
        try {
            const data = await MemberServiceAPI.getMyRegistrations();
            setMyRegistrations(data);
        } catch (error) {
            console.error('載入我的報名記錄失敗', error);
            enqueueSnackbar('載入我的報名記錄失敗', { variant: 'error' });
        }
    };

    const handleToggleActivityVisibility = async (activity: AnnualActivity) => {
        try {
            setLoading(true);
            await MemberServiceAPI.updateActivity(activity.id, {
                ...activity,
                isVisible: !activity.isVisible
            });
            enqueueSnackbar(`活動已${activity.isVisible ? '隱藏' : '顯示'}`, { variant: 'success' });
            await loadActivities();
        } catch (error) {
            console.error('更新活動顯示狀態失敗', error);
            enqueueSnackbar('更新失敗', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // 管理者專用功能
    const handleOpenManagementDialog = async (activity: AnnualActivity) => {
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

    const loadActivityRegistrations = async (activityId: string) => {
        try {
            const data = await MemberServiceAPI.getRegistrations(activityId);
            // 轉換為ActivityRegistrationDetail格式
            const convertedData = data.map((reg: any) => ({
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
                activityTitle: selectedActivityForManagement?.title || '',
                activityDate: selectedActivityForManagement?.startDate || '',
                activityLocation: selectedActivityForManagement?.location || ''
            }));
            setActivityRegistrations(convertedData);
        } catch (error) {
            console.error('載入活動報名記錄失敗', error);
            enqueueSnackbar('載入報名記錄失敗', { variant: 'error' });
        }
    };

    const calculateStatistics = async (activityId: string) => {
        try {
            const registrations = await MemberServiceAPI.getRegistrations(activityId);

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
        } catch (error) {
            console.error('計算統計資料失敗', error);
        }
    };

    const handleSelectAllRegistrations = () => {
        if (selectedRegistrations.length === activityRegistrations.length) {
            setSelectedRegistrations([]);
        } else {
            setSelectedRegistrations(activityRegistrations.map(reg => reg.id));
        }
    };

    const handleSelectRegistration = (registrationId: string) => {
        setSelectedRegistrations(prev =>
            prev.includes(registrationId)
                ? prev.filter(id => id !== registrationId)
                : [...prev, registrationId]
        );
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
                await MemberServiceAPI.updateRegistration(registrationId, {
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
        } catch (error) {
            console.error('批量更新失敗', error);
            enqueueSnackbar('批量更新失敗', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleExportRegistrations = () => {
        if (!selectedActivityForManagement) return;

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
        link.setAttribute('download', `${selectedActivityForManagement.title}_報名名單_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        enqueueSnackbar('報名名單匯出成功', { variant: 'success' });
    };

    const getRegistrationStatusText = (status: RegistrationStatus) => {
        const statusMap: Record<RegistrationStatus, string> = {
            [RegistrationStatus.PENDING]: '待確認',
            [RegistrationStatus.CONFIRMED]: '已確認',
            [RegistrationStatus.CANCELLED]: '已取消',
            [RegistrationStatus.ATTENDED]: '已出席',
            [RegistrationStatus.ABSENT]: '未出席'
        };
        return statusMap[status] || '未知';
    };

    const getRegistrationStatusChip = (status: RegistrationStatus) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (status) {
            case RegistrationStatus.PENDING:
                color = 'info';
                break;
            case RegistrationStatus.CONFIRMED:
                color = 'success';
                break;
            case RegistrationStatus.CANCELLED:
                color = 'error';
                break;
            case RegistrationStatus.ATTENDED:
                color = 'primary';
                break;
            case RegistrationStatus.ABSENT:
                color = 'warning';
                break;
        }

        return <Chip label={getRegistrationStatusText(status)} color={color} size="small" />;
    };

    // 載入我的報名記錄
    useEffect(() => {
        if (!isAdmin) {
            loadMyRegistrations();
        }
    }, [user]);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    {isAdmin ? '年度活動管理' : '年度活動'}
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="year-filter-label">活動年份</InputLabel>
                                <Select
                                    labelId="year-filter-label"
                                    value={yearFilter.toString()}
                                    onChange={handleYearFilterChange}
                                    label="活動年份"
                                >
                                    {getYearOptions().map((year) => (
                                        <MenuItem key={year} value={year.toString()}>
                                            {year} 年
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="status-filter-label">活動狀態</InputLabel>
                                <Select
                                    labelId="status-filter-label"
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    label="活動狀態"
                                >
                                    <MenuItem value="">全部</MenuItem>
                                    <MenuItem value={ActivityStatus.PLANNING}>計劃中</MenuItem>
                                    <MenuItem value={ActivityStatus.REGISTRATION}>報名中</MenuItem>
                                    <MenuItem value={ActivityStatus.ONGOING}>進行中</MenuItem>
                                    <MenuItem value={ActivityStatus.COMPLETED}>已完成</MenuItem>
                                    <MenuItem value={ActivityStatus.CANCELLED}>已取消</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} container justifyContent="flex-end" spacing={1}>
                            {isAdmin ? (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenDialog()}
                                >
                                    新增活動
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AssessmentIcon />}
                                        onClick={() => setShowMyRegistrations(!showMyRegistrations)}
                                    >
                                        {showMyRegistrations ? '隱藏我的報名' : '我的報名'}
                                    </Button>
                                </>
                            )}
                        </Grid>
                    </Grid>
                </Box>

                {/* 非管理者顯示我的報名記錄 */}
                {!isAdmin && showMyRegistrations && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                我的報名記錄
                            </Typography>
                            {myRegistrations.length === 0 ? (
                                <Typography color="text.secondary">
                                    您還沒有報名任何活動
                                </Typography>
                            ) : (
                                <Grid container spacing={2}>
                                    {myRegistrations.map((registration) => (
                                        <Grid item xs={12} key={registration.id}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {registration.activityTitle}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        活動日期：{formatDate(registration.activityDate)}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        活動地點：{registration.activityLocation}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        總人數：{registration.totalParticipants} 人
                                                        (男：{registration.maleCount} 人，女：{registration.femaleCount} 人)
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        聯絡電話：{registration.phoneNumber}
                                                    </Typography>
                                                    {registration.notes && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            備註：{registration.notes}
                                                        </Typography>
                                                    )}
                                                    <Chip
                                                        label={registration.status === 'confirmed' ? '已確認' : '待確認'}
                                                        color={registration.status === 'confirmed' ? 'success' : 'warning'}
                                                        size="small"
                                                        sx={{ mt: 1 }}
                                                    />
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </CardContent>
                    </Card>
                )}

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell width="5%"></TableCell>
                                    <TableCell>活動標題</TableCell>
                                    <TableCell>活動日期</TableCell>
                                    <TableCell>地點</TableCell>
                                    <TableCell>人數上限</TableCell>
                                    <TableCell>狀態</TableCell>
                                    <TableCell align="right">操作</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            暫無活動記錄
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    activities.map((activity) => (
                                        <React.Fragment key={activity.id}>
                                            <TableRow>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => toggleExpand(activity.id)}
                                                    >
                                                        {expandedIds.includes(activity.id) ? (
                                                            <KeyboardArrowUpIcon />
                                                        ) : (
                                                            <KeyboardArrowDownIcon />
                                                        )}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>{activity.title}</TableCell>
                                                <TableCell>
                                                    {formatDate(activity.startDate)} ~ {formatDate(activity.endDate)}
                                                </TableCell>
                                                <TableCell>{activity.location}</TableCell>
                                                <TableCell>{activity.capacity} 人</TableCell>
                                                <TableCell>{getStatusChip(activity.status)}</TableCell>
                                                <TableCell align="right">
                                                    {isAdmin ? (
                                                        <>
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleOpenDialog(activity)}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                color="info"
                                                                onClick={() => handleOpenManagementDialog(activity)}
                                                                title="管理報名"
                                                            >
                                                                <PeopleIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                color="secondary"
                                                                onClick={() => handleToggleActivityVisibility(activity)}
                                                                title={activity.isVisible ? '隱藏活動' : '顯示活動'}
                                                            >
                                                                {activity.isVisible ? (
                                                                    <VisibilityIcon fontSize="small" />
                                                                ) : (
                                                                    <VisibilityOffIcon fontSize="small" />
                                                                )}
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteConfirm(activity.id)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        activity.status === ActivityStatus.REGISTRATION && activity.isVisible && (
                                                            // 檢查是否已經報名過這個活動
                                                            myRegistrations.some(reg => reg.activityId === activity.id) ? (
                                                                <Chip
                                                                    label="已報名"
                                                                    color="success"
                                                                    size="small"
                                                                />
                                                            ) : (
                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    startIcon={<PersonAddIcon />}
                                                                    onClick={() => handleOpenRegistrationDialog(activity)}
                                                                >
                                                                    報名活動
                                                                </Button>
                                                            )
                                                        )
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                    <Collapse in={expandedIds.includes(activity.id)} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 2 }}>
                                                            <Typography variant="h6" gutterBottom component="div">
                                                                報名狀況
                                                            </Typography>
                                                            <ActivityRegistrationsTable
                                                                activityId={activity.id}
                                                                members={members}
                                                                onReload={loadActivities}
                                                            />
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {/* 活動編輯對話框 */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editMode ? '編輯活動' : '新增活動'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="year-label">活動年份</InputLabel>
                                <Select
                                    labelId="year-label"
                                    value={activityForm.year?.toString() || new Date().getFullYear().toString()}
                                    onChange={handleYearChange}
                                    label="活動年份"
                                >
                                    {getYearOptions().map((year) => (
                                        <MenuItem key={year} value={year.toString()}>
                                            {year} 年
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="status-label">活動狀態</InputLabel>
                                <Select
                                    labelId="status-label"
                                    value={activityForm.status || ActivityStatus.PLANNING}
                                    onChange={handleStatusChange}
                                    label="活動狀態"
                                >
                                    <MenuItem value={ActivityStatus.PLANNING}>計劃中</MenuItem>
                                    <MenuItem value={ActivityStatus.REGISTRATION}>報名中</MenuItem>
                                    <MenuItem value={ActivityStatus.ONGOING}>進行中</MenuItem>
                                    <MenuItem value={ActivityStatus.COMPLETED}>已完成</MenuItem>
                                    <MenuItem value={ActivityStatus.CANCELLED}>已取消</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="活動標題"
                                name="title"
                                value={activityForm.title || ''}
                                onChange={handleInputChange}
                                error={!!formErrors.title}
                                helperText={formErrors.title}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="活動描述"
                                name="description"
                                value={activityForm.description || ''}
                                onChange={handleInputChange}
                                multiline
                                rows={3}
                                error={!!formErrors.description}
                                helperText={formErrors.description}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="開始日期"
                                value={activityForm.startDate ? new Date(activityForm.startDate) : null}
                                onChange={handleStartDateChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!formErrors.startDate,
                                        helperText: formErrors.startDate
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="結束日期"
                                value={activityForm.endDate ? new Date(activityForm.endDate) : null}
                                onChange={handleEndDateChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!formErrors.endDate,
                                        helperText: formErrors.endDate
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="活動地點"
                                name="location"
                                value={activityForm.location || ''}
                                onChange={handleInputChange}
                                error={!!formErrors.location}
                                helperText={formErrors.location}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="人數上限"
                                name="capacity"
                                type="number"
                                value={activityForm.capacity || ''}
                                onChange={handleCapacityChange}
                                error={!!formErrors.capacity}
                                helperText={formErrors.capacity}
                                InputProps={{ inputProps: { min: 1 } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="報名截止日期"
                                value={activityForm.registrationDeadline ? new Date(activityForm.registrationDeadline) : null}
                                onChange={handleDeadlineChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!formErrors.registrationDeadline,
                                        helperText: formErrors.registrationDeadline
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="封面圖片連結（選填）"
                                name="coverImage"
                                value={activityForm.coverImage || ''}
                                onChange={handleInputChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>取消</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {loading ? '處理中...' : '儲存'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 刪除確認對話框 */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    <Typography>確定要刪除這個活動嗎？相關的報名記錄也會一併刪除。</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>取消</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        確定刪除
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 活動報名對話框 */}
            <Dialog open={registrationDialogOpen} onClose={handleCloseRegistrationDialog} maxWidth="md" fullWidth>
                <DialogTitle>活動報名</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="報名姓名"
                                name="memberName"
                                value={registrationForm.memberName}
                                onChange={handleRegistrationInputChange}
                                error={!!registrationErrors.memberName}
                                helperText={registrationErrors.memberName}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="聯絡電話"
                                name="phoneNumber"
                                value={registrationForm.phoneNumber}
                                onChange={handleRegistrationInputChange}
                                error={!!registrationErrors.phoneNumber}
                                helperText={registrationErrors.phoneNumber}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="總人數"
                                name="totalParticipants"
                                type="number"
                                value={registrationForm.totalParticipants}
                                onChange={handleRegistrationNumberChange}
                                error={!!registrationErrors.totalParticipants}
                                helperText={registrationErrors.totalParticipants}
                                InputProps={{ inputProps: { min: 1 } }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="男性人數"
                                name="maleCount"
                                type="number"
                                value={registrationForm.maleCount}
                                onChange={handleRegistrationNumberChange}
                                error={!!registrationErrors.maleCount}
                                helperText={registrationErrors.maleCount}
                                InputProps={{ inputProps: { min: 0 } }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="女性人數"
                                name="femaleCount"
                                type="number"
                                value={registrationForm.femaleCount}
                                onChange={handleRegistrationNumberChange}
                                error={!!registrationErrors.femaleCount}
                                helperText={registrationErrors.femaleCount}
                                InputProps={{ inputProps: { min: 0 } }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="備註"
                                name="notes"
                                value={registrationForm.notes || ''}
                                onChange={handleRegistrationInputChange}
                                multiline
                                rows={3}
                                placeholder="特殊需求、飲食限制等"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRegistrationDialog}>取消</Button>
                    <Button onClick={handleRegistrationSubmit} variant="contained" disabled={loading}>
                        {loading ? '處理中...' : '確認報名'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 管理者專用：報名管理對話框 */}
            <Dialog open={managementDialogOpen} onClose={handleCloseManagementDialog} maxWidth="lg" fullWidth>
                <DialogTitle>
                    {selectedActivityForManagement?.title} - 報名管理
                </DialogTitle>
                <DialogContent>
                    {selectedActivityForManagement && (
                        <Box>
                            {/* 統計資訊 */}
                            <Card sx={{ mb: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        統計資訊
                                    </Typography>
                                    {statistics && (
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    總報名數
                                                </Typography>
                                                <Typography variant="h4" color="primary">
                                                    {statistics.totalRegistrations}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    總人數
                                                </Typography>
                                                <Typography variant="h4" color="secondary">
                                                    {statistics.totalParticipants}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    男性
                                                </Typography>
                                                <Typography variant="h4" color="info.main">
                                                    {statistics.maleCount}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    女性
                                                </Typography>
                                                <Typography variant="h4" color="error.main">
                                                    {statistics.femaleCount}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {/* 狀態分布 */}
                                    {statistics && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                狀態分布
                                            </Typography>
                                            <Grid container spacing={1}>
                                                <Grid item>
                                                    <Chip label={`待確認: ${statistics.statusBreakdown.pending}`} color="info" size="small" />
                                                </Grid>
                                                <Grid item>
                                                    <Chip label={`已確認: ${statistics.statusBreakdown.confirmed}`} color="success" size="small" />
                                                </Grid>
                                                <Grid item>
                                                    <Chip label={`已出席: ${statistics.statusBreakdown.attended}`} color="primary" size="small" />
                                                </Grid>
                                                <Grid item>
                                                    <Chip label={`已取消: ${statistics.statusBreakdown.cancelled}`} color="error" size="small" />
                                                </Grid>
                                                <Grid item>
                                                    <Chip label={`未出席: ${statistics.statusBreakdown.absent}`} color="warning" size="small" />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {/* 操作按鈕 */}
                            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleExportRegistrations}
                                >
                                    匯出報名名單
                                </Button>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>批量更新狀態</InputLabel>
                                        <Select
                                            value={bulkStatusUpdate}
                                            onChange={(e) => setBulkStatusUpdate(e.target.value as RegistrationStatus)}
                                            label="批量更新狀態"
                                        >
                                            <MenuItem value={RegistrationStatus.PENDING}>待確認</MenuItem>
                                            <MenuItem value={RegistrationStatus.CONFIRMED}>已確認</MenuItem>
                                            <MenuItem value={RegistrationStatus.ATTENDED}>已出席</MenuItem>
                                            <MenuItem value={RegistrationStatus.CANCELLED}>已取消</MenuItem>
                                            <MenuItem value={RegistrationStatus.ABSENT}>未出席</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Button
                                        variant="contained"
                                        onClick={handleBulkStatusUpdate}
                                        disabled={selectedRegistrations.length === 0}
                                    >
                                        更新選中項目 ({selectedRegistrations.length})
                                    </Button>
                                </Box>
                            </Box>

                            {/* 報名名單表格 */}
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell padding="checkbox">
                                                <IconButton
                                                    size="small"
                                                    onClick={handleSelectAllRegistrations}
                                                >
                                                    {selectedRegistrations.length === activityRegistrations.length ? (
                                                        <CheckBoxIcon />
                                                    ) : (
                                                        <CheckBoxOutlineBlankIcon />
                                                    )}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>報名者</TableCell>
                                            <TableCell>聯絡電話</TableCell>
                                            <TableCell>總人數</TableCell>
                                            <TableCell>男性</TableCell>
                                            <TableCell>女性</TableCell>
                                            <TableCell>報名日期</TableCell>
                                            <TableCell>狀態</TableCell>
                                            <TableCell>備註</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {activityRegistrations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center">
                                                    暫無報名記錄
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            activityRegistrations.map((registration) => (
                                                <TableRow key={registration.id}>
                                                    <TableCell padding="checkbox">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleSelectRegistration(registration.id)}
                                                        >
                                                            {selectedRegistrations.includes(registration.id) ? (
                                                                <CheckBoxIcon />
                                                            ) : (
                                                                <CheckBoxOutlineBlankIcon />
                                                            )}
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell>{registration.memberName}</TableCell>
                                                    <TableCell>{registration.phoneNumber}</TableCell>
                                                    <TableCell>{registration.totalParticipants}</TableCell>
                                                    <TableCell>{registration.maleCount}</TableCell>
                                                    <TableCell>{registration.femaleCount}</TableCell>
                                                    <TableCell>{formatDate(registration.registrationDate)}</TableCell>
                                                    <TableCell>{getRegistrationStatusChip(registration.status)}</TableCell>
                                                    <TableCell>{registration.notes}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseManagementDialog}>關閉</Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default AnnualActivitiesTab; 