import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Chip,
    TextField,
    SelectChangeEvent,
    Tooltip
} from '@mui/material';
import { Investment } from '../../../types/investment';
import { RentalPayment, MemberProfit, PaymentStatus } from '../../../types/rental';
import { ApiService } from '../../../services';
import { formatCurrency } from '../../../utils/format';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { DeleteOutline as DeleteOutlineIcon, WarningAmber as WarningIcon } from '@mui/icons-material';

interface HistoryTabProps {
    investments: Investment[];
}

interface YearlyStats {
    year: number;
    totalRental: number;
    collectedRental: number;
    totalProfit: number;
    paidProfit: number;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ investments }) => {
    const [rentalPayments, setRentalPayments] = useState<RentalPayment[]>([]);
    const [memberProfits, setMemberProfits] = useState<MemberProfit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [yearlyStats, setYearlyStats] = useState<YearlyStats[]>([]);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const [yearToClear, setYearToClear] = useState<number | null>(null);
    const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            console.log('歷史記錄 - 開始載入資料');
            // 載入所有年度的資料
            const years = Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i
            );
            console.log('歷史記錄 - 準備載入的年度:', years);

            const allPayments: RentalPayment[] = [];
            const allProfits: MemberProfit[] = [];

            // 依序載入每年的資料
            for (const year of years) {
                console.log(`歷史記錄 - 正在載入 ${year} 年度的資料`);
                try {
                    const [paymentsData, profitsData] = await Promise.all([
                        ApiService.getRentalPayments(undefined, year),
                        ApiService.getMemberProfits(undefined, undefined, year),
                    ]);
                    console.log(`歷史記錄 - ${year} 年度租金收款: ${paymentsData.length} 筆, 會員分潤: ${profitsData.length} 筆`);
                    allPayments.push(...paymentsData);
                    allProfits.push(...profitsData);
                } catch (yearErr) {
                    console.error(`歷史記錄 - 載入 ${year} 年度資料時出錯:`, yearErr);
                }
            }

            console.log(`歷史記錄 - 總共載入: 租金收款 ${allPayments.length} 筆, 會員分潤 ${allProfits.length} 筆`);
            setRentalPayments(allPayments);
            setMemberProfits(allProfits);

            // 計算年度統計
            const stats = years.map(year => {
                const yearPayments = allPayments.filter(p => p.year === year);
                const yearProfits = allProfits.filter(p => p.year === year);
                const paidPayments = yearPayments.filter(p => p.status === PaymentStatus.PAID);
                const paidProfits = yearProfits.filter(p => p.status === PaymentStatus.PAID);

                console.log(`歷史記錄 - ${year} 年度統計: 租金 ${yearPayments.length} 筆, 已收 ${paidPayments.length} 筆, 分潤 ${yearProfits.length} 筆, 已發放 ${paidProfits.length} 筆`);

                return {
                    year,
                    totalRental: yearPayments.reduce((sum, p) => sum + Number(p.amount), 0),
                    collectedRental: paidPayments.reduce((sum, p) => sum + Number(p.amount), 0),
                    totalProfit: yearProfits.reduce((sum, p) => sum + Number(p.amount), 0),
                    paidProfit: paidProfits.reduce((sum, p) => sum + Number(p.amount), 0),
                };
            });

            setYearlyStats(stats);
            setError(null);
        } catch (err) {
            setError('載入資料失敗');
            console.error('載入資料失敗:', err);
        } finally {
            setLoading(false);
            console.log('歷史記錄 - 資料載入完成');
        }
    };

    const getFilteredHistory = () => {
        const filteredPayments = rentalPayments
            .filter(payment =>
                payment.status === PaymentStatus.PAID &&
                (selectedYear === 'all' || payment.year === Number(selectedYear))
            )
            .map(payment => ({
                date: payment.paymentDate || payment.updatedAt,
                investmentId: payment.investmentId,
                type: '租金收款',
                amount: payment.amount,
                year: payment.year,
                month: payment.month,
            }));

        const filteredProfits = memberProfits
            .filter(profit =>
                profit.status === PaymentStatus.PAID &&
                (selectedYear === 'all' || profit.year === Number(selectedYear))
            )
            .map(profit => ({
                date: profit.paymentDate || profit.updatedAt,
                investmentId: profit.investmentId,
                type: '會員分潤',
                amount: profit.amount,
                year: profit.year,
                month: profit.month,
            }));

        return [...filteredPayments, ...filteredProfits]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const handleClearClick = () => {
        if (selectedYear === 'all') {
            enqueueSnackbar('請先選擇要清除的年度', { variant: 'warning' });
            return;
        }
        setYearToClear(Number(selectedYear));
        setClearConfirmOpen(true);
    };

    const handleClearConfirm = async () => {
        if (!yearToClear) return;

        setLoading(true);
        console.log(`開始清除 ${yearToClear} 年度的歷史資料`);

        try {
            // 使用直接清除本地存儲的方法
            console.log(`使用 purgeLocalStorage 清除 ${yearToClear} 年度的資料...`);
            try {
                await ApiService.purgeLocalStorage(yearToClear);
                console.log(`${yearToClear} 年度的數據已從本地存儲中清除`);
            } catch (purgeError) {
                console.error('使用 purgeLocalStorage 清除失敗，嘗試直接操作本地存儲:', purgeError);

                // 備用清除機制：直接操作本地存儲
                // 清除租金收款記錄
                try {
                    const storedPayments = localStorage.getItem('rentalPayments');
                    if (storedPayments) {
                        const allPayments = JSON.parse(storedPayments);
                        const filteredPayments = allPayments.filter((payment: any) => payment.year !== yearToClear);
                        console.log(`備用方法 - 租金收款：從 ${allPayments.length} 筆過濾到 ${filteredPayments.length} 筆`);
                        localStorage.setItem('rentalPayments', JSON.stringify(filteredPayments));
                    }
                } catch (e) {
                    console.error('備用方法 - 清除租金收款時出錯:', e);
                }

                // 清除會員分潤記錄
                try {
                    const storedProfits = localStorage.getItem('memberProfits');
                    if (storedProfits) {
                        const allProfits = JSON.parse(storedProfits);
                        const filteredProfits = allProfits.filter((profit: any) => profit.year !== yearToClear);
                        console.log(`備用方法 - 會員分潤：從 ${allProfits.length} 筆過濾到 ${filteredProfits.length} 筆`);
                        localStorage.setItem('memberProfits', JSON.stringify(filteredProfits));
                    }
                } catch (e) {
                    console.error('備用方法 - 清除會員分潤時出錯:', e);
                }

                console.log(`備用方法 - ${yearToClear} 年度的數據已從本地存儲中清除`);
            }

            // 重新載入資料
            console.log('重新載入資料...');
            await loadData();
            console.log('資料重新載入完成');

            // 清除選擇的年份和關閉對話框
            setYearToClear(null);
            setClearConfirmOpen(false);

            // 顯示成功通知
            enqueueSnackbar(`${yearToClear}年度的歷史記錄已清除`, { variant: 'success' });

            // 強制刷新頁面 (可以解決部分緩存問題)
            setTimeout(() => {
                console.log('使用路由導航...');
                window.location.href = '#/investment/history';
            }, 500);
        } catch (error) {
            console.error('清除資料失敗:', error);
            enqueueSnackbar('清除資料失敗', { variant: 'error' });
        } finally {
            setLoading(false);
            console.log(`${yearToClear} 年度的歷史記錄清除操作完成`);
        }
    };

    const handleYearFilterChange = (event: SelectChangeEvent<number>) => {
        setYearFilter(event.target.value as number);
    };

    const handleClearAllData = async () => {
        setLoading(true);
        try {
            // 清除所有本地存儲資料
            localStorage.removeItem('investments');
            localStorage.removeItem('rentalStandards');
            localStorage.removeItem('rentalPayments');
            localStorage.removeItem('memberProfits');
            localStorage.removeItem('profitSharingStandards');

            // 刷新本地緩存
            await ApiService.getInvestments();

            enqueueSnackbar('所有資料已清除', { variant: 'success' });

            // 延遲重新載入頁面
            setTimeout(() => {
                console.log('使用路由導航...');
                window.location.href = '#/investment/history';
            }, 500);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '未知錯誤';
            console.error('清除資料失敗:', errorMsg);
            enqueueSnackbar(`清除資料失敗: ${errorMsg}`, { variant: 'error' });
            setError(`清除資料失敗: ${errorMsg}`);
        } finally {
            setLoading(false);
            setConfirmClearDialogOpen(false);
            setConfirmText('');
        }
    };

    const handleClearHistoryData = async () => {
        if (!yearFilter) {
            enqueueSnackbar('請選擇要清除的年度', { variant: 'error' });
            return;
        }

        setLoading(true);
        try {
            // 清除指定年度的租金收款和分潤資料
            const rentalPayments = await ApiService.getRentalPayments();
            const memberProfits = await ApiService.getMemberProfits();

            // 過濾出非選定年度的資料
            const filteredRentalPayments = rentalPayments.filter(p => p.year !== yearFilter);
            const filteredMemberProfits = memberProfits.filter(p => p.year !== yearFilter);

            // 保存到本地存儲
            localStorage.setItem('rentalPayments', JSON.stringify(filteredRentalPayments));
            localStorage.setItem('memberProfits', JSON.stringify(filteredMemberProfits));

            enqueueSnackbar(`${yearFilter} 年度的租金收款和分潤資料已清除`, { variant: 'success' });

            // 延遲重新載入頁面
            setTimeout(() => {
                console.log('使用路由導航...');
                window.location.href = '#/investment/history';
            }, 500);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '未知錯誤';
            console.error('清除歷史資料失敗:', errorMsg);
            enqueueSnackbar(`清除歷史資料失敗: ${errorMsg}`, { variant: 'error' });
            setError(`清除歷史資料失敗: ${errorMsg}`);
        } finally {
            setLoading(false);
            handleCloseDialog();
        }
    };

    const handleCloseDialog = () => {
        setClearDialogOpen(false);
    };

    const handleConfirmClick = () => {
        setClearDialogOpen(false);
        setConfirmClearDialogOpen(true);
    };

    const handleCloseConfirmDialog = () => {
        setConfirmClearDialogOpen(false);
        setConfirmText('');
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    const history = getFilteredHistory();

    return (
        <Box>
            {/* 年度篩選 */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>投資歷史記錄</Typography>
                <FormControl sx={{ minWidth: 120, mr: 2 }}>
                    <InputLabel id="year-select-label">年度</InputLabel>
                    <Select
                        labelId="year-select-label"
                        id="year-select"
                        name="year-select"
                        value={selectedYear}
                        label="年度"
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <MenuItem value="all">全部</MenuItem>
                        {yearlyStats.map((stat) => (
                            <MenuItem key={stat.year} value={stat.year.toString()}>
                                {stat.year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleClearClick}
                    id="clear-history-btn"
                    aria-label="清除歷史資料"
                >
                    清除歷史資料
                </Button>
            </Box>

            {/* 儀表板 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {yearlyStats.map((stat) => (
                    <Grid item xs={12} md={4} key={stat.year}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {stat.year} 年度統計
                                </Typography>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>已收租金</TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(stat.collectedRental)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>已發放分潤</TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(stat.paidProfit)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>淨收入</TableCell>
                                            <TableCell align="right">
                                                {formatCurrency(stat.collectedRental - stat.paidProfit)}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* 歷史記錄列表 */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>日期</TableCell>
                            <TableCell>投資項目</TableCell>
                            <TableCell>年月</TableCell>
                            <TableCell>類型</TableCell>
                            <TableCell align="right">金額</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.map((record, index) => {
                            const investment = investments.find(i => i.id === record.investmentId);
                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        {new Date(record.date).toLocaleDateString('zh-TW')}
                                    </TableCell>
                                    <TableCell>{investment?.name || '未知項目'}</TableCell>
                                    <TableCell>{`${record.year}年${record.month}月`}</TableCell>
                                    <TableCell>{record.type}</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(record.amount)}
                                    </TableCell>
                                </TableRow>
                            )
                        }
                        )}
                        {history.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    尚無歷史記錄
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 清除確認對話框 */}
            <Dialog
                open={clearConfirmOpen}
                onClose={() => setClearConfirmOpen(false)}
            >
                <DialogTitle>確認清除歷史資料</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        您確定要清除 {yearToClear} 年度的所有歷史資料嗎？此操作將刪除所有租金收款和會員分潤記錄，且無法恢復。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearConfirmOpen(false)}>取消</Button>
                    <Button onClick={handleClearConfirm} color="error" variant="contained">
                        確認清除
                    </Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>選擇年度</InputLabel>
                        <Select
                            value={yearFilter}
                            onChange={handleYearFilterChange}
                            label="選擇年度"
                        >
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={handleClearClick}
                        fullWidth
                        sx={{ height: '100%' }}
                    >
                        清除歷史資料
                    </Button>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <Tooltip title="警告：此操作將清除所有投資、租金、分潤資料！僅用於測試環境">
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setConfirmClearDialogOpen(true)}
                            fullWidth
                            sx={{ height: '100%' }}
                            startIcon={<WarningIcon />}
                        >
                            清除所有資料
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>

            <Dialog open={clearDialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>確認清除歷史資料</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        確定要清除 {yearFilter} 年度的所有歷史資料嗎？此操作無法撤消。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>取消</Button>
                    <Button onClick={handleConfirmClick} color="warning">確認清除</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmClearDialogOpen} onClose={handleCloseConfirmDialog}>
                <DialogTitle>危險操作確認</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        <WarningIcon color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        此操作將清除所有投資項目、租金收款、分潤資料等系統數據，且無法恢復！
                    </DialogContentText>
                    <DialogContentText sx={{ mb: 2 }}>
                        請輸入「確認清除」並點擊確認按鈕以繼續操作：
                    </DialogContentText>
                    <TextField
                        fullWidth
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="確認清除"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog}>取消</Button>
                    <Button
                        onClick={handleClearAllData}
                        color="error"
                        disabled={confirmText !== '確認清除'}
                    >
                        確認清除所有資料
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HistoryTab; 