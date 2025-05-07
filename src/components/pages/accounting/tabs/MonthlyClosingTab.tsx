import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Typography,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    CircularProgress,
    Card,
    CardContent,
    Divider,
    Stack
} from '@mui/material';
import {
    Add as AddIcon,
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    InsertDriveFile as InsertDriveFileIcon,
    AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { MonthlyClosing } from '../../../../types/payment';
import { accountingService } from '../../../../services/accounting.service';

const MonthlyClosingTab: React.FC = () => {
    // 狀態變數
    const [monthlyClosings, setMonthlyClosings] = useState<MonthlyClosing[]>([]);
    const [loading, setLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedMonthlyClosing, setSelectedMonthlyClosing] = useState<MonthlyClosing | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState<any>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    // 生成所有可選月份
    const availableMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    // 計算已執行月結的月份，避免重複
    const completedMonths = monthlyClosings
        .filter(closing => closing.year === yearFilter)
        .map(closing => closing.month);

    // 可選月份為那些尚未完成月結的月份
    const selectableMonths = availableMonths.filter(month => !completedMonths.includes(month));

    // 載入資料
    useEffect(() => {
        loadMonthlyClosings();
    }, []);

    const loadMonthlyClosings = async () => {
        setLoading(true);
        try {
            const data = await accountingService.getMonthlyClosings();
            setMonthlyClosings(data);
        } catch (error) {
            console.error('獲取月結記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '獲取月結記錄失敗',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // 依年份過濾月結記錄
    const filteredClosings = monthlyClosings.filter(closing => closing.year === yearFilter);

    // 處理建立月結對話框
    const handleOpenCreateDialog = () => {
        // 默認選擇第一個可選月份
        if (selectableMonths.length > 0) {
            setSelectedMonth(selectableMonths[0]);
        }
        setCreateDialogOpen(true);
    };

    const handleCloseCreateDialog = () => {
        setCreateDialogOpen(false);
    };

    // 處理月結詳情對話框
    const handleOpenDetailDialog = async (monthlyClosing: MonthlyClosing) => {
        setSelectedMonthlyClosing(monthlyClosing);
        setDetailLoading(true);
        setDetailDialogOpen(true);

        try {
            // 獲取月結詳情
            const detail = await accountingService.getMonthlyClosingDetail(monthlyClosing.id);
            setDetailData(detail);
        } catch (error) {
            console.error('獲取月結詳情失敗:', error);
            setSnackbar({
                open: true,
                message: '獲取月結詳情失敗',
                severity: 'error'
            });
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetailDialog = () => {
        setDetailDialogOpen(false);
        setSelectedMonthlyClosing(null);
        setDetailData(null);
    };

    // 處理確認對話框
    const handleOpenConfirmDialog = (monthlyClosing: MonthlyClosing) => {
        setSelectedMonthlyClosing(monthlyClosing);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
    };

    // 建立月結
    const handleCreateMonthlyClosing = async () => {
        try {
            const newClosing = await accountingService.createMonthlyClosing({
                year: yearFilter,
                month: selectedMonth
            });

            setMonthlyClosings(prev => [...prev, newClosing]);
            setSnackbar({
                open: true,
                message: '月結記錄已建立',
                severity: 'success'
            });
            handleCloseCreateDialog();
        } catch (error) {
            console.error('建立月結記錄失敗:', error);
            setSnackbar({
                open: true,
                message: '建立月結記錄失敗',
                severity: 'error'
            });
        }
    };

    // 確認月結
    const handleFinalizeMonthlyClosing = async () => {
        if (!selectedMonthlyClosing) return;

        try {
            const finalizedClosing = await accountingService.finalizeMonthlyClosing(selectedMonthlyClosing.id);

            setMonthlyClosings(prev =>
                prev.map(closing =>
                    closing.id === finalizedClosing.id ? finalizedClosing : closing
                )
            );

            setSnackbar({
                open: true,
                message: '月結已確認',
                severity: 'success'
            });

            handleCloseConfirmDialog();
        } catch (error) {
            console.error('確認月結失敗:', error);
            setSnackbar({
                open: true,
                message: '確認月結失敗',
                severity: 'error'
            });
        }
    };

    // 获取月份名称
    const getMonthName = (month: number) => {
        const monthNames = [
            '一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月'
        ];
        return monthNames[month - 1];
    };

    // 渲染內容
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">月結管理</Typography>
                <Box>
                    <FormControl sx={{ minWidth: 120, mr: 2 }}>
                        <InputLabel>年度</InputLabel>
                        <Select
                            value={yearFilter}
                            label="年度"
                            onChange={(e) => setYearFilter(Number(e.target.value))}
                        >
                            {Array.from({ length: 5 }, (_, i) => yearFilter - 2 + i).map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                        disabled={selectableMonths.length === 0}
                    >
                        建立月結
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                已處理月結報表數
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {filteredClosings.length} / 12
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {yearFilter}年度
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                已確認月結數
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {filteredClosings.filter(c => c.status === 'finalized').length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {yearFilter}年度
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                待確認月結數
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {filteredClosings.filter(c => c.status === 'pending').length}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {yearFilter}年度
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>年度</TableCell>
                                <TableCell>月份</TableCell>
                                <TableCell align="right">收入總額</TableCell>
                                <TableCell align="right">支出總額</TableCell>
                                <TableCell align="right">淨額</TableCell>
                                <TableCell>狀態</TableCell>
                                <TableCell>月結日期</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredClosings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        尚無月結記錄
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClosings.map(closing => (
                                    <TableRow key={closing.id}>
                                        <TableCell>{closing.year}</TableCell>
                                        <TableCell>{getMonthName(closing.month)}</TableCell>
                                        <TableCell align="right" sx={{ color: 'success.main' }}>
                                            {closing.totalIncome.toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'error.main' }}>
                                            {closing.totalExpense.toLocaleString()}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: closing.netAmount >= 0 ? 'success.main' : 'error.main'
                                            }}
                                        >
                                            {closing.netAmount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={closing.status === 'finalized' ? '已確認' : '處理中'}
                                                color={closing.status === 'finalized' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {closing.closingDate ? dayjs(closing.closingDate).format('YYYY/MM/DD') : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDetailDialog(closing)}
                                                title="查看詳情"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                            {closing.status === 'pending' && (
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleOpenConfirmDialog(closing)}
                                                    title="確認月結"
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* 建立月結對話框 */}
            <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="xs" fullWidth>
                <DialogTitle>建立月結</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                將為以下月份建立月結：
                            </Typography>
                            <FormControl fullWidth sx={{ mt: 1 }}>
                                <InputLabel>月份</InputLabel>
                                <Select
                                    value={selectedMonth}
                                    label="月份"
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                >
                                    {selectableMonths.map(month => (
                                        <MenuItem key={month} value={month}>
                                            {getMonthName(month)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2" color="textSecondary">
                                注意：建立月結後將計算該月所有收入與支出，形成月結報表。
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateDialog}>取消</Button>
                    <Button
                        onClick={handleCreateMonthlyClosing}
                        variant="contained"
                        color="primary"
                        disabled={!selectedMonth}
                    >
                        建立
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 月結詳情對話框 */}
            <Dialog open={detailDialogOpen} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    月結詳情 - {selectedMonthlyClosing?.year}年{getMonthName(selectedMonthlyClosing?.month || 1)}
                </DialogTitle>
                <DialogContent dividers>
                    {detailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : selectedMonthlyClosing ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="h6">財務摘要</Typography>
                                            <Chip
                                                label={selectedMonthlyClosing.status === 'finalized' ? '已確認' : '處理中'}
                                                color={selectedMonthlyClosing.status === 'finalized' ? 'success' : 'warning'}
                                            />
                                        </Stack>
                                        <Divider sx={{ my: 2 }} />
                                        <Grid container spacing={2}>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">收入總額</Typography>
                                                <Typography variant="h6" color="success.main">
                                                    {selectedMonthlyClosing.totalIncome.toLocaleString()}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">支出總額</Typography>
                                                <Typography variant="h6" color="error.main">
                                                    {selectedMonthlyClosing.totalExpense.toLocaleString()}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" color="textSecondary">淨額</Typography>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: selectedMonthlyClosing.netAmount >= 0
                                                            ? 'success.main'
                                                            : 'error.main'
                                                    }}
                                                >
                                                    {selectedMonthlyClosing.netAmount.toLocaleString()}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* 以下渲染收入和支出的詳細分類數據，假設detailData有這些信息 */}
                            {detailData && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ mb: 2 }}>收入明細</Typography>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>類別</TableCell>
                                                            <TableCell align="right">金額</TableCell>
                                                            <TableCell align="right">占比</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {detailData.incomeByCategory?.map((item: any) => (
                                                            <TableRow key={item.category}>
                                                                <TableCell>{item.category}</TableCell>
                                                                <TableCell align="right">{item.amount.toLocaleString()}</TableCell>
                                                                <TableCell align="right">
                                                                    {(item.amount / selectedMonthlyClosing.totalIncome * 100).toFixed(1)}%
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ mb: 2 }}>支出明細</Typography>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>類別</TableCell>
                                                            <TableCell align="right">金額</TableCell>
                                                            <TableCell align="right">占比</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {detailData.expenseByCategory?.map((item: any) => (
                                                            <TableRow key={item.category}>
                                                                <TableCell>{item.category}</TableCell>
                                                                <TableCell align="right">{item.amount.toLocaleString()}</TableCell>
                                                                <TableCell align="right">
                                                                    {(item.amount / selectedMonthlyClosing.totalExpense * 100).toFixed(1)}%
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </>
                            )}

                            {/* 如果月結已確認，顯示確認信息 */}
                            {selectedMonthlyClosing.status === 'finalized' && (
                                <Grid item xs={12}>
                                    <Alert severity="info">
                                        本月結已於 {dayjs(selectedMonthlyClosing.closingDate).format('YYYY/MM/DD HH:mm')} 確認完成
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>
                    ) : (
                        <Typography>無法載入月結詳情</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    {selectedMonthlyClosing?.status === 'pending' && (
                        <Button
                            onClick={() => {
                                handleCloseDetailDialog();
                                handleOpenConfirmDialog(selectedMonthlyClosing);
                            }}
                            color="success"
                            startIcon={<CheckCircleIcon />}
                        >
                            確認月結
                        </Button>
                    )}
                    <Button onClick={handleCloseDetailDialog}>關閉</Button>
                </DialogActions>
            </Dialog>

            {/* 確認月結對話框 */}
            <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog} maxWidth="xs" fullWidth>
                <DialogTitle>確認月結</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        確定要確認 {selectedMonthlyClosing?.year}年{getMonthName(selectedMonthlyClosing?.month || 1)} 的月結嗎？
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        確認後，該月的財務記錄將被鎖定，無法再進行修改。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog}>取消</Button>
                    <Button onClick={handleFinalizeMonthlyClosing} variant="contained" color="primary">
                        確認
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 通知訊息 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MonthlyClosingTab; 