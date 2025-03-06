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

interface RentalPaymentTabProps {
    investments: Investment[];
}

const RentalPaymentTab: React.FC<RentalPaymentTabProps> = ({ investments }) => {
    const [rentalPayments, setRentalPayments] = useState<RentalPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<RentalPayment | null>(null);
    const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
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
        if (!window.confirm(`確定要生成 ${yearFilter} 年度的租金收款項目？`)) return;

        setLoading(true);
        try {
            await Promise.all(investments.map(investment =>
                ApiService.generateRentalPayments(investment.id, yearFilter)
            ));
            await loadData();
        } catch (err) {
            setError('生成租金收款項目失敗');
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
        </Box>
    );
};

export default RentalPaymentTab; 