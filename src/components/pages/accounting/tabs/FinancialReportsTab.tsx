import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Divider
} from '@mui/material';
import {
    BarChart as BarChartIcon,
    Assessment as AssessmentIcon,
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon,
    Download as DownloadIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { financialReportsApiService } from '../../../../services/accountingApi.service';

// 導入報表組件
import IncomeExpenseReport from './reports/IncomeExpenseReport';
import BalanceSheetReport from './reports/BalanceSheetReport';
import CashFlowReport from './reports/CashFlowReport';

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
            id={`report-tabpanel-${index}`}
            aria-labelledby={`report-tab-${index}`}
            {...other}
            style={{ paddingTop: '1rem' }}
        >
            {value === index && (
                <Box>{children}</Box>
            )}
        </div>
    );
}

const FinancialReportsTab: React.FC = () => {
    // 狀態變數
    const [reportType, setReportType] = useState(0);
    const [year, setYear] = useState(dayjs().year());
    const [month, setMonth] = useState<number | null>(dayjs().month() + 1);
    const [date, setDate] = useState<Dayjs>(dayjs());
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    // 獲取當前年份和可選年份範圍
    const currentYear = dayjs().year();
    const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    // 處理報表類型切換
    const handleReportTypeChange = (event: React.SyntheticEvent, newValue: number) => {
        setReportType(newValue);
        setReportData(null);
    };

    // 載入報表數據
    const loadReportData = async () => {
        setLoading(true);
        try {
            let data;
            switch (reportType) {
                case 0: // 收支報表
                    data = await financialReportsApiService.getIncomeExpenseReport({ year, month: month || undefined });
                    break;
                case 1: // 資產負債表
                    data = await financialReportsApiService.getBalanceSheet({ date: date.format('YYYY-MM-DD') });
                    break;
                case 2: // 現金流量表
                    data = await financialReportsApiService.getCashFlowStatement({ year, month: month || undefined });
                    break;
                default:
                    data = null;
            }
            setReportData(data);
        } catch (error) {
            console.error('載入報表數據失敗:', error);
            setSnackbar({
                open: true,
                message: '載入報表數據失敗',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // 當選擇參數變化時，重新載入報表
    useEffect(() => {
        if (reportType !== null) {
            loadReportData();
        }
    }, [reportType, year, month, date]);

    // 渲染報表篩選條件
    const renderReportFilters = () => {
        return (
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    {/* 根據報表類型顯示不同的篩選項 */}
                    {reportType === 0 || reportType === 2 ? (
                        <>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>年度</InputLabel>
                                    <Select
                                        value={year}
                                        label="年度"
                                        onChange={(e) => setYear(Number(e.target.value))}
                                    >
                                        {yearOptions.map(y => (
                                            <MenuItem key={y} value={y}>{y}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>月份</InputLabel>
                                    <Select
                                        value={month || ''}
                                        label="月份"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setMonth(value === '' ? null : Number(value));
                                        }}
                                    >
                                        <MenuItem value="">全年</MenuItem>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <MenuItem key={m} value={m}>{m}月</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </>
                    ) : reportType === 1 ? (
                        <Grid item xs={12} md={4}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="資產負債表日期"
                                    value={date}
                                    onChange={(newDate) => {
                                        if (newDate) {
                                            setDate(newDate);
                                        }
                                    }}
                                    format="YYYY/MM/DD"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                    ) : null}

                    <Grid item xs={12} md={3}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            disabled={!reportData}
                            onClick={() => {/* 模擬下載功能 */ }}
                            fullWidth
                        >
                            匯出報表
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">財務報表</Typography>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={reportType}
                    onChange={handleReportTypeChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="financial reports tabs"
                >
                    <Tab icon={<BarChartIcon />} label="收支報表" />
                    <Tab icon={<AccountBalanceIcon />} label="資產負債表" />
                    <Tab icon={<TrendingUpIcon />} label="現金流量表" />
                </Tabs>
            </Paper>

            {renderReportFilters()}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    <TabPanel value={reportType} index={0}>
                        {reportData && <IncomeExpenseReport data={reportData} />}
                    </TabPanel>
                    <TabPanel value={reportType} index={1}>
                        {reportData && <BalanceSheetReport data={reportData} />}
                    </TabPanel>
                    <TabPanel value={reportType} index={2}>
                        {reportData && <CashFlowReport data={reportData} />}
                    </TabPanel>
                </Box>
            )}

            {/* 通知訊息 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FinancialReportsTab; 