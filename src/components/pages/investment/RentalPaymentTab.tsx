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
    Button,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    Chip,
    FormControlLabel,
    Checkbox,
    Alert,
    DialogContentText,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Investment } from '../../../types/investment';
import { RentalPayment, PaymentStatus, PaymentMethod } from '../../../types/rental';
import { ApiService } from '../../../services';
import { formatCurrency, formatDate } from '../../../utils/format';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import { useSnackbar } from 'notistack';

interface RentalPaymentTabProps {
    investments: Investment[];
}

interface InvestmentSelection {
    id: string;
    name: string;
    selected: boolean;
    hasExistingPayments: boolean;
}

const RentalPaymentTab: React.FC<RentalPaymentTabProps> = ({ investments }) => {
    const [rentalPayments, setRentalPayments] = useState<RentalPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<RentalPayment | null>(null);
    const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
    const { enqueueSnackbar } = useSnackbar();
    const [formData, setFormData] = useState<Partial<RentalPayment>>({
        investmentId: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        amount: 0,
        status: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentDate: '',
        renterName: '',
        payerName: '',
        note: '',
    });

    // 新增投資項目選擇相關狀態
    const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
    const [investmentSelections, setInvestmentSelections] = useState<InvestmentSelection[]>([]);

    // 添加清除對話框狀態
    const [clearDialogOpen, setClearDialogOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [yearFilter, monthFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 載入租金收款資料
            const paymentsData = await ApiService.getRentalPayments(undefined, yearFilter, monthFilter);

            // 載入所有相關的租賃標準
            const investmentIds = Array.from(new Set(paymentsData.map(p => p.investmentId)));
            const standardsPromises = investmentIds.map(
                investmentId => ApiService.getRentalStandards(investmentId)
            );
            const standardsResults = await Promise.all(standardsPromises);
            const standards = standardsResults.reduce((acc, curr) => acc.concat(curr), []);

            // 更新租金收款資料，確保承租人資訊正確
            const updatedPayments = paymentsData.map(payment => {
                const applicableStandard = standards.find(s => {
                    const startDate = new Date(s.startDate);
                    const endDate = s.endDate ? new Date(s.endDate) : new Date('9999-12-31');
                    const paymentDate = new Date(payment.year, payment.month - 1, 1);
                    return s.investmentId === payment.investmentId &&
                        startDate <= paymentDate && paymentDate <= endDate;
                });

                return {
                    ...payment,
                    renterName: payment.renterName || applicableStandard?.renterName || '',
                    renterTaxId: payment.renterTaxId || applicableStandard?.renterTaxId || '',
                    payerName: payment.payerName || payment.renterName || applicableStandard?.renterName || ''
                };
            });

            setRentalPayments(updatedPayments);
        } catch (err) {
            setError('載入資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePayments = async () => {
        // 檢查是否有選擇年度
        if (!yearFilter) {
            enqueueSnackbar('請選擇要生成的年度', { variant: 'error' });
            return;
        }

        try {
            // 載入最新的收款資料以檢查重複
            const existingPayments = await ApiService.getRentalPayments(undefined, yearFilter);

            // 準備投資項目選擇清單
            const selections: InvestmentSelection[] = investments.map(inv => ({
                id: inv.id,
                name: inv.name,
                selected: false,
                hasExistingPayments: existingPayments.some(p => p.investmentId === inv.id)
            }));

            setInvestmentSelections(selections);
            setSelectionDialogOpen(true);
        } catch (err) {
            enqueueSnackbar('生成租金收款項目失敗', { variant: 'error' });
        }
    };

    // 添加清除租金項目的處理函數
    const handleClearPayments = () => {
        setClearDialogOpen(true);
    };

    // 確認清除租金項目
    const handleClearConfirm = async () => {
        try {
            await ApiService.clearRentalPayments(yearFilter, monthFilter);
            enqueueSnackbar(`已清除 ${yearFilter}年${monthFilter ? monthFilter + '月' : ''}的租金項目`, { variant: 'success' });
            await loadData();
        } catch (err) {
            enqueueSnackbar('清除租金項目失敗', { variant: 'error' });
        } finally {
            setClearDialogOpen(false);
        }
    };

    const handleGenerateConfirm = async () => {
        setSelectionDialogOpen(false);
        setLoading(true);
        let hasError = false;
        let errorMessage = '';

        try {
            // 取得選擇的投資項目
            const selectedInvestments = investmentSelections.filter(inv => inv.selected);

            // 依序處理每個選擇的投資項目
            for (const inv of selectedInvestments) {
                try {
                    await ApiService.generateRentalPayments(inv.id, yearFilter);
                } catch (error) {
                    hasError = true;
                    errorMessage += `${inv.name}: ${error instanceof Error ? error.message : '生成失敗'}\n`;
                }
            }

            if (hasError) {
                enqueueSnackbar(errorMessage, { variant: 'warning' });
            } else {
                enqueueSnackbar('租金收款項目生成完成', { variant: 'success' });
            }

            await loadData();
        } catch (error) {
            enqueueSnackbar('生成租金收款項目時發生錯誤', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditPayment = async (payment: RentalPayment) => {
        try {
            // 獲取最新的租賃標準資訊
            const standards = await ApiService.getRentalStandards(payment.investmentId);
            console.log('所有租賃標準:', standards);

            // 創建付款日期
            const paymentDate = new Date(payment.year, payment.month - 1, 1);
            console.log('付款日期:', paymentDate);

            // 查找適用的租賃標準
            const applicableStandard = standards.find(s => {
                const startDate = new Date(s.startDate);
                const endDate = s.endDate ? new Date(s.endDate) : new Date('9999-12-31');
                console.log('比較日期:', {
                    標準ID: s.id,
                    標準開始日期: startDate,
                    標準結束日期: endDate,
                    付款日期: paymentDate,
                    是否適用: startDate <= paymentDate && paymentDate <= endDate
                });
                return startDate <= paymentDate && paymentDate <= endDate;
            });

            // 如果沒有找到適用的標準，使用最新的標準
            let renterInfo = {
                renterName: '',
                renterTaxId: ''
            };

            if (applicableStandard) {
                renterInfo.renterName = applicableStandard.renterName || '';
                renterInfo.renterTaxId = applicableStandard.renterTaxId || '';
            } else if (standards.length > 0) {
                // 如果沒有找到適用的標準，使用最新的標準
                const latestStandard = standards.sort((a, b) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                )[0];
                console.log('使用最新的標準:', latestStandard);
                renterInfo.renterName = latestStandard.renterName || '';
                renterInfo.renterTaxId = latestStandard.renterTaxId || '';
            }

            console.log('最終承租人資訊:', {
                payment,
                applicableStandard,
                renterInfo,
                renterName: payment.renterName || renterInfo.renterName
            });

            setSelectedPayment(payment);
            setFormData({
                ...payment, // 保留所有原始資料
                paymentMethod: payment.paymentMethod || PaymentMethod.BANK_TRANSFER,
                paymentDate: payment.paymentDate || '',
                renterName: payment.renterName || renterInfo.renterName,
                renterTaxId: payment.renterTaxId || renterInfo.renterTaxId,
                payerName: payment.payerName || payment.renterName || renterInfo.renterName,
                note: payment.note || ''
            });
            setDialogOpen(true);
        } catch (error) {
            console.error('載入租賃標準資訊失敗:', error);
            // 如果無法載入租賃標準，仍然顯示現有資訊
            setSelectedPayment(payment);
            setFormData({
                ...payment, // 保留所有原始資料
                paymentMethod: payment.paymentMethod || PaymentMethod.BANK_TRANSFER,
                paymentDate: payment.paymentDate || '',
                renterName: payment.renterName || '',
                renterTaxId: payment.renterTaxId || '',
                payerName: payment.payerName || payment.renterName || '',
                note: payment.note || ''
            });
            setDialogOpen(true);
        }
    };

    const handleSave = async () => {
        if (!formData.investmentId || !formData.amount || !formData.status) {
            setError('請填寫必要欄位');
            return;
        }

        setLoading(true);
        try {
            if (selectedPayment) {
                await ApiService.updateRentalPayment(selectedPayment.id, formData);
            }
            await loadData();
            setDialogOpen(false);
        } catch (err) {
            setError('儲存租金收款項目失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof typeof formData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
    };

    const handleSelectChange = (field: keyof typeof formData) => (
        event: SelectChangeEvent
    ) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
    };

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID:
                return 'success';
            case PaymentStatus.PENDING:
                return 'warning';
            case PaymentStatus.OVERDUE:
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusText = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID:
                return '已收款';
            case PaymentStatus.PENDING:
                return '待收款';
            case PaymentStatus.OVERDUE:
                return '逾期';
            default:
                return '未知';
        }
    };

    const handleDeletePayment = async (payment: RentalPayment) => {
        if (!window.confirm('確定要刪除此筆租金收款項目？')) return;

        setLoading(true);
        try {
            await ApiService.deleteRentalPayment(payment.id);
            await loadData();
        } catch (err) {
            setError('刪除租金收款項目失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectionChange = (investmentId: string) => {
        setInvestmentSelections(prev =>
            prev.map(inv =>
                inv.id === investmentId
                    ? { ...inv, selected: !inv.selected }
                    : inv
            )
        );
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">租金收款管理</Typography>
                <Box>
                    <FormControl sx={{ mr: 2, minWidth: 100 }}>
                        <InputLabel id="year-filter-label" htmlFor="year-filter">年度</InputLabel>
                        <Select
                            labelId="year-filter-label"
                            id="year-filter"
                            name="year-filter"
                            value={yearFilter.toString()}
                            label="年度"
                            onChange={(e) => setYearFilter(Number(e.target.value))}
                            inputProps={{
                                'aria-labelledby': 'year-filter-label'
                            }}
                        >
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                                <MenuItem
                                    key={year}
                                    value={year}
                                    id={`year-option-${year}`}
                                >
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ mr: 2, minWidth: 100 }}>
                        <InputLabel id="month-filter-label" htmlFor="month-filter">月份</InputLabel>
                        <Select
                            labelId="month-filter-label"
                            id="month-filter"
                            name="month-filter"
                            value={monthFilter.toString()}
                            label="月份"
                            onChange={(e) => setMonthFilter(Number(e.target.value))}
                            inputProps={{
                                'aria-labelledby': 'month-filter-label'
                            }}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <MenuItem
                                    key={month}
                                    value={month}
                                    id={`month-option-${month}`}
                                >
                                    {month}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={handleGeneratePayments}
                        sx={{ mr: 1 }}
                        aria-label="生成收款項目"
                    >
                        生成收款項目
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleClearPayments}
                    >
                        清除租金項目
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>投資項目</TableCell>
                            <TableCell>年月</TableCell>
                            <TableCell align="right">租金金額</TableCell>
                            <TableCell>收款狀態</TableCell>
                            <TableCell>收款方式</TableCell>
                            <TableCell>收款日期</TableCell>
                            <TableCell>承租人</TableCell>
                            <TableCell>繳款人</TableCell>
                            <TableCell>備註</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rentalPayments.map((payment) => {
                            const investment = investments.find(
                                (inv) => inv.id === payment.investmentId
                            );
                            return (
                                <TableRow key={payment.id}>
                                    <TableCell>{investment?.name || '未知項目'}</TableCell>
                                    <TableCell>{`${payment.year}年${payment.month}月`}</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(payment.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusText(payment.status)}
                                            color={getStatusColor(payment.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {payment.paymentMethod === PaymentMethod.CASH ? '現金' :
                                            payment.paymentMethod === PaymentMethod.BANK_TRANSFER ? '銀行轉帳' :
                                                payment.paymentMethod === PaymentMethod.CHECK ? '支票' : '其他'}
                                    </TableCell>
                                    <TableCell>
                                        {payment.paymentDate ? formatDate(payment.paymentDate) : '-'}
                                    </TableCell>
                                    <TableCell>{payment.renterName || '-'}</TableCell>
                                    <TableCell>{payment.payerName || payment.renterName || '-'}</TableCell>
                                    <TableCell>{payment.note || '-'}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditPayment(payment)}
                                            aria-label={`編輯 ${investment?.name || '未知項目'} ${payment.year}年${payment.month}月 的收款項目`}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeletePayment(payment)}
                                            color="error"
                                            aria-label={`刪除 ${investment?.name || '未知項目'} ${payment.year}年${payment.month}月 的收款項目`}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {rentalPayments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    尚無租金收款資料
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                aria-labelledby="edit-rental-payment-title"
                disableEnforceFocus
                keepMounted={false}
            >
                <DialogTitle id="edit-rental-payment-title">
                    編輯租金收款項目
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required disabled>
                                <InputLabel id="rental-investment-label" htmlFor="rental-investment">投資項目</InputLabel>
                                <Select
                                    labelId="rental-investment-label"
                                    id="rental-investment"
                                    name="investmentId"
                                    value={formData.investmentId}
                                    label="投資項目"
                                    onChange={handleSelectChange('investmentId')}
                                    inputProps={{
                                        'aria-labelledby': 'rental-investment-label'
                                    }}
                                >
                                    {investments.map((investment) => (
                                        <MenuItem
                                            key={investment.id}
                                            value={investment.id}
                                            id={`investment-option-${investment.id}`}
                                        >
                                            {investment.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="rental-year"
                                name="year"
                                label="年度"
                                value={formData.year}
                                disabled
                                InputLabelProps={{
                                    htmlFor: "rental-year"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="rental-month"
                                name="month"
                                label="月份"
                                value={formData.month}
                                disabled
                                InputLabelProps={{
                                    htmlFor: "rental-month"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="rental-amount"
                                name="amount"
                                label="租金金額"
                                type="number"
                                value={formData.amount}
                                onChange={handleInputChange('amount')}
                                required
                                InputLabelProps={{
                                    htmlFor: "rental-amount"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel id="rental-status-label" htmlFor="rental-status">收款狀態</InputLabel>
                                <Select
                                    labelId="rental-status-label"
                                    id="rental-status"
                                    name="status"
                                    value={formData.status}
                                    label="收款狀態"
                                    onChange={handleSelectChange('status')}
                                    inputProps={{
                                        'aria-labelledby': 'rental-status-label'
                                    }}
                                >
                                    <MenuItem value={PaymentStatus.PENDING} id="status-option-pending">待收款</MenuItem>
                                    <MenuItem value={PaymentStatus.PAID} id="status-option-paid">已收款</MenuItem>
                                    <MenuItem value={PaymentStatus.OVERDUE} id="status-option-overdue">逾期</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="rental-payment-method-label" htmlFor="rental-payment-method">收款方式</InputLabel>
                                <Select
                                    labelId="rental-payment-method-label"
                                    id="rental-payment-method"
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
                                    label="收款方式"
                                    onChange={handleSelectChange('paymentMethod')}
                                    inputProps={{
                                        'aria-labelledby': 'rental-payment-method-label'
                                    }}
                                >
                                    <MenuItem value={PaymentMethod.CASH} id="payment-method-option-cash">現金</MenuItem>
                                    <MenuItem value={PaymentMethod.BANK_TRANSFER} id="payment-method-option-bank">銀行轉帳</MenuItem>
                                    <MenuItem value={PaymentMethod.CHECK} id="payment-method-option-check">支票</MenuItem>
                                    <MenuItem value={PaymentMethod.OTHER} id="payment-method-option-other">其他</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="rental-payment-date"
                                name="paymentDate"
                                label="收款日期"
                                type="date"
                                value={formData.paymentDate}
                                onChange={handleInputChange('paymentDate')}
                                InputLabelProps={{
                                    shrink: true,
                                    htmlFor: "rental-payment-date"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="rental-renter-name"
                                name="renterName"
                                label="承租人"
                                value={formData.renterName}
                                disabled
                                InputLabelProps={{
                                    htmlFor: "rental-renter-name"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="rental-payer-name"
                                name="payerName"
                                label="繳款人"
                                value={formData.payerName}
                                onChange={handleInputChange('payerName')}
                                placeholder="預設同承租人"
                                InputLabelProps={{
                                    htmlFor: "rental-payer-name"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="rental-note"
                                name="note"
                                label="備註"
                                multiline
                                rows={3}
                                value={formData.note}
                                onChange={handleInputChange('note')}
                                InputLabelProps={{
                                    htmlFor: "rental-note"
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDialogOpen(false)}
                        aria-label="取消編輯"
                        tabIndex={0}
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        aria-label="儲存變更"
                        tabIndex={0}
                    >
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 清除租金項目確認對話框 */}
            <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
                <DialogTitle>確認清除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        確定要清除 {yearFilter}年{monthFilter ? monthFilter + '月' : ''}的所有租金項目嗎？此操作無法復原。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearDialogOpen(false)}>取消</Button>
                    <Button onClick={handleClearConfirm} color="error">
                        確認清除
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 投資項目選擇對話框 */}
            <Dialog
                open={selectionDialogOpen}
                onClose={() => setSelectionDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                aria-labelledby="select-investments-title"
                disableEnforceFocus
                keepMounted={false}
            >
                <DialogTitle id="select-investments-title">
                    選擇要生成收款項目的投資項目
                </DialogTitle>
                <DialogContent>
                    {investmentSelections.map((inv) => (
                        <Box key={inv.id} sx={{ mb: 1 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        id={`investment-selection-${inv.id}`}
                                        name={`investment-selection-${inv.id}`}
                                        checked={inv.selected}
                                        onChange={() => handleSelectionChange(inv.id)}
                                        disabled={inv.hasExistingPayments}
                                    />
                                }
                                label={inv.name}
                                htmlFor={`investment-selection-${inv.id}`}
                            />
                            {inv.hasExistingPayments && (
                                <Typography variant="caption" color="error" component="span">
                                    （已存在收款項目）
                                </Typography>
                            )}
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setSelectionDialogOpen(false)}
                        aria-label="取消選擇"
                        tabIndex={0}
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleGenerateConfirm}
                        variant="contained"
                        disabled={!investmentSelections.some(inv => inv.selected)}
                        aria-label="確認生成選擇的收款項目"
                        tabIndex={0}
                    >
                        生成
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RentalPaymentTab; 