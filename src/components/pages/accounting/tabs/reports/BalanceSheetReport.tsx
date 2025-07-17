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
    // 檢查資料是否存在
    if (!data || !data.assets || !data.liabilities || !data.equity) {
        return (
            <Box>
                <Alert severity="info">
                    目前沒有資產負債表資料，請先建立會計科目和帳務記錄。
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

    // 計算百分比
    const calculatePercentage = (amount: number, total: number) => {
        if (!amount || !total) return 0;
        return Math.round((amount / total) * 100);
    };

    // 從 API 資料中整理出前端需要的結構
    const processedData = {
        date: data.asOfDate || '未知日期',
        assets: {
            totalAssets: safeGetValue(data.assets, 'total', 0),
            currentAssets: {
                cash: 0,
                accountsReceivable: 0,
                inventory: 0,
                total: 0
            },
            nonCurrentAssets: {
                property: 0,
                equipment: 0,
                investments: 0,
                total: 0
            }
        },
        liabilities: {
            totalLiabilities: safeGetValue(data.liabilities, 'total', 0),
            currentLiabilities: {
                accountsPayable: 0,
                total: 0
            },
            nonCurrentLiabilities: {
                longTermDebt: 0,
                total: 0
            }
        },
        equity: {
            totalEquity: safeGetValue(data.equity, 'total', 0),
            capital: 0,
            retainedEarnings: 0
        }
    };

    // 處理資產項目
    if (data.assets && data.assets.items) {
        data.assets.items.forEach((item: any) => {
            const balance = parseFloat(item.balance) || 0;
            const accountName = item.account_name?.toLowerCase() || '';

            if (accountName.includes('現金') || accountName.includes('cash')) {
                processedData.assets.currentAssets.cash += balance;
            } else if (accountName.includes('應收') || accountName.includes('receivable')) {
                processedData.assets.currentAssets.accountsReceivable += balance;
            } else if (accountName.includes('存貨') || accountName.includes('inventory')) {
                processedData.assets.currentAssets.inventory += balance;
            } else if (accountName.includes('房產') || accountName.includes('property')) {
                processedData.assets.nonCurrentAssets.property += balance;
            } else if (accountName.includes('設備') || accountName.includes('equipment')) {
                processedData.assets.nonCurrentAssets.equipment += balance;
            } else if (accountName.includes('投資') || accountName.includes('investment')) {
                processedData.assets.nonCurrentAssets.investments += balance;
            }
        });
    }

    // 處理負債項目
    if (data.liabilities && data.liabilities.items) {
        data.liabilities.items.forEach((item: any) => {
            const balance = parseFloat(item.balance) || 0;
            const accountName = item.account_name?.toLowerCase() || '';

            if (accountName.includes('應付') || accountName.includes('payable')) {
                processedData.liabilities.currentLiabilities.accountsPayable += balance;
            } else if (accountName.includes('長期') || accountName.includes('long')) {
                processedData.liabilities.nonCurrentLiabilities.longTermDebt += balance;
            }
        });
    }

    // 處理權益項目
    if (data.equity && data.equity.items) {
        data.equity.items.forEach((item: any) => {
            const balance = parseFloat(item.balance) || 0;
            const accountName = item.account_name?.toLowerCase() || '';

            if (accountName.includes('資本') || accountName.includes('capital')) {
                processedData.equity.capital += balance;
            } else if (accountName.includes('盈餘') || accountName.includes('retained')) {
                processedData.equity.retainedEarnings += balance;
            }
        });
    }

    // 計算小計
    processedData.assets.currentAssets.total =
        processedData.assets.currentAssets.cash +
        processedData.assets.currentAssets.accountsReceivable +
        processedData.assets.currentAssets.inventory;

    processedData.assets.nonCurrentAssets.total =
        processedData.assets.nonCurrentAssets.property +
        processedData.assets.nonCurrentAssets.equipment +
        processedData.assets.nonCurrentAssets.investments;

    processedData.liabilities.currentLiabilities.total =
        processedData.liabilities.currentLiabilities.accountsPayable;

    processedData.liabilities.nonCurrentLiabilities.total =
        processedData.liabilities.nonCurrentLiabilities.longTermDebt;

    // 準備資產餅圖數據
    const prepareAssetsPieData = () => {
        const currentAssets = processedData.assets.currentAssets.total;
        const nonCurrentAssets = processedData.assets.nonCurrentAssets.total;

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
        const totalLiabilities = processedData.liabilities.totalLiabilities;
        const totalEquity = processedData.equity.totalEquity;

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

    return (
        <Box>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        資產負債表 - {processedData.date}
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">總資產</Typography>
                            <Typography variant="h4" color="primary.main">
                                {processedData.assets.totalAssets.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">總負債</Typography>
                            <Typography variant="h4" color="error.main">
                                {processedData.liabilities.totalLiabilities.toLocaleString()} 元
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" color="textSecondary">總權益</Typography>
                            <Typography variant="h4" color="success.main">
                                {processedData.equity.totalEquity.toLocaleString()} 元
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
                <Grid item xs={12} md={6}>
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
                                            <TableCell align="right">{processedData.assets.currentAssets.cash.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(processedData.assets.currentAssets.cash, processedData.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>應收帳款</TableCell>
                                            <TableCell align="right">{processedData.assets.currentAssets.accountsReceivable.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(processedData.assets.currentAssets.accountsReceivable, processedData.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>存貨</TableCell>
                                            <TableCell align="right">{processedData.assets.currentAssets.inventory.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(processedData.assets.currentAssets.inventory, processedData.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>流動資產合計</strong></TableCell>
                                            <TableCell align="right"><strong>{processedData.assets.currentAssets.total.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(processedData.assets.currentAssets.total, processedData.assets.totalAssets)}%</strong>
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
                                            <TableCell align="right">{processedData.assets.nonCurrentAssets.property.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(processedData.assets.nonCurrentAssets.property, processedData.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>設備</TableCell>
                                            <TableCell align="right">{processedData.assets.nonCurrentAssets.equipment.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(processedData.assets.nonCurrentAssets.equipment, processedData.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>投資</TableCell>
                                            <TableCell align="right">{processedData.assets.nonCurrentAssets.investments.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(processedData.assets.nonCurrentAssets.investments, processedData.assets.totalAssets)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>非流動資產合計</strong></TableCell>
                                            <TableCell align="right"><strong>{processedData.assets.nonCurrentAssets.total.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(processedData.assets.nonCurrentAssets.total, processedData.assets.totalAssets)}%</strong>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>資產總計</strong></TableCell>
                                            <TableCell align="right"><strong>{processedData.assets.totalAssets.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right"><strong>100%</strong></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 負債與權益明細 */}
                <Grid item xs={12} md={6}>
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
                                            <TableCell align="right">{processedData.liabilities.currentLiabilities.accountsPayable.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(processedData.liabilities.currentLiabilities.accountsPayable, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>流動負債合計</strong></TableCell>
                                            <TableCell align="right"><strong>{processedData.liabilities.currentLiabilities.total.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(processedData.liabilities.currentLiabilities.total, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity)}%</strong>
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
                                            <TableCell>長期負債</TableCell>
                                            <TableCell align="right">{processedData.liabilities.nonCurrentLiabilities.longTermDebt.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(processedData.liabilities.nonCurrentLiabilities.longTermDebt, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>非流動負債合計</strong></TableCell>
                                            <TableCell align="right"><strong>{processedData.liabilities.nonCurrentLiabilities.total.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(processedData.liabilities.nonCurrentLiabilities.total, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity)}%</strong>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>負債總計</strong></TableCell>
                                            <TableCell align="right"><strong>{processedData.liabilities.totalLiabilities.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(processedData.liabilities.totalLiabilities, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity)}%</strong>
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
                                            <TableCell align="right">{processedData.equity.capital.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(processedData.equity.capital, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>保留盈餘</TableCell>
                                            <TableCell align="right">{processedData.equity.retainedEarnings.toLocaleString()}</TableCell>
                                            <TableCell align="right">
                                                {calculatePercentage(processedData.equity.retainedEarnings, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity)}%
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>權益總計</strong></TableCell>
                                            <TableCell align="right"><strong>{processedData.equity.totalEquity.toLocaleString()}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>{calculatePercentage(processedData.equity.totalEquity, processedData.liabilities.totalLiabilities + processedData.equity.totalEquity)}%</strong>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>負債及權益總計</strong></TableCell>
                                            <TableCell align="right"><strong>{(processedData.liabilities.totalLiabilities + processedData.equity.totalEquity).toLocaleString()}</strong></TableCell>
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