import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    IconButton,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    InputAdornment,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { AccountReceivable } from '../../../../types/payment';
import { receivablesApiService } from '../../../../services/accountingApi.service';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`business-receivables-tabpanel-${index}`}
            aria-labelledby={`business-receivables-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `business-receivables-tab-${index}`,
        'aria-controls': `business-receivables-tabpanel-${index}`,
    };
}

const BusinessReceivablesTab: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        loadReceivables();
    }, []);

    const loadReceivables = async () => {
        setLoading(true);
        try {
            const data = await receivablesApiService.getReceivables();
            setReceivables(data);
        } catch (error) {
            console.error('獲取應收帳款失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const getBusinessType = (description: string): string => {
        if (description.includes('會費')) return '會費';
        if (description.includes('租金')) return '租金';
        return '其他';
    };

    const getStatusChip = (status: string) => {
        const statusConfig = {
            pending: { label: '待付款', color: 'warning' as const },
            partially_paid: { label: '部分付款', color: 'info' as const },
            paid: { label: '已付款', color: 'success' as const },
            overdue: { label: '逾期', color: 'error' as const }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
        return <Chip label={config.label} color={config.color} size="small" />;
    };

    const filterReceivables = (type: 'membership' | 'rental' | 'all') => {
        return receivables.filter(receivable => {
            // 業務類型過濾
            if (type !== 'all') {
                const description = receivable.description || '';
                if (type === 'membership' && !description.includes('會費')) {
                    return false;
                }
                if (type === 'rental' && !description.includes('租金')) {
                    return false;
                }
            }

            // 狀態過濾
            if (filterStatus !== 'all' && receivable.status !== filterStatus) {
                return false;
            }

            // 搜尋條件過濾
            const searchLower = (searchTerm || '').toLowerCase();
            return (
                (receivable.customer_name && receivable.customer_name.toLowerCase().includes(searchLower)) ||
                (receivable.description && receivable.description.toLowerCase().includes(searchLower)) ||
                (receivable.invoice_number && receivable.invoice_number.toLowerCase().includes(searchLower))
            );
        });
    };

    const getFilteredReceivables = () => {
        switch (tabValue) {
            case 0: return filterReceivables('membership');
            case 1: return filterReceivables('rental');
            default: return filterReceivables('all');
        }
    };

    const filteredReceivables = getFilteredReceivables();

    const getTabTitle = () => {
        switch (tabValue) {
            case 0: return '會費應收帳款';
            case 1: return '租金應收帳款';
            default: return '其他應收帳款';
        }
    };

    const getTotalAmount = () => {
        return filteredReceivables.reduce((sum, item) => sum + ((item.amount || 0) - (item.payment_amount || 0)), 0);
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                {getTabTitle()}
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="業務類型分頁">
                    <Tab label="會費" {...a11yProps(0)} />
                    <Tab label="租金" {...a11yProps(1)} />
                    <Tab label="其他" {...a11yProps(2)} />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="搜尋客戶、描述或發票號碼"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>狀態</InputLabel>
                                <Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    label="狀態"
                                >
                                    <MenuItem value="all">全部</MenuItem>
                                    <MenuItem value="pending">待付款</MenuItem>
                                    <MenuItem value="partially_paid">部分付款</MenuItem>
                                    <MenuItem value="paid">已付款</MenuItem>
                                    <MenuItem value="overdue">逾期</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => {/* 新增會費應收帳款 */ }}
                                >
                                    新增會費應收帳款
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                    <Typography variant="body2" color="textSecondary">
                        總計: {getTotalAmount().toLocaleString()} 元, 共 {filteredReceivables.length} 筆記錄
                    </Typography>
                </Paper>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>會員編號</TableCell>
                                <TableCell>姓名</TableCell>
                                <TableCell>到期日</TableCell>
                                <TableCell>描述</TableCell>
                                <TableCell align="right">金額</TableCell>
                                <TableCell align="right">已付金額</TableCell>
                                <TableCell align="right">餘額</TableCell>
                                <TableCell>狀態</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredReceivables.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        無符合條件的會費應收帳款
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReceivables.map((receivable) => {
                                    const balance = (receivable.amount || 0) - (receivable.payment_amount || 0);

                                    return (
                                        <TableRow
                                            key={receivable.id}
                                            sx={balance > 0 ? { bgcolor: 'rgba(255, 152, 0, 0.05)' } : {}}
                                        >
                                            <TableCell>{receivable.customer_name || '-'}</TableCell>
                                            <TableCell>{receivable.customer_name || '-'}</TableCell>
                                            <TableCell>{receivable.due_date ? dayjs(receivable.due_date).format('YYYY/MM/DD') : '-'}</TableCell>
                                            <TableCell>{receivable.description || '-'}</TableCell>
                                            <TableCell align="right">{(receivable.amount || 0).toLocaleString()}</TableCell>
                                            <TableCell align="right">{(receivable.payment_amount || 0).toLocaleString()}</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: balance > 0 ? 'error.main' : 'success.main'
                                                }}
                                            >
                                                {(balance || 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{getStatusChip(receivable.status)}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => {/* 編輯 */ }}
                                                    title="編輯"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {/* 刪除 */ }}
                                                    title="刪除"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="搜尋客戶、描述或發票號碼"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>狀態</InputLabel>
                                <Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    label="狀態"
                                >
                                    <MenuItem value="all">全部</MenuItem>
                                    <MenuItem value="pending">待付款</MenuItem>
                                    <MenuItem value="partially_paid">部分付款</MenuItem>
                                    <MenuItem value="paid">已付款</MenuItem>
                                    <MenuItem value="overdue">逾期</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => {/* 新增租金應收帳款 */ }}
                                >
                                    新增租金應收帳款
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                    <Typography variant="body2" color="textSecondary">
                        總計: {getTotalAmount().toLocaleString()} 元, 共 {filteredReceivables.length} 筆記錄
                    </Typography>
                </Paper>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>投資項目</TableCell>
                                <TableCell>承租人</TableCell>
                                <TableCell>到期日</TableCell>
                                <TableCell>描述</TableCell>
                                <TableCell align="right">金額</TableCell>
                                <TableCell align="right">已付金額</TableCell>
                                <TableCell align="right">餘額</TableCell>
                                <TableCell>狀態</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredReceivables.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        無符合條件的租金應收帳款
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReceivables.map((receivable) => {
                                    const balance = (receivable.amount || 0) - (receivable.payment_amount || 0);

                                    return (
                                        <TableRow
                                            key={receivable.id}
                                            sx={balance > 0 ? { bgcolor: 'rgba(255, 152, 0, 0.05)' } : {}}
                                        >
                                            <TableCell>{receivable.customer_name || '-'}</TableCell>
                                            <TableCell>{receivable.customer_name || '-'}</TableCell>
                                            <TableCell>{receivable.due_date ? dayjs(receivable.due_date).format('YYYY/MM/DD') : '-'}</TableCell>
                                            <TableCell>{receivable.description || '-'}</TableCell>
                                            <TableCell align="right">{(receivable.amount || 0).toLocaleString()}</TableCell>
                                            <TableCell align="right">{(receivable.payment_amount || 0).toLocaleString()}</TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: balance > 0 ? 'error.main' : 'success.main'
                                                }}
                                            >
                                                {(balance || 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{getStatusChip(receivable.status)}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => {/* 編輯 */ }}
                                                    title="編輯"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {/* 刪除 */ }}
                                                    title="刪除"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Typography variant="body1" color="textSecondary" align="center">
                    其他類型的應收帳款將在此顯示
                </Typography>
            </TabPanel>
        </Box>
    );
};

export default BusinessReceivablesTab; 