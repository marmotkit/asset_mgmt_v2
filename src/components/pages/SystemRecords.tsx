import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Grid, Chip, IconButton, Button, TextField, MenuItem, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress
} from '@mui/material';
import {
    Delete as DeleteIcon,
    VisibilityOff as VisibilityOffIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    RestoreFromTrash as RestoreIcon,
    Receipt as ReceiptIcon,
    Paid as PaidIcon,
    AccountBalanceWallet as WalletIcon,
    FilterList as FilterListIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { systemRecordsService, SystemRecord } from '../../services/systemRecords.service';
import { useNavigate } from 'react-router-dom';

const TYPE_OPTIONS = [
    { value: '', label: '全部類別' },
    { value: '會費異動', label: '會費異動' },
    { value: '租金收款', label: '租金收款' },
    { value: '會員分潤', label: '會員分潤' }
];

const SystemRecords: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    const [records, setRecords] = useState<SystemRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('');
    const [year, setYear] = useState('');
    const [keyword, setKeyword] = useState('');
    const [showHidden, setShowHidden] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, record?: SystemRecord }>({ open: false });
    const [snackbar, setSnackbar] = useState<{ open: boolean, msg: string, severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' });

    // 權限檢查
    useEffect(() => {
        if (!isAdmin) {
            navigate('/services');
            return;
        }
        loadRecords();
    }, [isAdmin, navigate]);

    const loadRecords = async () => {
        if (!isAdmin) return;

        setLoading(true);
        try {
            const data = await systemRecordsService.getAllRecords();
            setRecords(data);
        } catch (error) {
            console.error('載入系統記錄失敗:', error);
            setSnackbar({ open: true, msg: '載入記錄失敗', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // 搜尋過濾
    const filtered = records.filter(r =>
        (showHidden || !r.hidden) &&
        (type ? r.type === type : true) &&
        (year ? String(r.year) === String(year) : true) &&
        (keyword ? (r.desc.includes(keyword) || String(r.amount).includes(keyword) || (r.memberName && r.memberName.includes(keyword)) || (r.investmentName && r.investmentName.includes(keyword))) : true)
    );

    // 獲取年份選項
    const yearOptions = [
        ...Array.from(new Set(records.map(r => r.year))).sort((a, b) => b - a).map(y => ({ value: y, label: y + ' 年' })),
        { value: '', label: '全部年份' }
    ];

    // 隱藏/顯示
    const handleToggleHidden = async (record: SystemRecord) => {
        try {
            const success = await systemRecordsService.toggleRecordVisibility(record.id, !record.hidden);
            if (success) {
                setRecords(rs => rs.map(r => r.id === record.id ? { ...r, hidden: !r.hidden } : r));
                setSnackbar({ open: true, msg: '已切換顯示狀態', severity: 'success' });
            } else {
                setSnackbar({ open: true, msg: '切換顯示狀態失敗', severity: 'error' });
            }
        } catch (error) {
            setSnackbar({ open: true, msg: '操作失敗', severity: 'error' });
        }
    };

    // 刪除
    const handleDelete = async (record: SystemRecord) => {
        try {
            const success = await systemRecordsService.deleteRecord(record.id);
            if (success) {
                setRecords(rs => rs.filter(r => r.id !== record.id));
                setSnackbar({ open: true, msg: '已刪除記錄', severity: 'success' });
            } else {
                setSnackbar({ open: true, msg: '刪除記錄失敗', severity: 'error' });
            }
        } catch (error) {
            setSnackbar({ open: true, msg: '刪除失敗', severity: 'error' });
        }
        setDeleteDialog({ open: false });
    };

    // 如果沒有權限，不顯示內容
    if (!isAdmin) {
        return null;
    }

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, background: 'linear-gradient(90deg,#1976d2,#f093fb)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> 系統記錄（金流記錄）
            </Typography>

            <Card sx={{ mb: 3, background: 'linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)', boxShadow: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>類別</InputLabel>
                                <Select value={type} label="類別" onChange={e => setType(e.target.value)} startAdornment={<FilterListIcon sx={{ mr: 1 }} />}>
                                    {TYPE_OPTIONS.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth>
                                <InputLabel>年份</InputLabel>
                                <Select value={year} label="年份" onChange={e => setYear(e.target.value)}>
                                    {yearOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField fullWidth label="關鍵字搜尋" value={keyword} onChange={e => setKeyword(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }} />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button variant={showHidden ? 'contained' : 'outlined'} color="secondary" fullWidth onClick={() => setShowHidden(v => !v)}>
                                {showHidden ? '顯示全部' : '顯示隱藏'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4 }}>
                    <Table>
                        <TableHead sx={{ background: 'linear-gradient(90deg,#1976d2,#f093fb)' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>日期</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>類別</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>說明</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>金額</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>狀態</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">查無資料</TableCell>
                                </TableRow>
                            )}
                            {filtered.map(row => (
                                <TableRow key={row.id} sx={{ opacity: row.hidden ? 0.5 : 1, background: row.hidden ? '#eee' : 'inherit' }}>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.type}
                                            color={row.type === '會費異動' ? 'primary' : row.type === '租金收款' ? 'success' : 'secondary'}
                                            icon={row.type === '會費異動' ? <WalletIcon /> : row.type === '租金收款' ? <PaidIcon /> : <ReceiptIcon />}
                                        />
                                    </TableCell>
                                    <TableCell>{row.desc}</TableCell>
                                    <TableCell sx={{ color: row.amount < 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>{row.amount.toLocaleString()}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell>
                                        <Tooltip title={row.hidden ? '顯示' : '隱藏'}>
                                            <IconButton color={row.hidden ? 'success' : 'default'} onClick={() => handleToggleHidden(row)}>
                                                {row.hidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="刪除">
                                            <IconButton color="error" onClick={() => setDeleteDialog({ open: true, record: row })}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* 刪除確認對話框 */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    確定要刪除此筆記錄嗎？刪除後無法復原。
                    {deleteDialog.record && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="body2">
                                <strong>記錄詳情：</strong><br />
                                類別：{deleteDialog.record.type}<br />
                                說明：{deleteDialog.record.desc}<br />
                                金額：{deleteDialog.record.amount.toLocaleString()}<br />
                                日期：{deleteDialog.record.date}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false })}>取消</Button>
                    <Button color="error" variant="contained" onClick={() => deleteDialog.record && handleDelete(deleteDialog.record)}>刪除</Button>
                </DialogActions>
            </Dialog>

            {/* 通知 */}
            <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
            </Snackbar>
        </Box>
    );
};

export default SystemRecords; 