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
    Divider,
    Alert
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
    // 檢查資料是否存在
    if (!data || !data.operatingActivities || !data.investingActivities || !data.financingActivities) {
        return (
            <Box>
                <Alert severity="info">
                    目前沒有現金流量表資料，請先建立會計科目和帳務記錄。
                </Alert>
            </Box>
        );
    }

    // 安全地取得數值，避免 undefined 錯誤
    const safeGetValue = (obj: any, path: string, defaultValue: number = 0): number => {
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        return typeof value === 'number' ? value : defaultValue;
    };

    // 從 API 資料中整理出前端需要的結構
    const processedData = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        startingCash: 0, // 期初現金，需要從其他地方取得或計算
        operatingActivities: {
            inflows: [] as any[],
            outflows: [] as any[]
        },
        investingActivities: {
            inflows: [] as any[],
            outflows: [] as any[]
        },
        financingActivities: {
            inflows: [] as any[],
            outflows: [] as any[]
        }
    };

    // 處理營業活動
    if (data.operatingActivities && data.operatingActivities.items) {
        data.operatingActivities.items.forEach((item: any) => {
            const netCashFlow = parseFloat(item.net_cash_flow) || 0;
            if (netCashFlow > 0) {
                processedData.operatingActivities.inflows.push({
                    name: item.account_name,
                    amount: netCashFlow
                });
            } else if (netCashFlow < 0) {
                processedData.operatingActivities.outflows.push({
                    name: item.account_name,
                    amount: Math.abs(netCashFlow)
                });
            }
        });
    }

    // 處理投資活動
    if (data.investingActivities && data.investingActivities.items) {
        data.investingActivities.items.forEach((item: any) => {
            const netCashFlow = parseFloat(item.net_cash_flow) || 0;
            if (netCashFlow > 0) {
                processedData.investingActivities.inflows.push({
                    name: item.account_name,
                    amount: netCashFlow
                });
            } else if (netCashFlow < 0) {
                processedData.investingActivities.outflows.push({
                    name: item.account_name,
                    amount: Math.abs(netCashFlow)
                });
            }
        });
    }

    // 處理融資活動
    if (data.financingActivities && data.financingActivities.items) {
        data.financingActivities.items.forEach((item: any) => {
            const netCashFlow = parseFloat(item.net_cash_flow) || 0;
            if (netCashFlow > 0) {
                processedData.financingActivities.inflows.push({
                    name: item.account_name,
                    amount: netCashFlow
                });
            } else if (netCashFlow < 0) {
                processedData.financingActivities.outflows.push({
                    name: item.account_name,
                    amount: Math.abs(netCashFlow)
                });
            }
        });
    }

    // 計算各部分的淨現金流
    const calculateNetCashFlows = () => {
        // 營業活動
        const operatingInflowsTotal = processedData.operatingActivities.inflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const operatingOutflowsTotal = processedData.operatingActivities.outflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const netOperating = operatingInflowsTotal - operatingOutflowsTotal;

        // 投資活動
        const investingInflowsTotal = processedData.investingActivities.inflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const investingOutflowsTotal = processedData.investingActivities.outflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const netInvesting = investingInflowsTotal - investingOutflowsTotal;

        // 融資活動
        const financingInflowsTotal = processedData.financingActivities.inflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const financingOutflowsTotal = processedData.financingActivities.outflows.reduce(
            (sum: number, item: any) => sum + item.amount, 0
        );
        const netFinancing = financingInflowsTotal - financingOutflowsTotal;

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
    const endingCash = processedData.startingCash + netCashFlow;

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
                    data: [processedData.startingCash, netCashFlow, endingCash],
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
                        現金流量表 - {processedData.month ? `${processedData.year}年${processedData.month}月` : `${processedData.year}年度`}
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Typography variant="subtitle1" color="textSecondary">期初現金</Typography>
                            <Typography variant="h5" color="primary.main">
                                {processedData.startingCash.toLocaleString()} 元
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
                                {processedData.startingCash === 0
                                    ? '-'
                                    : ((netCashFlow / processedData.startingCash) * 100).toFixed(1) + '%'}
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
                            <Typography variant="h6" gutterBottom>現金變化趨勢</Typography>
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
                                                {processedData.operatingActivities.inflows.length > 0 ? (
                                                    processedData.operatingActivities.inflows.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.name}</TableCell>
                                                            <TableCell align="right">{item.amount.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">無現金流入</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow>
                                                    <TableCell><strong>營業活動現金流入合計</strong></TableCell>
                                                    <TableCell align="right"><strong>{operatingInflowsTotal.toLocaleString()}</strong></TableCell>
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
                                                {processedData.operatingActivities.outflows.length > 0 ? (
                                                    processedData.operatingActivities.outflows.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.name}</TableCell>
                                                            <TableCell align="right">{item.amount.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">無現金流出</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow>
                                                    <TableCell><strong>營業活動現金流出合計</strong></TableCell>
                                                    <TableCell align="right"><strong>{operatingOutflowsTotal.toLocaleString()}</strong></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="subtitle1" align="center">
                                    營業活動淨現金流:
                                    <span style={{
                                        color: netOperating >= 0 ? 'green' : 'red',
                                        fontWeight: 'bold',
                                        marginLeft: '8px'
                                    }}>
                                        {netOperating.toLocaleString()} 元
                                    </span>
                                </Typography>
                            </Box>
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
                                                {processedData.investingActivities.inflows.length > 0 ? (
                                                    processedData.investingActivities.inflows.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.name}</TableCell>
                                                            <TableCell align="right">{item.amount.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">無現金流入</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow>
                                                    <TableCell><strong>投資活動現金流入合計</strong></TableCell>
                                                    <TableCell align="right"><strong>{investingInflowsTotal.toLocaleString()}</strong></TableCell>
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
                                                {processedData.investingActivities.outflows.length > 0 ? (
                                                    processedData.investingActivities.outflows.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.name}</TableCell>
                                                            <TableCell align="right">{item.amount.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">無現金流出</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow>
                                                    <TableCell><strong>投資活動現金流出合計</strong></TableCell>
                                                    <TableCell align="right"><strong>{investingOutflowsTotal.toLocaleString()}</strong></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="subtitle1" align="center">
                                    投資活動淨現金流:
                                    <span style={{
                                        color: netInvesting >= 0 ? 'green' : 'red',
                                        fontWeight: 'bold',
                                        marginLeft: '8px'
                                    }}>
                                        {netInvesting.toLocaleString()} 元
                                    </span>
                                </Typography>
                            </Box>
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
                                                {processedData.financingActivities.inflows.length > 0 ? (
                                                    processedData.financingActivities.inflows.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.name}</TableCell>
                                                            <TableCell align="right">{item.amount.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">無現金流入</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow>
                                                    <TableCell><strong>融資活動現金流入合計</strong></TableCell>
                                                    <TableCell align="right"><strong>{financingInflowsTotal.toLocaleString()}</strong></TableCell>
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
                                                {processedData.financingActivities.outflows.length > 0 ? (
                                                    processedData.financingActivities.outflows.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{item.name}</TableCell>
                                                            <TableCell align="right">{item.amount.toLocaleString()}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center">無現金流出</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow>
                                                    <TableCell><strong>融資活動現金流出合計</strong></TableCell>
                                                    <TableCell align="right"><strong>{financingOutflowsTotal.toLocaleString()}</strong></TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="subtitle1" align="center">
                                    融資活動淨現金流:
                                    <span style={{
                                        color: netFinancing >= 0 ? 'green' : 'red',
                                        fontWeight: 'bold',
                                        marginLeft: '8px'
                                    }}>
                                        {netFinancing.toLocaleString()} 元
                                    </span>
                                </Typography>
                            </Box>
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
                                            <TableCell align="right">{processedData.startingCash.toLocaleString()}</TableCell>
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