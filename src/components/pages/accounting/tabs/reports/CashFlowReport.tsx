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

interface CashFlowReportProps {
    data: any;
}

const CashFlowReport: React.FC<CashFlowReportProps> = ({ data }) => {
    // 計算各部分的淨現金流
    const calculateNetCashFlows = () => {
        // 營業活動
        const operatingInflowsTotal = data.operatingActivities.inflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const operatingOutflowsTotal = data.operatingActivities.outflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const netOperating = operatingInflowsTotal + operatingOutflowsTotal;

        // 投資活動
        const investingInflowsTotal = data.investingActivities.inflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const investingOutflowsTotal = data.investingActivities.outflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const netInvesting = investingInflowsTotal + investingOutflowsTotal;

        // 融資活動
        const financingInflowsTotal = data.financingActivities.inflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const financingOutflowsTotal = data.financingActivities.outflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const netFinancing = financingInflowsTotal + financingOutflowsTotal;

        // 淨現金流
        const netCashFlow = netOperating + netInvesting + netFinancing;

        return {
            operatingInflowsTotal,
            operatingOutflowsTotal,
            netOperating,
            investingInflowsTotal,
            investingOutflowsTotal,
            netInvesting,
            financingInflowsTotal,
            financingOutflowsTotal,
            netFinancing,
            netCashFlow
        };
    };

    const {
        operatingInflowsTotal,
        operatingOutflowsTotal,
        netOperating,
        investingInflowsTotal,
        investingOutflowsTotal,
        netInvesting,
        financingInflowsTotal,
        financingOutflowsTotal,
        netFinancing,
        netCashFlow
    } = calculateNetCashFlows();

    // 計算期末現金
    const endingCash = data.startingCash + netCashFlow;

    // 準備現金流量圖表數據
    const prepareCashFlowChartData = () => {
        return {
            labels: ['營業活動', '投資活動', '融資活動', '淨現金流'],
            datasets: [
                {
                    label: '現金流量',
                    data: [netOperating, netInvesting, netFinancing, netCashFlow],
                    backgroundColor: [
                        netOperating >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
                        netInvesting >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
                        netFinancing >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
                        netCashFlow >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
                    ],
                    borderColor: [
                        netOperating >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
                        netInvesting >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
                        netFinancing >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
                        netCashFlow >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };
    };

    // 準備現金流變化圖表數據
    const prepareCashChangeChartData = () => {
        return {
            labels: ['期初現金', '淨現金流入(出)', '期末現金'],
            datasets: [
                {
                    label: '現金變化',
                    data: [data.startingCash, netCashFlow, endingCash],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        netCashFlow >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
                        'rgba(255, 206, 86, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        netCashFlow >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)'
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
                        現金流量表 - {data.month ? `${data.year}年${data.month}月` : `${data.year}年度`}
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle1" color="textSecondary">期初現金</Typography>
                            <Typography variant="h5" color="primary.main">
                                {data.startingCash.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle1" color="textSecondary">淨現金流入(出)</Typography>
                            <Typography
                                variant="h5"
                                color={netCashFlow >= 0 ? "success.main" : "error.main"}
                            >
                                {netCashFlow.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle1" color="textSecondary">期末現金</Typography>
                            <Typography variant="h5" color="primary.main">
                                {endingCash.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle1" color="textSecondary">現金變化率</Typography>
                            <Typography
                                variant="h5"
                                color={netCashFlow >= 0 ? "success.main" : "error.main"}
                            >
                                {data.startingCash === 0
                                    ? '-'
                                    : ((netCashFlow / data.startingCash) * 100).toFixed(1) + '%'}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* 圖表 */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>現金流量分析</Typography>
                            <Box sx={{ height: 300 }}>
                                <Bar data={prepareCashFlowChartData()} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true
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
                            <Typography variant="h6" gutterBottom>現金變化</Typography>
                            <Box sx={{ height: 300 }}>
                                <Bar data={prepareCashChangeChartData()} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 營業活動 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>營業活動</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>現金流入</Typography>
                                    <TableContainer component={Paper} elevation={0}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>項目</TableCell>
                                                    <TableCell align="right">金額</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.operatingActivities.inflows.map((item: any, index: number) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.description}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'success.main' }}>
                                                            {item.amount.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell><strong>流入合計</strong></TableCell>
                                                    <TableCell align="right" sx={{ color: 'success.main' }}>
                                                        <strong>{operatingInflowsTotal.toLocaleString()}</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>現金流出</Typography>
                                    <TableContainer component={Paper} elevation={0}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>項目</TableCell>
                                                    <TableCell align="right">金額</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.operatingActivities.outflows.map((item: any, index: number) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.description}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'error.main' }}>
                                                            {item.amount.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell><strong>流出合計</strong></TableCell>
                                                    <TableCell align="right" sx={{ color: 'error.main' }}>
                                                        <strong>{operatingOutflowsTotal.toLocaleString()}</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1">
                                        營業活動淨現金流:
                                        <span style={{
                                            color: netOperating >= 0 ? '#4caf50' : '#f44336',
                                            marginLeft: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {netOperating.toLocaleString()} 元
                                        </span>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 投資活動 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>投資活動</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>現金流入</Typography>
                                    <TableContainer component={Paper} elevation={0}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>項目</TableCell>
                                                    <TableCell align="right">金額</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.investingActivities.inflows.map((item: any, index: number) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.description}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'success.main' }}>
                                                            {item.amount.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell><strong>流入合計</strong></TableCell>
                                                    <TableCell align="right" sx={{ color: 'success.main' }}>
                                                        <strong>{investingInflowsTotal.toLocaleString()}</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>現金流出</Typography>
                                    <TableContainer component={Paper} elevation={0}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>項目</TableCell>
                                                    <TableCell align="right">金額</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.investingActivities.outflows.map((item: any, index: number) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.description}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'error.main' }}>
                                                            {item.amount.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell><strong>流出合計</strong></TableCell>
                                                    <TableCell align="right" sx={{ color: 'error.main' }}>
                                                        <strong>{investingOutflowsTotal.toLocaleString()}</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1">
                                        投資活動淨現金流:
                                        <span style={{
                                            color: netInvesting >= 0 ? '#4caf50' : '#f44336',
                                            marginLeft: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {netInvesting.toLocaleString()} 元
                                        </span>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 融資活動 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>融資活動</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>現金流入</Typography>
                                    <TableContainer component={Paper} elevation={0}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>項目</TableCell>
                                                    <TableCell align="right">金額</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.financingActivities.inflows.map((item: any, index: number) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.description}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'success.main' }}>
                                                            {item.amount.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell><strong>流入合計</strong></TableCell>
                                                    <TableCell align="right" sx={{ color: 'success.main' }}>
                                                        <strong>{financingInflowsTotal.toLocaleString()}</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>現金流出</Typography>
                                    <TableContainer component={Paper} elevation={0}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>項目</TableCell>
                                                    <TableCell align="right">金額</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {data.financingActivities.outflows.map((item: any, index: number) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.description}</TableCell>
                                                        <TableCell align="right" sx={{ color: 'error.main' }}>
                                                            {item.amount.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell><strong>流出合計</strong></TableCell>
                                                    <TableCell align="right" sx={{ color: 'error.main' }}>
                                                        <strong>{financingOutflowsTotal.toLocaleString()}</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1">
                                        融資活動淨現金流:
                                        <span style={{
                                            color: netFinancing >= 0 ? '#4caf50' : '#f44336',
                                            marginLeft: '16px',
                                            fontWeight: 'bold'
                                        }}>
                                            {netFinancing.toLocaleString()} 元
                                        </span>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 現金流量總結 */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>現金流量總結</Typography>
                            <TableContainer component={Paper} elevation={0}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>期初現金餘額</TableCell>
                                            <TableCell align="right">{data.startingCash.toLocaleString()}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>營業活動淨現金流</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{ color: netOperating >= 0 ? 'success.main' : 'error.main' }}
                                            >
                                                {netOperating.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>投資活動淨現金流</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{ color: netInvesting >= 0 ? 'success.main' : 'error.main' }}
                                            >
                                                {netInvesting.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>融資活動淨現金流</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{ color: netFinancing >= 0 ? 'success.main' : 'error.main' }}
                                            >
                                                {netFinancing.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>本期淨現金流入(出)</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    color: netCashFlow >= 0 ? 'success.main' : 'error.main',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {netCashFlow.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>期末現金餘額</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{ fontWeight: 'bold' }}
                                            >
                                                {endingCash.toLocaleString()}
                                            </TableCell>
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

export default CashFlowReport; 