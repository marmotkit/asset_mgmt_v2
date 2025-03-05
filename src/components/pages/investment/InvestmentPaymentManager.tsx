import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    TextField,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Investment, LeaseItem, RentalPayment } from '../../../types/investment';
import { ApiService } from '../../../services/api.service';
import PaymentDialog from './PaymentDialog';
import dayjs from 'dayjs';

interface InvestmentPaymentManagerProps {
    open: boolean;
    onClose: () => void;
    investment: Investment;
    leaseItem: LeaseItem;
}

const InvestmentPaymentManager: React.FC<InvestmentPaymentManagerProps> = ({
    open,
    onClose,
    investment,
    leaseItem,
}) => {
    const [selectedPayment, setSelectedPayment] = useState<RentalPayment | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payments, setPayments] = useState<RentalPayment[]>([]);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const fetchedPayments = await ApiService.getRentalPayments(investment.id, leaseItem.id);
            setPayments(fetchedPayments);
        } catch (error) {
            console.error('載入付款記錄失敗:', error);
            setError('載入付款記錄時發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, [investment.id, leaseItem.id]);

    const handleEditPayment = (payment: RentalPayment) => {
        setSelectedPayment(payment);
        setPaymentDialogOpen(true);
    };

    const handleUpdatePayment = async (payment: RentalPayment) => {
        try {
            setLoading(true);
            await ApiService.updateRentalPayment(investment.id, leaseItem.id, payment);
            await loadPayments();
        } catch (error) {
            console.error('更新付款記錄失敗:', error);
            setError('更新付款記錄時發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = async (payment: Partial<RentalPayment>) => {
        try {
            setLoading(true);
            const newPayment: RentalPayment = {
                id: crypto.randomUUID(),
                leaseItemId: leaseItem.id,
                amount: payment.amount || 0,
                dueDate: payment.dueDate || dayjs().format('YYYY-MM-DD'),
                status: payment.status || 'pending',
                paymentMethod: payment.paymentMethod || 'transfer',
                notes: payment.notes,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                paidDate: payment.paidDate
            };
            await ApiService.createRentalPayment(investment.id, leaseItem.id, newPayment);
            await loadPayments();
            setPaymentDialogOpen(false);
        } catch (error) {
            console.error('新增付款記錄失敗:', error);
            setError('新增付款記錄時發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setSelectedPayment(null);
        setPaymentDialogOpen(false);
    };

    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: '待收款',
            received: '已收款',
            delayed: '逾期'
        };
        return statusMap[status] || status;
    };

    const getPaymentMethodText = (method?: string) => {
        if (!method) return '-';
        const methodMap: Record<string, string> = {
            cash: '現金',
            bank_transfer: '銀行轉帳',
            credit_card: '信用卡',
            check: '支票',
            transfer: '轉帳',
            other: '其他'
        };
        return methodMap[method] || method;
    };

    const amount = leaseItem.rentalAmount;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>租金收款管理</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        租賃項目：{leaseItem.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        每月租金：NT$ {leaseItem.rentalAmount.toLocaleString()}
                    </Typography>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>應收日期</TableCell>
                                <TableCell align="right">應收金額</TableCell>
                                <TableCell>狀態</TableCell>
                                <TableCell>收款方式</TableCell>
                                <TableCell>實際收款日期</TableCell>
                                <TableCell>備註</TableCell>
                                <TableCell>操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{dayjs(payment.dueDate).format('YYYY/MM/DD')}</TableCell>
                                    <TableCell align="right">
                                        NT$ {payment.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{getStatusText(payment.status)}</TableCell>
                                    <TableCell>{getPaymentMethodText(payment.paymentMethod)}</TableCell>
                                    <TableCell>
                                        {payment.paidDate
                                            ? dayjs(payment.paidDate).format('YYYY/MM/DD')
                                            : '-'}
                                    </TableCell>
                                    <TableCell>{payment.notes || '-'}</TableCell>
                                    <TableCell>
                                        <Tooltip title="編輯">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditPayment(payment)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>關閉</Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        setSelectedPayment(null);
                        setPaymentDialogOpen(true);
                    }}
                >
                    新增收款記錄
                </Button>
            </DialogActions>

            <PaymentDialog
                open={paymentDialogOpen}
                onClose={handleCloseDialog}
                onSave={handleAddPayment}
                payment={selectedPayment}
                defaultAmount={leaseItem.rentalAmount}
            />
        </Dialog>
    );
};

export default InvestmentPaymentManager;