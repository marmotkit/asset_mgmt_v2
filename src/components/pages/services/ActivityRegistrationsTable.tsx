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
    SelectChangeEvent
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

import { ActivityRegistration, RegistrationStatus } from '../../../types/services';
import { MemberServiceAPI } from '../../../services/memberServiceAPI';
import { User } from '../../../types/user';
import LoadingSpinner from '../../common/LoadingSpinner';

interface ActivityRegistrationsTableProps {
    activityId: string;
    members: User[];
    onReload?: () => void;
}

const ActivityRegistrationsTable: React.FC<ActivityRegistrationsTableProps> = ({
    activityId,
    members,
    onReload
}) => {
    const [registrations, setRegistrations] = useState<ActivityRegistration[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [registrationForm, setRegistrationForm] = useState<Partial<ActivityRegistration>>({
        activityId,
        memberId: '',
        companions: 0,
        notes: '',
        status: RegistrationStatus.PENDING
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteRegistrationId, setDeleteRegistrationId] = useState<string | null>(null);
    const [selectedRegistration, setSelectedRegistration] = useState<ActivityRegistration | null>(null);
    const [editMode, setEditMode] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        loadRegistrations();
    }, [activityId]);

    const loadRegistrations = async () => {
        try {
            setLoading(true);
            const data = await MemberServiceAPI.getRegistrations(activityId);
            setRegistrations(data);
        } catch (error) {
            console.error('載入報名記錄失敗', error);
            enqueueSnackbar('載入報名記錄失敗', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (registration?: ActivityRegistration) => {
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
        } else {
            setRegistrationForm({
                activityId,
                memberId: '',
                companions: 0,
                notes: '',
                status: RegistrationStatus.PENDING
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegistrationForm({
            ...registrationForm,
            [name]: value
        });
    };

    const handleStatusChange = (e: SelectChangeEvent<RegistrationStatus>) => {
        setRegistrationForm({
            ...registrationForm,
            status: e.target.value as RegistrationStatus
        });
    };

    const handleMemberChange = (e: SelectChangeEvent<string>) => {
        setRegistrationForm({
            ...registrationForm,
            memberId: e.target.value
        });
    };

    const handleCompanionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const companions = parseInt(e.target.value, 10);
        setRegistrationForm({
            ...registrationForm,
            companions: isNaN(companions) ? 0 : companions
        });
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!registrationForm.memberId) errors.memberId = '請選擇會員';
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
                await MemberServiceAPI.updateRegistration(selectedRegistration.id, {
                    status: registrationForm.status,
                    notes: registrationForm.notes,
                    companions: registrationForm.companions
                });
                enqueueSnackbar('報名記錄更新成功', { variant: 'success' });
            } else {
                // 建立新報名記錄
                const member = members.find(m => m.id === registrationForm.memberId);
                await MemberServiceAPI.createActivityRegistration({
                    activityId: activityId,
                    memberName: member?.name || '未知會員',
                    phoneNumber: member?.phone || '',
                    totalParticipants: (registrationForm.companions || 0) + 1,
                    maleCount: 0,
                    femaleCount: 0,
                    notes: registrationForm.notes || ''
                });
                enqueueSnackbar('報名記錄建立成功', { variant: 'success' });
            }

            await loadRegistrations();
            if (onReload) onReload();
            handleCloseDialog();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '儲存報名記錄失敗';
            console.error('儲存報名記錄失敗', error);
            enqueueSnackbar(errorMessage, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = (id: string) => {
        setDeleteRegistrationId(id);
        setConfirmOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteRegistrationId) return;

        try {
            setLoading(true);
            await MemberServiceAPI.deleteRegistration(deleteRegistrationId);
            enqueueSnackbar('報名記錄刪除成功', { variant: 'success' });
            await loadRegistrations();
            if (onReload) onReload();
        } catch (error) {
            console.error('刪除報名記錄失敗', error);
            enqueueSnackbar('刪除報名記錄失敗', { variant: 'error' });
        } finally {
            setLoading(false);
            setConfirmOpen(false);
            setDeleteRegistrationId(null);
        }
    };

    const getStatusChip = (status: RegistrationStatus) => {
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

        return <Chip label={getStatusText(status)} color={color} size="small" />;
    };

    const getStatusText = (status: RegistrationStatus) => {
        const statusMap: Record<RegistrationStatus, string> = {
            [RegistrationStatus.PENDING]: '待確認',
            [RegistrationStatus.CONFIRMED]: '已確認',
            [RegistrationStatus.CANCELLED]: '已取消',
            [RegistrationStatus.ATTENDED]: '已出席',
            [RegistrationStatus.ABSENT]: '未出席'
        };

        return statusMap[status] || '未知';
    };

    const getMemberName = (memberId: string, memberName?: string) => {
        // 優先使用 member_name 欄位
        if (memberName && memberName.trim()) {
            return memberName;
        }

        // 如果沒有 member_name，則從 members 陣列中查找
        const member = members.find(m => m.id === memberId);
        return member ? member.name : '未找到會員';
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'yyyy/MM/dd HH:mm');
        } catch (error) {
            return dateString;
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    新增報名
                </Button>
            </Box>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>會員</TableCell>
                                <TableCell>報名日期</TableCell>
                                <TableCell>隨行人數</TableCell>
                                <TableCell>備註</TableCell>
                                <TableCell>狀態</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {registrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        暫無報名記錄
                                    </TableCell>
                                </TableRow>
                            ) : (
                                registrations.map((registration) => (
                                    <TableRow key={registration.id}>
                                        <TableCell>{getMemberName(registration.memberId, registration.memberName)}</TableCell>
                                        <TableCell>{formatDate(registration.registrationDate)}</TableCell>
                                        <TableCell>{registration.companions || 0} 人</TableCell>
                                        <TableCell>{registration.notes}</TableCell>
                                        <TableCell>{getStatusChip(registration.status)}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog(registration)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteConfirm(registration.id)}
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

            {/* 報名編輯對話框 */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? '編輯報名資訊' : '新增報名'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!formErrors.memberId}>
                                <InputLabel id="member-label">會員</InputLabel>
                                <Select
                                    labelId="member-label"
                                    value={registrationForm.memberId || ''}
                                    onChange={handleMemberChange}
                                    label="會員"
                                    disabled={editMode}
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
                            <TextField
                                fullWidth
                                label="隨行人數"
                                name="companions"
                                type="number"
                                value={registrationForm.companions || 0}
                                onChange={handleCompanionsChange}
                                error={!!formErrors.companions}
                                helperText={formErrors.companions}
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!formErrors.status}>
                                <InputLabel id="status-label">報名狀態</InputLabel>
                                <Select
                                    labelId="status-label"
                                    value={registrationForm.status || RegistrationStatus.PENDING}
                                    onChange={handleStatusChange}
                                    label="報名狀態"
                                >
                                    <MenuItem value={RegistrationStatus.PENDING}>待確認</MenuItem>
                                    <MenuItem value={RegistrationStatus.CONFIRMED}>已確認</MenuItem>
                                    <MenuItem value={RegistrationStatus.CANCELLED}>已取消</MenuItem>
                                    <MenuItem value={RegistrationStatus.ATTENDED}>已出席</MenuItem>
                                    <MenuItem value={RegistrationStatus.ABSENT}>未出席</MenuItem>
                                </Select>
                                {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="備註"
                                name="notes"
                                value={registrationForm.notes || ''}
                                onChange={handleInputChange}
                                multiline
                                rows={2}
                            />
                        </Grid>

                        {registrationForm.specialRequests && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="特殊需求"
                                    name="specialRequests"
                                    value={registrationForm.specialRequests || ''}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                        )}
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
                    <Typography>確定要刪除這個報名記錄嗎？</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>取消</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        確定刪除
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ActivityRegistrationsTable; 