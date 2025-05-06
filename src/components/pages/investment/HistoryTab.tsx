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
    DialogTitle
} from '@mui/material';
import { Investment } from '../../../types/investment';
import { RentalPayment, MemberProfit, PaymentStatus } from '../../../types/rental';
import { ApiService } from '../../../services';
import { formatCurrency } from '../../../utils/format';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';

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
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // 載入所有年度的資料
            const years = Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i
            );

            const allPayments: RentalPayment[] = [];
            const allProfits: MemberProfit[] = [];

            // 依序載入每年的資料
            for (const year of years) {
                const [paymentsData, profitsData] = await Promise.all([
                    ApiService.getRentalPayments(undefined, year),
                    ApiService.getMemberProfits(undefined, undefined, year),
                ]);
                allPayments.push(...paymentsData);
                allProfits.push(...profitsData);
            }

            setRentalPayments(allPayments);
            setMemberProfits(allProfits);

            // 計算年度統計
            const stats = years.map(year => ({
                year,
                totalRental: allPayments
                    .filter(p => p.year === year)
                    .reduce((sum, p) => sum + Number(p.amount), 0),
                collectedRental: allPayments
                    .filter(p => p.year === year && p.status === PaymentStatus.PAID)
                    .reduce((sum, p) => sum + Number(p.amount), 0),
                totalProfit: allProfits
                    .filter(p => p.year === year)
                    .reduce((sum, p) => sum + Number(p.amount), 0),
                paidProfit: allProfits
                    .filter(p => p.year === year && p.status === PaymentStatus.PAID)
                    .reduce((sum, p) => sum + Number(p.amount), 0),
            }));

            setYearlyStats(stats);
            setError(null);
        } catch (err) {
            setError('載入資料失敗');
            console.error('載入資料失敗:', err);
        } finally {
            setLoading(false);
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
        try {
            // 清除租金收款記錄
            await ApiService.clearRentalPayments(yearToClear);

            // 清除分潤記錄，傳入年份參數
            await ApiService.clearMemberProfits(yearToClear);

            // 重新載入資料
            await loadData();

            // 清除選擇的年份和關閉對話框
            setYearToClear(null);
            setClearConfirmOpen(false);

            // 顯示成功通知
            enqueueSnackbar(`${yearToClear}年度的歷史記錄已清除`, { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('清除資料失敗', { variant: 'error' });
            console.error('清除資料失敗:', error);
        } finally {
            setLoading(false);
        }
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
        </Box>
    );
};

export default HistoryTab; 