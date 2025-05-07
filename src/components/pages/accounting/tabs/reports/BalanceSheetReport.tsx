import React from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Divider
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PieController
} from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

// 註冊 ChartJS 組件
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PieController,
    Title,
    Tooltip,
    Legend
);

interface BalanceSheetReportProps {
    data: any;
}

const BalanceSheetReport: React.FC<BalanceSheetReportProps> = ({ data }) => {
    // 計算百分比
    const calculatePercentage = (amount: number, total: number) => {
        if (!total) return 0;
        return ((amount / total) * 100).toFixed(1);
    };

    // 準備資產餅圖數據
    const prepareAssetsPieData = () => {
        const currentAssets = data.assets.currentAssets.total;
        const nonCurrentAssets = data.assets.nonCurrentAssets.total;

        return {
            labels: ['流動資產', '非流動資產'],
            datasets: [
                {
                    data: [currentAssets, nonCurrentAssets],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };

    // 準備負債和權益餅圖數據
    const prepareLiabilitiesEquityPieData = () => {
        const totalLiabilities = data.liabilities.totalLiabilities;
        const totalEquity = data.equity.totalEquity;

        return {
            labels: ['負債', '權益'],
            datasets: [
                {
                    data: [totalLiabilities, totalEquity],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };

    // 準備流動資產明細
    const prepareCurrentAssetsData = () => {
        const { cash, accountsReceivable, inventory, ...rest } = data.assets.currentAssets;
        const otherAssets = Object.values(rest).reduce((sum: number, value: any) => {
            return typeof value === 'number' ? sum + value : sum;
        }, 0) - data.assets.currentAssets.total;

        return {
            labels: ['現金', '應收帳款', '庫存', '其他流動資產'],
            datasets: [
                {
                    data: [cash, accountsReceivable, inventory, otherAssets > 0 ? otherAssets : 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };

    return (
        <Box>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        資產負債表 - {data.date}
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">總資產</Typography>
                            <Typography variant="h4" color="primary.main">
                                {data.assets.totalAssets.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">總負債</Typography>
                            <Typography variant="h4" color="error.main">
                                {data.liabilities.totalLiabilities.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">總權益</Typography>
                            <Typography variant="h4" color="success.main">
                                {data.equity.totalEquity.toLocaleString()} 元
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* 總覽圖表 */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>資產組成</Typography>
                            <Box sx={{ height: 300 }}>
                                <Pie data={prepareAssetsPieData()} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                        }
                                    }
                                }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>負債與權益</Typography>
                            <Box sx={{ height: 300 }}>
                                <Pie data={prepareLiabilitiesEquityPieData()} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                        }
                                    }
                                }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 資產明細 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>資產明細</Typography>
                            <TableContainer component={Paper} elevation={0}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                <Typography variant="subtitle1">流動資產</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>現金</TableCell>
                                            <TableCell align="right">{data.assets.currentAssets.cash.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.assets.currentAssets.cash, data.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>應收帳款</TableCell>
                                            <TableCell align="right">{data.assets.currentAssets.accountsReceivable.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.assets.currentAssets.accountsReceivable, data.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>庫存</TableCell>
                                            <TableCell align="right">{data.assets.currentAssets.inventory.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.assets.currentAssets.inventory, data.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>流動資產合計</strong></TableCell>
                                            <TableCell align="right"><strong>{data.assets.currentAssets.total.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(data.assets.currentAssets.total, data.assets.totalAssets)}%</strong>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                <Typography variant="subtitle1">非流動資產</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>房產</TableCell>
                                            <TableCell align="right">{data.assets.nonCurrentAssets.property.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.assets.nonCurrentAssets.property, data.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>設備</TableCell>
                                            <TableCell align="right">{data.assets.nonCurrentAssets.equipment.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.assets.nonCurrentAssets.equipment, data.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>投資</TableCell>
                                            <TableCell align="right">{data.assets.nonCurrentAssets.investments.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.assets.nonCurrentAssets.investments, data.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>非流動資產合計</strong></TableCell>
                                            <TableCell align="right"><strong>{data.assets.nonCurrentAssets.total.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(data.assets.nonCurrentAssets.total, data.assets.totalAssets)}%</strong>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>資產總計</strong></TableCell>
                                            <TableCell align="right"><strong>{data.assets.totalAssets.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right"><strong>100%</strong></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 負債與權益明細 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>負債與權益明細</Typography>
                            <TableContainer component={Paper} elevation={0}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                <Typography variant="subtitle1">流動負債</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>應付帳款</TableCell>
                                            <TableCell align="right">{data.liabilities.currentLiabilities.accountsPayable.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.liabilities.currentLiabilities.accountsPayable, data.liabilities.totalLiabilities + data.equity.totalEquity)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>短期借款</TableCell>
                                            <TableCell align="right">{data.liabilities.currentLiabilities.shortTermLoans.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.liabilities.currentLiabilities.shortTermLoans, data.liabilities.totalLiabilities + data.equity.totalEquity)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>流動負債合計</strong></TableCell>
                                            <TableCell align="right"><strong>{data.liabilities.currentLiabilities.total.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(data.liabilities.currentLiabilities.total, data.liabilities.totalLiabilities + data.equity.totalEquity)}%</strong>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                <Typography variant="subtitle1">非流動負債</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>長期借款</TableCell>
                                            <TableCell align="right">{data.liabilities.nonCurrentLiabilities.longTermLoans.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.liabilities.nonCurrentLiabilities.longTermLoans, data.liabilities.totalLiabilities + data.equity.totalEquity)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>非流動負債合計</strong></TableCell>
                                            <TableCell align="right"><strong>{data.liabilities.nonCurrentLiabilities.total.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(data.liabilities.nonCurrentLiabilities.total, data.liabilities.totalLiabilities + data.equity.totalEquity)}%</strong>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>負債總計</strong></TableCell>
                                            <TableCell align="right"><strong>{data.liabilities.totalLiabilities.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(data.liabilities.totalLiabilities, data.liabilities.totalLiabilities + data.equity.totalEquity)}%</strong>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                <Typography variant="subtitle1">權益</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>資本</TableCell>
                                            <TableCell align="right">{data.equity.capital.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.equity.capital, data.liabilities.totalLiabilities + data.equity.totalEquity)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>保留盈餘</TableCell>
                                            <TableCell align="right">{data.equity.retainedEarnings.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(data.equity.retainedEarnings, data.liabilities.totalLiabilities + data.equity.totalEquity)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>權益總計</strong></TableCell>
                                            <TableCell align="right"><strong>{data.equity.totalEquity.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(data.equity.totalEquity, data.liabilities.totalLiabilities + data.equity.totalEquity)}%</strong>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>負債及權益總計</strong></TableCell>
                                            <TableCell align="right"><strong>{(data.liabilities.totalLiabilities + data.equity.totalEquity).toLocaleString()}</strong></TableCell>
                                            <TableCell align="right"><strong>100%</strong></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BalanceSheetReport; 