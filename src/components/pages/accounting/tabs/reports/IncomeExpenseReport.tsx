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
    // 處理圖表數據
    const prepareBarChartData = () => {
        if (data.monthlyData) {
            // 年度報表
            return {
                labels: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
                datasets: [
                    {
                        label: '收入',
                        data: data.monthlyData.map((monthData: any) => monthData.income),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '支出',
                        data: data.monthlyData.map((monthData: any) => monthData.expense),
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            };
        } else {
            // 月度報表
            return {
                labels: ['收入', '支出', '淨額'],
                datasets: [
                    {
                        data: [data.totalIncome, data.totalExpense, data.totalIncome - data.totalExpense],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            data.totalIncome - data.totalExpense >= 0
                                ? 'rgba(54, 162, 235, 0.6)'
                                : 'rgba(255, 159, 64, 0.6)'
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 99, 132, 1)',
                            data.totalIncome - data.totalExpense >= 0
                                ? 'rgba(54, 162, 235, 1)'
                                : 'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }
                ]
            };
        }
    };

    // 類別分析的餅圖數據
    const preparePieChartData = (type: 'income' | 'expense') => {
        const categories = data.categories?.[type] || [];
        return {
            labels: categories.map((cat: any) => cat.category),
            datasets: [
                {
                    data: categories.map((cat: any) => cat.amount),
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
                        {data.month ? `${data.year}年${data.month}月 財務概覽` : `${data.year}年度 財務概覽`}
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">總收入</Typography>
                            <Typography variant="h4" color="success.main">
                                {data.totalIncome.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">總支出</Typography>
                            <Typography variant="h4" color="error.main">
                                {data.totalExpense.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">淨收入</Typography>
                            <Typography
                                variant="h4"
                                color={(data.totalIncome - data.totalExpense) >= 0 ? "success.main" : "error.main"}
                            >
                                {(data.totalIncome - data.totalExpense).toLocaleString()} 元
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>收支對比</Typography>
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
                            {data.categories?.income && data.categories.income.length > 0 ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ height: 240 }}>
                                            <Pie data={preparePieChartData('income')} options={{
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
                                                        <TableCell>類別</TableCell>
                                                        <TableCell align="right">金額</TableCell>
                                                        <TableCell align="right">百分比</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {data.categories.income.map((category: any) => (
                                                        <TableRow key={category.category}>
                                                            <TableCell>{category.category}</TableCell>
                                                            <TableCell align="right">{category.amount.toLocaleString()}</TableCell>
                                                            <TableCell align="right">
                                                                {calculatePercentage(category.amount, data.totalIncome)}%
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
                            <Typography variant="h6" gutterBottom>支出分析</Typography>
                            {data.categories?.expense && data.categories.expense.length > 0 ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ height: 240 }}>
                                            <Pie data={preparePieChartData('expense')} options={{
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
                                                        <TableCell>類別</TableCell>
                                                        <TableCell align="right">金額</TableCell>
                                                        <TableCell align="right">百分比</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {data.categories.expense.map((category: any) => (
                                                        <TableRow key={category.category}>
                                                            <TableCell>{category.category}</TableCell>
                                                            <TableCell align="right">{category.amount.toLocaleString()}</TableCell>
                                                            <TableCell align="right">
                                                                {calculatePercentage(category.amount, data.totalExpense)}%
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
                                    此期間無支出數據
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* 顯示月度趨勢（僅在年度報表中） */}
                {data.monthlyData && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>月度趨勢分析</Typography>
                                <Box sx={{ height: 300 }}>
                                    <Line
                                        data={{
                                            labels: Array.from({ length: 12 }, (_, i) => `${i + 1}月`),
                                            datasets: [
                                                {
                                                    label: '收入',
                                                    data: data.monthlyData.map((monthData: any) => monthData.income),
                                                    borderColor: 'rgba(75, 192, 192, 1)',
                                                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                                    tension: 0.4
                                                },
                                                {
                                                    label: '支出',
                                                    data: data.monthlyData.map((monthData: any) => monthData.expense),
                                                    borderColor: 'rgba(255, 99, 132, 1)',
                                                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                                    tension: 0.4
                                                },
                                                {
                                                    label: '淨額',
                                                    data: data.monthlyData.map((monthData: any) =>
                                                        monthData.income - monthData.expense
                                                    ),
                                                    borderColor: 'rgba(54, 162, 235, 1)',
                                                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                                    tension: 0.4
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true
                                                }
                                            }
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default IncomeExpenseReport; 