import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TextField,
    Button,
    Grid,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    SelectChangeEvent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Alert,
    Snackbar,
    TableSortLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
    Download as DownloadIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { FeeHistory as FeeHistoryType, FeeHistoryFilter, PaymentStatus } from '../../../types/fee';
import { formatDate } from '../../../utils/dateUtils';
import { formatCurrency } from '../../../utils/numberUtils';
import { feeHistoryService, getHistoriesFromApi } from '../../../services/feeHistoryService';

type StatusOption = {
    value: '' | PaymentStatus;
    label: string;
};

const getStatusChip = (status: PaymentStatus) => {
    const statusConfig = {
        '待收款': { label: '待收款', color: 'warning' as const },
        '已收款': { label: '已收款', color: 'success' as const },
        '逾期': { label: '逾期', color: 'error' as const },
        '終止': { label: '終止', color: 'default' as const }
    };

    const config = statusConfig[status] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
};

const statusOptions: { value: PaymentStatus | '', label: string }[] = [
    { value: '', label: '全部' },
    { value: '待收款', label: '待收款' },
    { value: '已收款', label: '已收款' },
    { value: '逾期', label: '逾期' },
    { value: '終止', label: '終止' }
];

export const FeeHistory: React.FC = () => {
    const [histories, setHistories] = useState<FeeHistoryType[]>([]);
    const [filter, setFilter] = useState<FeeHistoryFilter>({
        memberId: '',
        userId: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [dateRange, setDateRange] = useState<{
        startDate: Date | null;
        endDate: Date | null;
    }>({
        startDate: null,
        endDate: null
    });
    const [loading, setLoading] = useState(true);
    const [editingRecord, setEditingRecord] = useState<FeeHistoryType | null>(null);
    const [deleteRecord, setDeleteRecord] = useState<FeeHistoryType | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const [orderBy, setOrderBy] = useState<string>('dueDate');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedHistories = [...histories].sort((a, b) => {
        const aValue = a[orderBy as keyof FeeHistoryType];
        const bValue = b[orderBy as keyof FeeHistoryType];
        if (aValue === undefined || bValue === undefined) return 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return order === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return order === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
    });

    const loadFeeHistory = async () => {
        console.log('loadFeeHistory called', filter, dateRange);
        setLoading(true);
        try {
            const historyFilter: FeeHistoryFilter = {
                ...filter,
                startDate: dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : undefined,
                endDate: dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : undefined
            };
            console.log('before getHistoriesFromApi', historyFilter);
            const data = await getHistoriesFromApi(historyFilter);
            console.log('after getHistoriesFromApi', data);
            setHistories(data);
        } catch (error) {
            console.error('載入會費歷史記錄失敗:', error);
            setHistories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeeHistory();
    }, [filter, dateRange]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const isPaymentStatus = (value: string): value is PaymentStatus => {
        return ['待收款', '已收款', '逾期', '終止'].includes(value);
    };

    const handleStatusChange = (e: SelectChangeEvent<PaymentStatus | ''>) => {
        const value = e.target.value as PaymentStatus | '';
        setFilter(prev => ({
            ...prev,
            status: value === '' ? undefined : value as PaymentStatus
        }));
    };

    const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
        setDateRange(prev => ({
            ...prev,
            [field]: date
        }));
    };

    const handleExport = async () => {
        try {
            const blob = await feeHistoryService.exportToExcel(filter);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `會費歷史記錄_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('匯出失敗:', error);
        }
    };

    const handleEditClick = (record: FeeHistoryType) => {
        setEditingRecord({ ...record });
    };

    const handleEditSave = async () => {
        if (!editingRecord) return;

        try {
            const updated = await feeHistoryService.updateRecord(editingRecord.id, editingRecord);
            if (updated) {
                setHistories(prev => prev.map(r => r.id === updated.id ? updated : r));
                setSnackbar({
                    open: true,
                    message: '更新成功',
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error('更新失敗:', error);
            setSnackbar({
                open: true,
                message: '更新失敗',
                severity: 'error'
            });
        }
        setEditingRecord(null);
    };

    const handleDeleteClick = (record: FeeHistoryType) => {
        setDeleteRecord(record);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteRecord) return;

        try {
            const success = await feeHistoryService.deleteRecord(deleteRecord.id);
            if (success) {
                setHistories(prev => prev.filter(r => r.id !== deleteRecord.id));
                setSnackbar({
                    open: true,
                    message: '刪除成功',
                    severity: 'success'
                });
            }
        } catch (error) {
            console.error('刪除失敗:', error);
            setSnackbar({
                open: true,
                message: '刪除失敗',
                severity: 'error'
            });
        }
        setDeleteRecord(null);
    };

    const handleFieldChange = (field: keyof FeeHistoryType, value: any) => {
        if (editingRecord) {
            setEditingRecord(prev => ({
                ...prev!,
                [field]: value
            }));
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
                會費歷史記錄
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <TextField
                            fullWidth
                            label="會員編號/姓名"
                            name="userId"
                            value={filter.userId}
                            onChange={handleTextChange}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>收款狀態</InputLabel>
                            <Select<PaymentStatus | ''>
                                name="status"
                                value={filter.status || ''}
                                onChange={handleStatusChange}
                                label="收款狀態"
                                size="small"
                            >
                                {statusOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <DatePicker
                            label="起始日期"
                            value={dateRange.startDate}
                            onChange={handleDateChange('startDate')}
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <DatePicker
                            label="結束日期"
                            value={dateRange.endDate}
                            onChange={handleDateChange('endDate')}
                            slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleExport}
                        >
                            匯出報表
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'userId'}
                                    direction={orderBy === 'userId' ? order : 'asc'}
                                    onClick={() => handleSort('userId')}
                                >
                                    會員編號
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'userName'}
                                    direction={orderBy === 'userName' ? order : 'asc'}
                                    onClick={() => handleSort('userName')}
                                >
                                    姓名
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'memberType'}
                                    direction={orderBy === 'memberType' ? order : 'asc'}
                                    onClick={() => handleSort('memberType')}
                                >
                                    會員類型
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'amount'}
                                    direction={orderBy === 'amount' ? order : 'asc'}
                                    onClick={() => handleSort('amount')}
                                >
                                    金額
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'dueDate'}
                                    direction={orderBy === 'dueDate' ? order : 'asc'}
                                    onClick={() => handleSort('dueDate')}
                                >
                                    到期日
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'paymentDate'}
                                    direction={orderBy === 'paymentDate' ? order : 'asc'}
                                    onClick={() => handleSort('paymentDate')}
                                >
                                    繳費日期
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'paymentMethod'}
                                    direction={orderBy === 'paymentMethod' ? order : 'asc'}
                                    onClick={() => handleSort('paymentMethod')}
                                >
                                    繳費方式
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'status'}
                                    direction={orderBy === 'status' ? order : 'asc'}
                                    onClick={() => handleSort('status')}
                                >
                                    狀態
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'note'}
                                    direction={orderBy === 'note' ? order : 'asc'}
                                    onClick={() => handleSort('note')}
                                >
                                    備註
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedHistories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center">
                                    目前沒有符合條件的歷史記錄
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedHistories.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{record.userId}</TableCell>
                                    <TableCell>{record.userName}</TableCell>
                                    <TableCell>{record.memberType}</TableCell>
                                    <TableCell align="right">{formatCurrency(record.amount)}</TableCell>
                                    <TableCell>{formatDate(record.dueDate)}</TableCell>
                                    <TableCell>{record.paymentDate ? formatDate(record.paymentDate) : '-'}</TableCell>
                                    <TableCell>{record.paymentMethod || '-'}</TableCell>
                                    <TableCell>{getStatusChip(record.status)}</TableCell>
                                    <TableCell>{record.note || '-'}</TableCell>
                                    <TableCell>
                                        <Tooltip title="編輯">
                                            <IconButton size="small" onClick={() => handleEditClick(record)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="刪除">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteClick(record)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 編輯對話框 */}
            <Dialog open={!!editingRecord} onClose={() => setEditingRecord(null)} maxWidth="md" fullWidth>
                <DialogTitle>
                    編輯歷史記錄
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="會員編號"
                                value={editingRecord?.userId || ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="姓名"
                                value={editingRecord?.userName || ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="會員類型"
                                value={editingRecord?.memberType || ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="金額"
                                type="number"
                                value={editingRecord?.amount || ''}
                                onChange={(e) => handleFieldChange('amount', Number(e.target.value))}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="到期日"
                                type="date"
                                value={editingRecord?.dueDate || ''}
                                onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="繳費日期"
                                type="date"
                                value={editingRecord?.paymentDate || ''}
                                onChange={(e) => handleFieldChange('paymentDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>狀態</InputLabel>
                                <Select
                                    value={editingRecord?.status || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '待收款' || value === '已收款' || value === '逾期' || value === '終止') {
                                            handleFieldChange('status', value);
                                        }
                                    }}
                                    label="狀態"
                                >
                                    <MenuItem value="待收款">待收款</MenuItem>
                                    <MenuItem value="已收款">已收款</MenuItem>
                                    <MenuItem value="逾期">逾期</MenuItem>
                                    <MenuItem value="終止">終止</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>收款方式</InputLabel>
                                <Select
                                    value={editingRecord?.paymentMethod || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '轉帳' || value === 'Line Pay' || value === '現金' || value === '票據' || value === '其他') {
                                            handleFieldChange('paymentMethod', value);
                                        }
                                    }}
                                    label="收款方式"
                                >
                                    <MenuItem value="轉帳">轉帳</MenuItem>
                                    <MenuItem value="Line Pay">Line Pay</MenuItem>
                                    <MenuItem value="現金">現金</MenuItem>
                                    <MenuItem value="票據">票據</MenuItem>
                                    <MenuItem value="其他">其他</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="備註"
                                multiline
                                rows={4}
                                value={editingRecord?.note || ''}
                                onChange={(e) => handleFieldChange('note', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingRecord(null)}>取消</Button>
                    <Button onClick={handleEditSave} variant="contained">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 刪除確認對話框 */}
            <Dialog open={!!deleteRecord} onClose={() => setDeleteRecord(null)}>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    <Typography>
                        確定要刪除 {deleteRecord?.userName} 的歷史記錄嗎？此操作無法復原。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteRecord(null)}>取消</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                        刪除
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 提示訊息 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FeeHistory; 