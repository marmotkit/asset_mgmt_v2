import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    IconButton,
    Tooltip,
    Chip,
} from '@mui/material';
import { Print as PrintIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Investment } from '../../../types/investment';
import { RentalPayment, PaymentStatus } from '../../../types/rental';
import { ApiService } from '../../../services';
import { formatCurrency } from '../../../utils/format';
import { useSnackbar } from 'notistack';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';

// 發票類型枚舉
enum InvoiceType {
    INVOICE2 = 'invoice2',
    INVOICE3 = 'invoice3',
    RECEIPT = 'receipt',
}

interface InvoiceTabProps {
    investments: Investment[];
}

interface InvoiceFormData {
    type: InvoiceType;
    paymentId: string;
    buyerName: string;
    buyerTaxId?: string;
    amount: number;
    itemName: string;
    date: string;
    copies: number;
    note?: string;
    investmentId: string;
}

const InvoiceTab: React.FC<InvoiceTabProps> = ({ investments }) => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [rentalPayments, setRentalPayments] = useState<RentalPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<RentalPayment | null>(null);
    const [formData, setFormData] = useState<InvoiceFormData>({
        type: InvoiceType.RECEIPT,
        paymentId: '',
        buyerName: '',
        buyerTaxId: '',
        amount: 0,
        itemName: '租金收入',
        date: new Date().toISOString().split('T')[0],
        copies: 1,
        note: '',
        investmentId: ''
    });
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [selectedYear]);

    const loadData = async () => {
        setLoading(true);
        try {
            const payments = await ApiService.getRentalPayments(undefined, selectedYear);
            const paidPayments = payments.filter(p => p.status === PaymentStatus.PAID);

            // 載入所有發票資訊
            const allInvoices = await ApiService.getInvoices();

            // 為每個付款項目添加發票資訊
            const paymentsWithInvoices = paidPayments.map(payment => {
                const paymentInvoices = allInvoices.filter(inv => inv.paymentId === payment.id);
                return {
                    ...payment,
                    invoices: paymentInvoices
                };
            });

            setRentalPayments(paymentsWithInvoices);
        } catch (err) {
            setError('載入資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInvoice = async (payment: RentalPayment) => {
        setSelectedPayment(payment);
        setTypeDialogOpen(true);
    };

    const handleTypeSelect = async (type: InvoiceType) => {
        if (!selectedPayment) return;
        setTypeDialogOpen(false);

        try {
            // 獲取最新的租賃標準資訊
            const standards = await ApiService.getRentalStandards(selectedPayment.investmentId);

            // 創建付款日期
            const paymentDate = new Date(selectedPayment.year, selectedPayment.month - 1, 1);

            // 查找適用的租賃標準
            const applicableStandard = standards.find(s => {
                const startDate = new Date(s.startDate);
                const endDate = s.endDate ? new Date(s.endDate) : new Date('9999-12-31');
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
                renterInfo.renterName = latestStandard.renterName || '';
                renterInfo.renterTaxId = latestStandard.renterTaxId || '';
            }

            // 設置表單資料
            setFormData({
                type: type,
                paymentId: selectedPayment.id,
                buyerName: selectedPayment.renterName || renterInfo.renterName,
                buyerTaxId: selectedPayment.renterTaxId || renterInfo.renterTaxId,
                amount: selectedPayment.amount,
                itemName: '租金收入',
                date: new Date().toISOString().split('T')[0],
                copies: 1,
                note: `${selectedPayment.year}年${selectedPayment.month}月租金`,
                investmentId: selectedPayment.investmentId
            });
            setDialogOpen(true);
        } catch (error) {
            console.error('載入租賃標準資訊失敗:', error);
            // 如果無法載入租賃標準，仍然顯示現有資訊
            setFormData({
                type: type,
                paymentId: selectedPayment.id,
                buyerName: selectedPayment.renterName || '',
                buyerTaxId: selectedPayment.renterTaxId || '',
                amount: selectedPayment.amount,
                itemName: '租金收入',
                date: new Date().toISOString().split('T')[0],
                copies: 1,
                note: `${selectedPayment.year}年${selectedPayment.month}月租金`,
                investmentId: selectedPayment.investmentId
            });
            setDialogOpen(true);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedPayment(null);
    };

    const handleFormSubmit = async () => {
        try {
            if (!selectedPayment) return;

            // 檢查必填欄位
            if (!formData.buyerName) {
                enqueueSnackbar('請輸入買受人名稱', { variant: 'error' });
                return;
            }

            if (formData.type !== InvoiceType.RECEIPT && !formData.buyerTaxId) {
                enqueueSnackbar('請輸入統一編號', { variant: 'error' });
                return;
            }

            // 建立發票
            await ApiService.createInvoice({
                type: formData.type,
                paymentId: formData.paymentId,
                buyerName: formData.buyerName,
                buyerTaxId: formData.buyerTaxId,
                amount: formData.amount,
                itemName: formData.itemName,
                date: formData.date,
                note: formData.note,
                investmentId: formData.investmentId
            });

            enqueueSnackbar('發票建立成功', { variant: 'success' });
            handleDialogClose();
            loadData(); // 重新載入資料
        } catch (err) {
            enqueueSnackbar('發票建立失敗', { variant: 'error' });
        }
    };

    const handlePrint = async (payment: RentalPayment, invoiceId: string, type: string) => {
        try {
            // 導航到列印頁面
            navigate(`/investment/invoice/print/${invoiceId}`);
        } catch (err) {
            enqueueSnackbar('列印失敗', { variant: 'error' });
        }
    };

    const handleDeleteInvoice = async (invoiceId: string) => {
        try {
            if (window.confirm('確定要刪除此發票/收據嗎？')) {
                await ApiService.deleteInvoice(invoiceId);
                enqueueSnackbar('刪除成功', { variant: 'success' });
                loadData(); // 重新載入資料
            }
        } catch (err) {
            enqueueSnackbar('刪除失敗', { variant: 'error' });
        }
    };

    const handleSelectChange = (field: keyof InvoiceFormData) => (
        event: SelectChangeEvent
    ) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
    };

    const handleTextChange = (field: keyof InvoiceFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [field]: event.target.value
        });
    };

    const handleNumberChange = (field: keyof InvoiceFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({
            ...formData,
            [field]: Number(event.target.value)
        });
    };

    const getInvestmentName = (investmentId: string) => {
        const investment = investments.find(inv => inv.id === investmentId);
        return investment ? investment.name : '未知項目';
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">發票管理</Typography>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="year-select-label">年度</InputLabel>
                    <Select
                        labelId="year-select-label"
                        id="year-select"
                        value={selectedYear}
                        label="年度"
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>投資項目</TableCell>
                            <TableCell>年月</TableCell>
                            <TableCell>金額</TableCell>
                            <TableCell>發票狀態</TableCell>
                            <TableCell>已開立類型</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rentalPayments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    無資料
                                </TableCell>
                            </TableRow>
                        ) : (
                            rentalPayments.map((payment: any) => {
                                const hasInvoice = payment.hasInvoice;
                                const invoiceTypes = payment.invoices ? payment.invoices.map((inv: any) => inv.type) : [];
                                const canCreateInvoice2 = !invoiceTypes.includes(InvoiceType.INVOICE2);
                                const canCreateInvoice3 = !invoiceTypes.includes(InvoiceType.INVOICE3);
                                const canCreateReceipt = !invoiceTypes.includes(InvoiceType.RECEIPT);

                                return (
                                    <TableRow key={payment.id}>
                                        <TableCell>{getInvestmentName(payment.investmentId)}</TableCell>
                                        <TableCell>{`${payment.year}年${payment.month}月`}</TableCell>
                                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell>
                                            {hasInvoice ? '已開立' : '未開立'}
                                        </TableCell>
                                        <TableCell>
                                            {invoiceTypes.length > 0 ? (
                                                <Box>
                                                    {invoiceTypes.map((type: string) => (
                                                        <Chip
                                                            key={type}
                                                            label={
                                                                type === InvoiceType.INVOICE2 ? '二聯式發票' :
                                                                    type === InvoiceType.INVOICE3 ? '三聯式發票' : '收據'
                                                            }
                                                            size="small"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : '無'}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {(canCreateInvoice2 || canCreateInvoice3 || canCreateReceipt) && (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={() => handleCreateInvoice(payment)}
                                                    >
                                                        開立發票/收據
                                                    </Button>
                                                )}

                                                {payment.invoices && payment.invoices.map((invoice: any) => (
                                                    <Box key={invoice.id} sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Tooltip title={`列印${invoice.type === InvoiceType.RECEIPT ? '收據' : '發票'}`}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handlePrint(payment, invoice.id, invoice.type)}
                                                            >
                                                                <PrintIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={`刪除${invoice.type === InvoiceType.RECEIPT ? '收據' : '發票'}`}>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteInvoice(invoice.id)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>開立{formData.type === InvoiceType.RECEIPT ? '收據' : '發票'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel id="invoice-type-label">類型</InputLabel>
                                <Select
                                    labelId="invoice-type-label"
                                    id="invoice-type"
                                    name="type"
                                    value={formData.type}
                                    label="類型"
                                    onChange={handleSelectChange('type')}
                                >
                                    <MenuItem value={InvoiceType.INVOICE2}>二聯式發票</MenuItem>
                                    <MenuItem value={InvoiceType.INVOICE3}>三聯式發票</MenuItem>
                                    <MenuItem value={InvoiceType.RECEIPT}>收據</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="buyer-name"
                                name="buyerName"
                                label="買受人名稱"
                                value={formData.buyerName}
                                onChange={handleTextChange('buyerName')}
                                required
                            />
                        </Grid>
                        {formData.type !== InvoiceType.RECEIPT && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="buyer-tax-id"
                                    name="buyerTaxId"
                                    label="統一編號"
                                    value={formData.buyerTaxId}
                                    onChange={handleTextChange('buyerTaxId')}
                                    required
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="item-name"
                                name="itemName"
                                label="品名"
                                value={formData.itemName}
                                onChange={handleTextChange('itemName')}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="amount"
                                name="amount"
                                label="金額"
                                type="number"
                                value={formData.amount}
                                onChange={handleNumberChange('amount')}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="date"
                                name="date"
                                label="日期"
                                type="date"
                                value={formData.date}
                                onChange={handleTextChange('date')}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="copies"
                                name="copies"
                                label="份數"
                                type="number"
                                value={formData.copies}
                                onChange={handleNumberChange('copies')}
                                required
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="note"
                                name="note"
                                label="備註"
                                multiline
                                rows={3}
                                value={formData.note}
                                onChange={handleTextChange('note')}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>取消</Button>
                    <Button onClick={handleFormSubmit} variant="contained">
                        確認
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 發票類型選擇對話框 */}
            <Dialog open={typeDialogOpen} onClose={() => setTypeDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>選擇開立類型</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {selectedPayment && selectedPayment.invoices && (
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    已開立類型：
                                    {selectedPayment.invoices.map((inv: any) => (
                                        <Chip
                                            key={inv.type}
                                            label={
                                                inv.type === InvoiceType.INVOICE2 ? '二聯式發票' :
                                                    inv.type === InvoiceType.INVOICE3 ? '三聯式發票' : '收據'
                                            }
                                            size="small"
                                            sx={{ ml: 1 }}
                                        />
                                    ))}
                                </Typography>
                            </Grid>
                        )}

                        {selectedPayment && (
                            <>
                                {!selectedPayment.invoices || !selectedPayment.invoices.some(inv => inv.type === InvoiceType.INVOICE2) ? (
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => handleTypeSelect(InvoiceType.INVOICE2)}
                                        >
                                            二聯式發票
                                        </Button>
                                    </Grid>
                                ) : null}

                                {!selectedPayment.invoices || !selectedPayment.invoices.some(inv => inv.type === InvoiceType.INVOICE3) ? (
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => handleTypeSelect(InvoiceType.INVOICE3)}
                                        >
                                            三聯式發票
                                        </Button>
                                    </Grid>
                                ) : null}

                                {!selectedPayment.invoices || !selectedPayment.invoices.some(inv => inv.type === InvoiceType.RECEIPT) ? (
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => handleTypeSelect(InvoiceType.RECEIPT)}
                                        >
                                            收據
                                        </Button>
                                    </Grid>
                                ) : null}
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTypeDialogOpen(false)}>取消</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InvoiceTab; 