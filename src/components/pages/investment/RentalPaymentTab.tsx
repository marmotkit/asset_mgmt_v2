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
        note: '',
    });

    // 新增投資項目選擇相關狀態
    const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
    const [investmentSelections, setInvestmentSelections] = useState<InvestmentSelection[]>([]);

    useEffect(() => {
        loadData();
    }, [yearFilter, monthFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [investmentsData, paymentsData] = await Promise.all([
                ApiService.getInvestments(),
                ApiService.getRentalPayments(undefined, yearFilter, monthFilter),
            ]);
            setRentalPayments(paymentsData);
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

    const handleEditPayment = (payment: RentalPayment) => {
        setSelectedPayment(payment);
        setFormData({
            investmentId: payment.investmentId,
            year: payment.year,
            month: payment.month,
            amount: payment.amount,
            status: payment.status,
            paymentMethod: payment.paymentMethod || PaymentMethod.BANK_TRANSFER,
            paymentDate: payment.paymentDate || '',
            note: payment.note || '',
        });
        setDialogOpen(true);
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
                        <InputLabel>年度</InputLabel>
                        <Select
                            value={yearFilter.toString()}
                            label="年度"
                            onChange={(e) => setYearFilter(Number(e.target.value))}
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ mr: 2, minWidth: 100 }}>
                        <InputLabel>月份</InputLabel>
                        <Select
                            value={monthFilter.toString()}
                            label="月份"
                            onChange={(e) => setMonthFilter(Number(e.target.value))}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <MenuItem key={month} value={month}>
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
                    >
                        生成收款項目
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
                                    <TableCell>{payment.note || '-'}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditPayment(payment)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeletePayment(payment)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {rentalPayments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    尚無租金收款資料
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    編輯租金收款項目
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="投資項目"
                                value={formData.investmentId}
                                onChange={handleInputChange('investmentId')}
                                required
                                disabled
                            >
                                {investments.map((investment) => (
                                    <MenuItem key={investment.id} value={investment.id}>
                                        {investment.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="年度"
                                value={formData.year}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="月份"
                                value={formData.month}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="租金金額"
                                type="number"
                                value={formData.amount}
                                onChange={handleInputChange('amount')}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>收款狀態</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="收款狀態"
                                    onChange={handleSelectChange('status')}
                                >
                                    <MenuItem value={PaymentStatus.PENDING}>待收款</MenuItem>
                                    <MenuItem value={PaymentStatus.PAID}>已收款</MenuItem>
                                    <MenuItem value={PaymentStatus.OVERDUE}>逾期</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>收款方式</InputLabel>
                                <Select
                                    value={formData.paymentMethod}
                                    label="收款方式"
                                    onChange={handleSelectChange('paymentMethod')}
                                >
                                    <MenuItem value={PaymentMethod.CASH}>現金</MenuItem>
                                    <MenuItem value={PaymentMethod.BANK_TRANSFER}>銀行轉帳</MenuItem>
                                    <MenuItem value={PaymentMethod.CHECK}>支票</MenuItem>
                                    <MenuItem value={PaymentMethod.OTHER}>其他</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="收款日期"
                                type="date"
                                value={formData.paymentDate}
                                onChange={handleInputChange('paymentDate')}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="備註"
                                multiline
                                rows={3}
                                value={formData.note}
                                onChange={handleInputChange('note')}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>取消</Button>
                    <Button onClick={handleSave} variant="contained">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 投資項目選擇對話框 */}
            <Dialog
                open={selectionDialogOpen}
                onClose={() => setSelectionDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>選擇要生成收款項目的投資項目</DialogTitle>
                <DialogContent>
                    {investmentSelections.map((inv) => (
                        <Box key={inv.id} sx={{ mb: 1 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={inv.selected}
                                        onChange={() => handleSelectionChange(inv.id)}
                                        disabled={inv.hasExistingPayments}
                                    />
                                }
                                label={inv.name}
                            />
                            {inv.hasExistingPayments && (
                                <Typography variant="caption" color="error">
                                    （已存在收款項目）
                                </Typography>
                            )}
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectionDialogOpen(false)}>取消</Button>
                    <Button
                        onClick={handleGenerateConfirm}
                        variant="contained"
                        disabled={!investmentSelections.some(inv => inv.selected)}
                    >
                        生成
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RentalPaymentTab; 