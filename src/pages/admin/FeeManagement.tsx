import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    Chip,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Warning as WarningIcon,
    Send as SendIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, differenceInDays } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { FeeSettings, PaymentRecord, ExpirationReminder, DEFAULT_FEE_SETTINGS } from '../../types/fee';
import { feeService } from '../../services/feeService';

const FeeManagement: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FeeSettings | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
    const [feeSettings, setFeeSettings] = useState<FeeSettings[]>([]);
    const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
    const [expirationReminders, setExpirationReminders] = useState<ExpirationReminder[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [settings, payments, reminders] = await Promise.all([
                feeService.getFeeSettings(),
                feeService.getPaymentRecords(),
                feeService.getExpirationReminders(),
            ]);
            setFeeSettings(settings);
            setPaymentRecords(payments);
            setExpirationReminders(reminders);
        } catch (error) {
            showSnackbar('載入資料失敗', 'error');
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleOpenDialog = (member?: FeeSettings) => {
        setSelectedMember(member || null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedMember(null);
    };

    const handleOpenPaymentDialog = (payment?: PaymentRecord) => {
        setSelectedPayment(payment || null);
        setOpenPaymentDialog(true);
    };

    const handleClosePaymentDialog = () => {
        setOpenPaymentDialog(false);
        setSelectedPayment(null);
    };

    const handleSaveFeeSettings = async (formData: FeeSettings) => {
        try {
            if (selectedMember) {
                await feeService.updateFeeSetting(selectedMember.id, formData);
            } else {
                await feeService.createFeeSetting(formData);
            }
            await loadData();
            handleCloseDialog();
            showSnackbar('儲存成功', 'success');
        } catch (error) {
            showSnackbar('儲存失敗', 'error');
        }
    };

    const handleDeleteFeeSetting = async (id: string) => {
        try {
            await feeService.deleteFeeSetting(id);
            await loadData();
            showSnackbar('刪除成功', 'success');
        } catch (error) {
            showSnackbar('刪除失敗', 'error');
        }
    };

    const handleSavePaymentRecord = async (formData: PaymentRecord) => {
        try {
            if (selectedPayment) {
                await feeService.updatePaymentRecord(selectedPayment.id, formData);
            } else {
                await feeService.createPaymentRecord(formData);
            }
            await loadData();
            handleClosePaymentDialog();
            showSnackbar('儲存成功', 'success');
        } catch (error) {
            showSnackbar('儲存失敗', 'error');
        }
    };

    const handleGeneratePaymentRecords = async () => {
        try {
            await feeService.generatePaymentRecords(selectedYear);
            await loadData();
            showSnackbar('生成收款記錄成功', 'success');
        } catch (error) {
            showSnackbar('生成收款記錄失敗', 'error');
        }
    };

    const handleSendReminders = async (reminderIds: string[]) => {
        try {
            await feeService.sendReminders(reminderIds);
            await loadData();
            showSnackbar('發送提醒成功', 'success');
        } catch (error) {
            showSnackbar('發送提醒失敗', 'error');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                會員收費管理
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="收費設定" />
                    <Tab label="收款記錄" />
                    <Tab label="到期提醒" />
                </Tabs>
            </Box>

            {/* 收費設定頁籤 */}
            {tabValue === 0 && (
                <Box>
                    <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenDialog()}
                        >
                            新增收費設定
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={loadData}
                        >
                            重新整理
                        </Button>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>會員編號</TableCell>
                                    <TableCell>會員姓名</TableCell>
                                    <TableCell>會員類型</TableCell>
                                    <TableCell>年費金額</TableCell>
                                    <TableCell>起始日期</TableCell>
                                    <TableCell>結束日期</TableCell>
                                    <TableCell>狀態</TableCell>
                                    <TableCell>操作</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feeSettings.map((setting) => (
                                    <TableRow key={setting.id}>
                                        <TableCell>{setting.memberId}</TableCell>
                                        <TableCell>{setting.memberName}</TableCell>
                                        <TableCell>{setting.memberType}</TableCell>
                                        <TableCell>{setting.annualFee.toLocaleString()}</TableCell>
                                        <TableCell>{format(new Date(setting.startDate), 'yyyy/MM/dd')}</TableCell>
                                        <TableCell>{format(new Date(setting.endDate), 'yyyy/MM/dd')}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={setting.status}
                                                color={
                                                    setting.status === '有效'
                                                        ? 'success'
                                                        : setting.status === '即將到期'
                                                            ? 'warning'
                                                            : 'error'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpenDialog(setting)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteFeeSetting(setting.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* 收款記錄頁籤 */}
            {tabValue === 1 && (
                <Box>
                    <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenPaymentDialog()}
                        >
                            新增收款記錄
                        </Button>
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>年度</InputLabel>
                            <Select
                                value={selectedYear}
                                label="年度"
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="outlined"
                            onClick={handleGeneratePaymentRecords}
                        >
                            生成年度收款記錄
                        </Button>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>會員編號</TableCell>
                                    <TableCell>會員姓名</TableCell>
                                    <TableCell>年度</TableCell>
                                    <TableCell>應收金額</TableCell>
                                    <TableCell>收款日期</TableCell>
                                    <TableCell>到期日</TableCell>
                                    <TableCell>狀態</TableCell>
                                    <TableCell>備註</TableCell>
                                    <TableCell>操作</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paymentRecords.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{record.memberId}</TableCell>
                                        <TableCell>{record.memberName}</TableCell>
                                        <TableCell>{record.year}</TableCell>
                                        <TableCell>{record.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {record.paymentDate ? format(new Date(record.paymentDate), 'yyyy/MM/dd') : '-'}
                                        </TableCell>
                                        <TableCell>{format(new Date(record.dueDate), 'yyyy/MM/dd')}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.status}
                                                color={
                                                    record.status === '已付款'
                                                        ? 'success'
                                                        : record.status === '未付款'
                                                            ? 'warning'
                                                            : 'error'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{record.remarks || '-'}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleOpenPaymentDialog(record)}>
                                                <EditIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* 到期提醒頁籤 */}
            {tabValue === 2 && (
                <Box>
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            onClick={() => handleSendReminders(
                                expirationReminders
                                    .filter(r => r.status === '即將到期' && !r.reminderSent)
                                    .map(r => r.id)
                            )}
                        >
                            發送提醒通知
                        </Button>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>會員編號</TableCell>
                                    <TableCell>會員姓名</TableCell>
                                    <TableCell>會員類型</TableCell>
                                    <TableCell>到期日期</TableCell>
                                    <TableCell>剩餘天數</TableCell>
                                    <TableCell>狀態</TableCell>
                                    <TableCell>最後提醒日期</TableCell>
                                    <TableCell>操作</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {expirationReminders.map((reminder) => (
                                    <TableRow key={reminder.id}>
                                        <TableCell>{reminder.memberId}</TableCell>
                                        <TableCell>{reminder.memberName}</TableCell>
                                        <TableCell>{reminder.memberType}</TableCell>
                                        <TableCell>{format(new Date(reminder.expirationDate), 'yyyy/MM/dd')}</TableCell>
                                        <TableCell>{reminder.daysRemaining}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={reminder.status}
                                                color={
                                                    reminder.status === '正常'
                                                        ? 'success'
                                                        : reminder.status === '即將到期'
                                                            ? 'warning'
                                                            : 'error'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {reminder.lastReminderDate
                                                ? format(new Date(reminder.lastReminderDate), 'yyyy/MM/dd')
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleSendReminders([reminder.id])}
                                                disabled={reminder.reminderSent}
                                            >
                                                <SendIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* 收費設定對話框 */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedMember ? '編輯收費設定' : '新增收費設定'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="會員編號"
                                name="memberId"
                                defaultValue={selectedMember?.memberId}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="會員姓名"
                                name="memberName"
                                defaultValue={selectedMember?.memberName}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="會員類型"
                                name="memberType"
                                defaultValue={selectedMember?.memberType || '一般會員'}
                                onChange={(e) => {
                                    const form = e.target.form;
                                    if (form) {
                                        const feeInput = form.elements.namedItem('annualFee') as HTMLInputElement;
                                        feeInput.value = DEFAULT_FEE_SETTINGS[e.target.value as keyof typeof DEFAULT_FEE_SETTINGS].toString();
                                    }
                                }}
                            >
                                <MenuItem value="一般會員">一般會員</MenuItem>
                                <MenuItem value="商務會員">商務會員</MenuItem>
                                <MenuItem value="終身會員">終身會員</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="年費金額"
                                name="annualFee"
                                defaultValue={selectedMember?.annualFee || DEFAULT_FEE_SETTINGS['一般會員']}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
                                <DatePicker
                                    label="起始日期"
                                    defaultValue={selectedMember?.startDate ? new Date(selectedMember.startDate) : null}
                                    format="yyyy/MM/dd"
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
                                <DatePicker
                                    label="結束日期"
                                    defaultValue={selectedMember?.endDate ? new Date(selectedMember.endDate) : null}
                                    format="yyyy/MM/dd"
                                />
                            </LocalizationProvider>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>取消</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            const formElement = document.querySelector('form');
                            if (formElement) {
                                const formData = new FormData(formElement);
                                handleSaveFeeSettings(Object.fromEntries(formData) as unknown as FeeSettings);
                            }
                        }}
                    >
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 收款記錄對話框 */}
            <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedPayment ? '編輯收款記錄' : '新增收款記錄'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="會員"
                                name="memberId"
                                defaultValue={selectedPayment?.memberId}
                            >
                                {feeSettings.map(setting => (
                                    <MenuItem key={setting.memberId} value={setting.memberId}>
                                        {setting.memberName} ({setting.memberId})
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="年度"
                                name="year"
                                defaultValue={selectedPayment?.year || new Date().getFullYear()}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="金額"
                                name="amount"
                                defaultValue={selectedPayment?.amount}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhTW}>
                                <DatePicker
                                    label="收款日期"
                                    defaultValue={selectedPayment?.paymentDate ? new Date(selectedPayment.paymentDate) : null}
                                    format="yyyy/MM/dd"
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="備註"
                                name="remarks"
                                defaultValue={selectedPayment?.remarks}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePaymentDialog}>取消</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            const formElement = document.querySelector('form');
                            if (formElement) {
                                const formData = new FormData(formElement);
                                handleSavePaymentRecord(Object.fromEntries(formData) as unknown as PaymentRecord);
                            }
                        }}
                    >
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 提示訊息 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FeeManagement; 