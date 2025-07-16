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
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// 註冊 ChartJS 組件
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface IncomeExpenseReportProps {
    data: any;
}

const IncomeExpenseReport: React.FC<IncomeExpenseReportProps> = ({ data }) => {
    // 從 API 資料中提取收入和費用資料
    const revenue = data.revenue || { items: [], total: 0 };
    const expenses = data.expenses || { items: [], total: 0 };
    const netIncome = data.netIncome || 0;
    const period = data.period || {};

    // 處理圖表數據
    const prepareBarChartData = () => {
        return {
            labels: ['收入', '費用', '淨利'],
            datasets: [
                {
                    data: [revenue.total, expenses.total, netIncome],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        netIncome >= 0
                            ? 'rgba(54, 162, 235, 0.6)'
                            : 'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        netIncome >= 0
                            ? 'rgba(54, 162, 235, 1)'
                            : 'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };

    // 收入分析的餅圖數據
    const prepareRevenuePieChartData = () => {
        return {
            labels: revenue.items.map((item: any) => item.account_name),
            datasets: [
                {
                    data: revenue.items.map((item: any) => Math.abs(parseFloat(item.balance))),
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 99, 132, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };

    // 費用分析的餅圖數據
    const prepareExpensePieChartData = () => {
        return {
            labels: expenses.items.map((item: any) => item.account_name),
            datasets: [
                {
                    data: expenses.items.map((item: any) => Math.abs(parseFloat(item.balance))),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };

    // 計算百分比
    const calculatePercentage = (amount: number, total: number) => {
        if (!total) return 0;
        return ((amount / total) * 100).toFixed(1);
    };

    return (
        <Box>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {period.startDate && period.endDate ?
                            `${period.startDate} 至 ${period.endDate} 損益表` :
                            '損益表'
                        }
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">總收入</Typography>
                            <Typography variant="h4" color="success.main">
                                {revenue.total.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">總費用</Typography>
                            <Typography variant="h4" color="error.main">
                                {expenses.total.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">淨利</Typography>
                            <Typography
                                variant="h4"
                                color={netIncome >= 0 ? "success.main" : "error.main"}
                            >
                                {netIncome.toLocaleString()} 元
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>損益對比</Typography>
                            <Box sx={{ height: 300 }}>
                                <Bar data={prepareBarChartData()} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: false
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
                            <Typography variant="h6" gutterBottom>收入分析</Typography>
                            {revenue.items && revenue.items.length > 0 ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ height: 240 }}>
                                            <Pie data={prepareRevenuePieChartData()} options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'right',
                                                    }
                                                }
                                            }} />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>科目</TableCell>
                                                        <TableCell align="right">金額</TableCell>
                                                        <TableCell align="right">百分比</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {revenue.items.map((item: any) => (
                                                        <TableRow key={item.account_code}>
                                                            <TableCell>{item.account_name}</TableCell>
                                                            <TableCell align="right">{Math.abs(parseFloat(item.balance)).toLocaleString()}</TableCell>
                                                            <TableCell align="right">
                                                                {calculatePercentage(Math.abs(parseFloat(item.balance)), revenue.total)}%
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 3 }}>
                                    此期間無收入數據
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>費用分析</Typography>
                            {expenses.items && expenses.items.length > 0 ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ height: 240 }}>
                                            <Pie data={prepareExpensePieChartData()} options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'right',
                                                    }
                                                }
                                            }} />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>科目</TableCell>
                                                        <TableCell align="right">金額</TableCell>
                                                        <TableCell align="right">百分比</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {expenses.items.map((item: any) => (
                                                        <TableRow key={item.account_code}>
                                                            <TableCell>{item.account_name}</TableCell>
                                                            <TableCell align="right">{Math.abs(parseFloat(item.balance)).toLocaleString()}</TableCell>
                                                            <TableCell align="right">
                                                                {calculatePercentage(Math.abs(parseFloat(item.balance)), expenses.total)}%
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 3 }}>
                                    此期間無費用數據
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* 移除月度趨勢分析，因為新的 API 不提供這個資料 */}
            </Grid>
        </Box>
    );
};

export default IncomeExpenseReport; 