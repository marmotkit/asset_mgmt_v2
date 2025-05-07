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
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Chip,
    Grid,
    SelectChangeEvent,
    Tabs,
    Tab
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import zhTW from 'date-fns/locale/zh-TW';
import { formatISO, format } from 'date-fns';

import { MemberCare, CareType, CareStatus } from '../../../types/services';
import { MemberServiceAPI } from '../../../services/memberServiceAPI';
import { ApiService } from '../../../services/api.service';
import { User } from '../../../types/user';
import LoadingSpinner from '../../common/LoadingSpinner';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`care-tabpanel-${index}`}
            aria-labelledby={`care-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const MemberCareTab: React.FC = () => {
    const [cares, setCares] = useState<MemberCare[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [careForm, setCareForm] = useState<Partial<MemberCare>>({
        memberId: '',
        type: CareType.BIRTHDAY,
        title: '',
        description: '',
        date: formatISO(new Date()),
        status: CareStatus.PLANNED,
        notes: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteCareId, setDeleteCareId] = useState<string | null>(null);
    const [selectedCare, setSelectedCare] = useState<MemberCare | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [typeFilter, setTypeFilter] = useState<CareType | ''>('');
    const [statusFilter, setStatusFilter] = useState<CareStatus | ''>('');
    const [members, setMembers] = useState<User[]>([]);
    const [currentTab, setCurrentTab] = useState(0);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        loadCares();
        loadMembers();
    }, [typeFilter, statusFilter]);

    const loadCares = async () => {
        try {
            setLoading(true);
            const data = await MemberServiceAPI.getMemberCares(
                undefined,
                typeFilter || undefined,
                statusFilter || undefined
            );
            setCares(data);
        } catch (error) {
            console.error('載入會員關懷記錄失敗', error);
            enqueueSnackbar('載入會員關懷記錄失敗', { variant: 'error' });
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

    const handleOpenDialog = (care?: MemberCare) => {
        if (care) {
            setCareForm({
                ...care
            });
            setEditMode(true);
            setSelectedCare(care);
        } else {
            setCareForm({
                memberId: '',
                type: CareType.BIRTHDAY,
                title: '',
                description: '',
                date: formatISO(new Date()),
                status: CareStatus.PLANNED,
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCareForm({
            ...careForm,
            [name]: value
        });
    };

    const handleTypeChange = (e: SelectChangeEvent<CareType>) => {
        setCareForm({
            ...careForm,
            type: e.target.value as CareType
        });
    };

    const handleStatusChange = (e: SelectChangeEvent<CareStatus>) => {
        setCareForm({
            ...careForm,
            status: e.target.value as CareStatus
        });
    };

    const handleMemberChange = (e: SelectChangeEvent<string>) => {
        setCareForm({
            ...careForm,
            memberId: e.target.value
        });
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setCareForm({
                ...careForm,
                date: formatISO(date)
            });
        }
    };

    const handleFollowUpDateChange = (date: Date | null) => {
        if (date) {
            setCareForm({
                ...careForm,
                followUpDate: formatISO(date)
            });
        } else {
            // 如果日期為 null，則清除追蹤日期
            const updatedForm = { ...careForm };
            delete updatedForm.followUpDate;
            setCareForm(updatedForm);
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!careForm.memberId) errors.memberId = '請選擇會員';
        if (!careForm.title) errors.title = '請輸入標題';
        if (!careForm.description) errors.description = '請輸入描述';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);

            if (editMode && selectedCare) {
                await MemberServiceAPI.updateMemberCare(selectedCare.id, careForm);
                enqueueSnackbar('會員關懷更新成功', { variant: 'success' });
            } else {
                await MemberServiceAPI.createMemberCare(careForm);
                enqueueSnackbar('會員關懷建立成功', { variant: 'success' });
            }

            await loadCares();
            handleCloseDialog();
        } catch (error) {
            console.error('儲存會員關懷失敗', error);
            enqueueSnackbar('儲存會員關懷失敗', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = (id: string) => {
        setDeleteCareId(id);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteCareId) return;

        try {
            setLoading(true);
            await MemberServiceAPI.deleteMemberCare(deleteCareId);
            enqueueSnackbar('會員關懷刪除成功', { variant: 'success' });
            await loadCares();
        } catch (error) {
            console.error('刪除會員關懷失敗', error);
            enqueueSnackbar('刪除會員關懷失敗', { variant: 'error' });
        } finally {
            setLoading(false);
            setConfirmOpen(false);
            setDeleteCareId(null);
        }
    };

    const handleTypeFilterChange = (e: SelectChangeEvent<CareType | ''>) => {
        setTypeFilter(e.target.value as CareType | '');
    };

    const handleStatusFilterChange = (e: SelectChangeEvent<CareStatus | ''>) => {
        setStatusFilter(e.target.value as CareStatus | '');
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const getStatusChip = (status: CareStatus) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (status) {
            case CareStatus.PLANNED:
                color = 'info';
                break;
            case CareStatus.PROCESSING:
                color = 'warning';
                break;
            case CareStatus.COMPLETED:
                color = 'success';
                break;
            case CareStatus.CANCELLED:
                color = 'error';
                break;
        }

        return <Chip label={getStatusText(status)} color={color} size="small" />;
    };

    const getTypeChip = (type: CareType) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (type) {
            case CareType.BIRTHDAY:
                color = 'primary';
                break;
            case CareType.HOLIDAY:
                color = 'success';
                break;
            case CareType.ANNIVERSARY:
                color = 'secondary';
                break;
            case CareType.CONDOLENCE:
                color = 'error';
                break;
            case CareType.CONGRATULATION:
                color = 'success';
                break;
            case CareType.FOLLOW_UP:
                color = 'warning';
                break;
            case CareType.OTHER:
                color = 'default';
                break;
        }

        return <Chip label={getTypeText(type)} color={color} size="small" />;
    };

    const getStatusText = (status: CareStatus) => {
        const statusMap: Record<CareStatus, string> = {
            [CareStatus.PLANNED]: '計劃中',
            [CareStatus.PROCESSING]: '處理中',
            [CareStatus.COMPLETED]: '已完成',
            [CareStatus.CANCELLED]: '已取消'
        };

        return statusMap[status] || '未知';
    };

    const getTypeText = (type: CareType) => {
        const typeMap: Record<CareType, string> = {
            [CareType.BIRTHDAY]: '生日祝福',
            [CareType.HOLIDAY]: '節日祝福',
            [CareType.ANNIVERSARY]: '紀念日',
            [CareType.CONDOLENCE]: '慰問關懷',
            [CareType.CONGRATULATION]: '恭賀祝福',
            [CareType.FOLLOW_UP]: '追蹤關懷',
            [CareType.OTHER]: '其他'
        };

        return typeMap[type] || '未知';
    };

    const getMemberName = (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        return member ? member.name : '未找到會員';
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'yyyy/MM/dd');
        } catch (error) {
            return dateString;
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    會員關懷管理
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="type-filter-label">關懷類型</InputLabel>
                                <Select
                                    labelId="type-filter-label"
                                    value={typeFilter}
                                    onChange={handleTypeFilterChange}
                                    label="關懷類型"
                                >
                                    <MenuItem value="">全部</MenuItem>
                                    <MenuItem value={CareType.BIRTHDAY}>生日祝福</MenuItem>
                                    <MenuItem value={CareType.HOLIDAY}>節日祝福</MenuItem>
                                    <MenuItem value={CareType.ANNIVERSARY}>紀念日</MenuItem>
                                    <MenuItem value={CareType.CONDOLENCE}>慰問關懷</MenuItem>
                                    <MenuItem value={CareType.CONGRATULATION}>恭賀祝福</MenuItem>
                                    <MenuItem value={CareType.FOLLOW_UP}>追蹤關懷</MenuItem>
                                    <MenuItem value={CareType.OTHER}>其他</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="status-filter-label">狀態</InputLabel>
                                <Select
                                    labelId="status-filter-label"
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    label="狀態"
                                >
                                    <MenuItem value="">全部</MenuItem>
                                    <MenuItem value={CareStatus.PLANNED}>計劃中</MenuItem>
                                    <MenuItem value={CareStatus.PROCESSING}>處理中</MenuItem>
                                    <MenuItem value={CareStatus.COMPLETED}>已完成</MenuItem>
                                    <MenuItem value={CareStatus.CANCELLED}>已取消</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} container justifyContent="flex-end">
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => handleOpenDialog()}
                            >
                                新增關懷記錄
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange}>
                        <Tab label="關懷列表" />
                        <Tab label="日曆視圖" disabled />
                    </Tabs>
                </Box>

                <TabPanel value={currentTab} index={0}>
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>標題</TableCell>
                                        <TableCell>會員</TableCell>
                                        <TableCell>類型</TableCell>
                                        <TableCell>日期</TableCell>
                                        <TableCell>追蹤日期</TableCell>
                                        <TableCell>狀態</TableCell>
                                        <TableCell align="right">操作</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cares.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                暫無關懷記錄
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        cares.map((care) => (
                                            <TableRow key={care.id}>
                                                <TableCell>{care.title}</TableCell>
                                                <TableCell>{getMemberName(care.memberId)}</TableCell>
                                                <TableCell>{getTypeChip(care.type)}</TableCell>
                                                <TableCell>{formatDate(care.date)}</TableCell>
                                                <TableCell>
                                                    {care.followUpDate ? formatDate(care.followUpDate) : '無'}
                                                </TableCell>
                                                <TableCell>{getStatusChip(care.status)}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleOpenDialog(care)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteConfirm(care.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    <Typography>日曆視圖（開發中）</Typography>
                </TabPanel>
            </Box>

            {/* 關懷編輯對話框 */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editMode ? '編輯關懷記錄' : '新增關懷記錄'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!formErrors.memberId}>
                                <InputLabel id="member-label">會員</InputLabel>
                                <Select
                                    labelId="member-label"
                                    value={careForm.memberId || ''}
                                    onChange={handleMemberChange}
                                    label="會員"
                                >
                                    {members.map((member) => (
                                        <MenuItem key={member.id} value={member.id}>
                                            {member.name} ({member.memberNo})
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formErrors.memberId && <FormHelperText>{formErrors.memberId}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!formErrors.type}>
                                <InputLabel id="type-label">關懷類型</InputLabel>
                                <Select
                                    labelId="type-label"
                                    value={careForm.type || CareType.BIRTHDAY}
                                    onChange={handleTypeChange}
                                    label="關懷類型"
                                >
                                    <MenuItem value={CareType.BIRTHDAY}>生日祝福</MenuItem>
                                    <MenuItem value={CareType.HOLIDAY}>節日祝福</MenuItem>
                                    <MenuItem value={CareType.ANNIVERSARY}>紀念日</MenuItem>
                                    <MenuItem value={CareType.CONDOLENCE}>慰問關懷</MenuItem>
                                    <MenuItem value={CareType.CONGRATULATION}>恭賀祝福</MenuItem>
                                    <MenuItem value={CareType.FOLLOW_UP}>追蹤關懷</MenuItem>
                                    <MenuItem value={CareType.OTHER}>其他</MenuItem>
                                </Select>
                                {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="標題"
                                name="title"
                                value={careForm.title || ''}
                                onChange={handleInputChange}
                                error={!!formErrors.title}
                                helperText={formErrors.title}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="描述"
                                name="description"
                                value={careForm.description || ''}
                                onChange={handleInputChange}
                                multiline
                                rows={3}
                                error={!!formErrors.description}
                                helperText={formErrors.description}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="關懷日期"
                                value={careForm.date ? new Date(careForm.date) : null}
                                onChange={handleDateChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!formErrors.date,
                                        helperText: formErrors.date
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="追蹤日期（可選）"
                                value={careForm.followUpDate ? new Date(careForm.followUpDate) : null}
                                onChange={handleFollowUpDateChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!formErrors.followUpDate,
                                        helperText: formErrors.followUpDate
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!formErrors.status}>
                                <InputLabel id="status-label">狀態</InputLabel>
                                <Select
                                    labelId="status-label"
                                    value={careForm.status || CareStatus.PLANNED}
                                    onChange={handleStatusChange}
                                    label="狀態"
                                >
                                    <MenuItem value={CareStatus.PLANNED}>計劃中</MenuItem>
                                    <MenuItem value={CareStatus.PROCESSING}>處理中</MenuItem>
                                    <MenuItem value={CareStatus.COMPLETED}>已完成</MenuItem>
                                    <MenuItem value={CareStatus.CANCELLED}>已取消</MenuItem>
                                </Select>
                                {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="負責人員（可選）"
                                name="assignedTo"
                                value={careForm.assignedTo || ''}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="備註"
                                name="notes"
                                value={careForm.notes || ''}
                                onChange={handleInputChange}
                                multiline
                                rows={2}
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
                    <Typography>確定要刪除這個關懷記錄嗎？</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>取消</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        確定刪除
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default MemberCareTab; 