import React, { useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    TextField,
    Chip,
    Typography,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

interface Investment {
    id: string;
    name: string;
    type: '股票' | '基金' | '債券' | '其他';
    amount: number;
    purchaseDate: string;
    currentValue: number;
    returnRate: number;
    status: '進行中' | '已結束';
}

const mockInvestments: Investment[] = [
    {
        id: 'INV001',
        name: '台積電',
        type: '股票',
        amount: 1000000,
        purchaseDate: '2024-01-15',
        currentValue: 1150000,
        returnRate: 15,
        status: '進行中',
    },
    {
        id: 'INV002',
        name: '全球科技基金',
        type: '基金',
        amount: 500000,
        purchaseDate: '2024-01-01',
        currentValue: 520000,
        returnRate: 4,
        status: '進行中',
    },
];

const InvestmentManagement: React.FC = () => {
    const [investments] = useState<Investment[]>(mockInvestments);
    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = React.useState(0);

    const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturn = totalCurrentValue - totalInvestment;
    const averageReturnRate = (totalReturn / totalInvestment) * 100;

    const filteredInvestments = investments.filter(investment =>
        Object.values(investment).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">投資管理</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {/* 處理新增投資 */ }}
                >
                    新增投資項目
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="動產投資" />
                    <Tab label="不動產投資" />
                </Tabs>
            </Box>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                總投資金額
                            </Typography>
                            <Typography variant="h5">
                                ${totalInvestment.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                目前總值
                            </Typography>
                            <Typography variant="h5">
                                ${totalCurrentValue.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                總報酬
                            </Typography>
                            <Typography variant="h5" color={totalReturn >= 0 ? 'success.main' : 'error.main'}>
                                ${totalReturn.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                平均報酬率
                            </Typography>
                            <Typography variant="h5" color={averageReturnRate >= 0 ? 'success.main' : 'error.main'}>
                                {averageReturnRate.toFixed(2)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="搜尋投資項目"
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 300 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>投資編號</TableCell>
                            <TableCell>名稱</TableCell>
                            <TableCell>類型</TableCell>
                            <TableCell>投資金額</TableCell>
                            <TableCell>購買日期</TableCell>
                            <TableCell>目前價值</TableCell>
                            <TableCell>報酬率</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredInvestments.map((investment) => (
                            <TableRow key={investment.id}>
                                <TableCell>{investment.id}</TableCell>
                                <TableCell>{investment.name}</TableCell>
                                <TableCell>
                                    <Chip label={investment.type} size="small" />
                                </TableCell>
                                <TableCell>${investment.amount.toLocaleString()}</TableCell>
                                <TableCell>{investment.purchaseDate}</TableCell>
                                <TableCell>${investment.currentValue.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {investment.returnRate >= 0 ? (
                                            <TrendingUpIcon color="success" />
                                        ) : (
                                            <TrendingDownIcon color="error" />
                                        )}
                                        <Typography
                                            color={investment.returnRate >= 0 ? 'success.main' : 'error.main'}
                                        >
                                            {investment.returnRate}%
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={investment.status}
                                        color={investment.status === '進行中' ? 'primary' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={() => {/* 處理編輯 */ }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => {/* 處理刪除 */ }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default InvestmentManagement; 