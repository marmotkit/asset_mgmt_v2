import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import { RentalPayment, PaymentMethod, PaymentStatus } from '../../../types/payment';
import dayjs from 'dayjs';

interface PaymentDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (payment: Partial<RentalPayment>) => Promise<void>;
    payment: RentalPayment | null;
    defaultAmount?: number;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
    open,
    onClose,
    onSave,
    payment,
    defaultAmount = 0
}) => {
    const [formData, setFormData] = useState<Partial<RentalPayment>>({
        amount: defaultAmount,
        dueDate: dayjs().format('YYYY-MM-DD'),
        status: 'pending' as PaymentStatus,
        paymentMethod: 'transfer' as PaymentMethod,
        notes: ''
    });

    useEffect(() => {
        if (payment) {
            setFormData({
                ...payment,
                dueDate: dayjs(payment.dueDate).format('YYYY-MM-DD'),
                paidDate: payment.paidDate ? dayjs(payment.paidDate).format('YYYY-MM-DD') : undefined
            });
        } else {
            setFormData({
                amount: defaultAmount,
                dueDate: dayjs().format('YYYY-MM-DD'),
                status: 'pending',
                paymentMethod: 'transfer',
                notes: ''
            });
        }
    }, [payment, defaultAmount]);

    const handleSubmit = async () => {
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('保存付款記錄失敗:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {payment ? '編輯付款記錄' : '新增付款記錄'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="金額"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({
                                ...formData,
                                amount: Number(e.target.value)
                            })}
                            InputProps={{
                                inputProps: { min: 0 }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="到期日"
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({
                                ...formData,
                                dueDate: e.target.value
                            })}
                            InputLabelProps={{
                                shrink: true
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>付款方式</InputLabel>
                            <Select
                                label="付款方式"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    paymentMethod: e.target.value as PaymentMethod
                                })}
                            >
                                <MenuItem value="cash">現金</MenuItem>
                                <MenuItem value="bank_transfer">銀行轉帳</MenuItem>
                                <MenuItem value="credit_card">信用卡</MenuItem>
                                <MenuItem value="check">支票</MenuItem>
                                <MenuItem value="transfer">轉帳</MenuItem>
                                <MenuItem value="other">其他</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="備註"
                            multiline
                            rows={4}
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                notes: e.target.value
                            })}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={handleSubmit} color="primary">
                    確認
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentDialog;
