import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { Investment } from '../../../types/investment';
import { RentalPayment, MemberProfit, PaymentStatus } from '../../../types/rental';
import { ApiService } from '../../../services';
import { formatCurrency } from '../../../utils/format';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';

interface ReportTabProps {
    investments: Investment[];
}

const ReportTab: React.FC<ReportTabProps> = ({ investments }) => {
    const [rentalPayments, setRentalPayments] = useState<RentalPayment[]>([]);
    const [memberProfits, setMemberProfits] = useState<MemberProfit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        loadData();
    }, [filterYear]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [investmentsData, paymentsData, profitsData] = await Promise.all([
                ApiService.getInvestments(),
                ApiService.getRentalPayments(undefined, filterYear),
                ApiService.getMemberProfits(undefined, undefined, filterYear),
            ]);

            console.log('統計報表載入資料:', {
                filterYear,
                paymentsData: paymentsData.length,
                profitsData: profitsData.length,
                samplePayment: paymentsData[0],
                sampleProfit: profitsData[0]
            });

            setRentalPayments(paymentsData);
            setMemberProfits(profitsData);
        } catch (err) {
            console.error('統計報表載入資料失敗:', err);
            setError('載入資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const calculateRentalStats = () => {
        console.log('計算租金統計，資料:', {
            filterYear,
            rentalPaymentsCount: rentalPayments.length,
            rentalPayments: rentalPayments.map(p => ({ id: p.id, year: p.year, amount: p.amount, status: p.status }))
        });

        const totalRental = rentalPayments.reduce((sum, payment) => {
            if (payment.year === filterYear) {
                return sum + Number(payment.amount);
            }
            return sum;
        }, 0);

        const collectedRental = rentalPayments
            .filter(payment =>
                payment.status === PaymentStatus.PAID &&
                payment.year === filterYear
            )
            .reduce((sum, payment) => sum + Number(payment.amount), 0);

        const pendingRental = rentalPayments
            .filter(payment =>
                payment.status === PaymentStatus.PENDING &&
                payment.year === filterYear
            )
            .reduce((sum, payment) => sum + Number(payment.amount), 0);

        const overdueRental = rentalPayments
            .filter(payment =>
                payment.status === PaymentStatus.OVERDUE &&
                payment.year === filterYear
            )
            .reduce((sum, payment) => sum + Number(payment.amount), 0);

        const stats = { totalRental, collectedRental, pendingRental, overdueRental };
        console.log('租金統計結果:', stats);
        return stats;
    };

    const calculateProfitStats = () => {
        const totalProfit = memberProfits.reduce((sum, profit) => {
            if (profit.year === filterYear) {
                return sum + Number(profit.amount);
            }
            return sum;
        }, 0);

        const paidProfit = memberProfits
            .filter(profit =>
                profit.status === PaymentStatus.PAID &&
                profit.year === filterYear
            )
            .reduce((sum, profit) => sum + Number(profit.amount), 0);

        const pendingProfit = memberProfits
            .filter(profit =>
                profit.status === PaymentStatus.PENDING &&
                profit.year === filterYear
            )
            .reduce((sum, profit) => sum + Number(profit.amount), 0);

        const overdueProfit = memberProfits
            .filter(profit =>
                profit.status === PaymentStatus.OVERDUE &&
                profit.year === filterYear
            )
            .reduce((sum, profit) => sum + Number(profit.amount), 0);

        return { totalProfit, paidProfit, pendingProfit, overdueProfit };
    };

    const calculateInvestmentStats = () => {
        return investments.map(investment => {
            const investmentRentals = rentalPayments.filter(payment =>
                payment.investmentId === investment.id &&
                payment.year === filterYear
            );

            const investmentProfits = memberProfits.filter(profit =>
                profit.investmentId === investment.id &&
                profit.year === filterYear
            );

            const totalRental = investmentRentals.reduce((sum, payment) => sum + Number(payment.amount), 0);
            const collectedRental = investmentRentals
                .filter(payment => payment.status === PaymentStatus.PAID)
                .reduce((sum, payment) => sum + Number(payment.amount), 0);

            const totalProfit = investmentProfits.reduce((sum, profit) => sum + Number(profit.amount), 0);
            const paidProfit = investmentProfits
                .filter(profit => profit.status === PaymentStatus.PAID)
                .reduce((sum, profit) => sum + Number(profit.amount), 0);

            const netIncome = collectedRental - paidProfit;

            return {
                investment,
                totalRental,
                collectedRental,
                totalProfit,
                paidProfit,
                netIncome,
            };
        });
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    const rentalStats = calculateRentalStats();
    const profitStats = calculateProfitStats();
    const investmentStats = calculateInvestmentStats();

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>統計報表</Typography>
                <FormControl sx={{ minWidth: 100 }}>
                    <InputLabel>年度</InputLabel>
                    <Select
                        value={filterYear.toString()}
                        label="年度"
                        onChange={(e) => setFilterYear(Number(e.target.value))}
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>租金收款統計</Typography>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell>總租金</TableCell>
                                    <TableCell align="right">{formatCurrency(rentalStats.totalRental)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>已收款</TableCell>
                                    <TableCell align="right">{formatCurrency(rentalStats.collectedRental)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>待收款</TableCell>
                                    <TableCell align="right">{formatCurrency(rentalStats.pendingRental)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>逾期未收</TableCell>
                                    <TableCell align="right">{formatCurrency(rentalStats.overdueRental)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>會員分潤統計</Typography>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell>總分潤</TableCell>
                                    <TableCell align="right">{formatCurrency(profitStats.totalProfit)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>已發放</TableCell>
                                    <TableCell align="right">{formatCurrency(profitStats.paidProfit)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>待發放</TableCell>
                                    <TableCell align="right">{formatCurrency(profitStats.pendingProfit)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>逾期未發</TableCell>
                                    <TableCell align="right">{formatCurrency(profitStats.overdueProfit)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ mt: 2 }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>投資項目</TableCell>
                                        <TableCell align="right">總租金</TableCell>
                                        <TableCell align="right">已收租金</TableCell>
                                        <TableCell align="right">總分潤</TableCell>
                                        <TableCell align="right">已發放分潤</TableCell>
                                        <TableCell align="right">淨收入</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {investmentStats.map((stats) => (
                                        <TableRow key={stats.investment.id}>
                                            <TableCell>{stats.investment.name}</TableCell>
                                            <TableCell align="right">{formatCurrency(stats.totalRental)}</TableCell>
                                            <TableCell align="right">{formatCurrency(stats.collectedRental)}</TableCell>
                                            <TableCell align="right">{formatCurrency(stats.totalProfit)}</TableCell>
                                            <TableCell align="right">{formatCurrency(stats.paidProfit)}</TableCell>
                                            <TableCell align="right">{formatCurrency(stats.netIncome)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>總計</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(investmentStats.reduce((sum, stats) => sum + stats.totalRental, 0))}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(investmentStats.reduce((sum, stats) => sum + stats.collectedRental, 0))}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(investmentStats.reduce((sum, stats) => sum + stats.totalProfit, 0))}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(investmentStats.reduce((sum, stats) => sum + stats.paidProfit, 0))}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(investmentStats.reduce((sum, stats) => sum + stats.netIncome, 0))}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReportTab; 