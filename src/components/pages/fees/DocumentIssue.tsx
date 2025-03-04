import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Snackbar,
    Alert,
    Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon, Delete as DeleteIcon, Print as PrintIcon } from '@mui/icons-material';
import { Invoice, Receipt, InvoiceItem, InvoiceType } from '../../../types/invoice';
import { invoiceService } from '../../../services/invoiceService';
import { documentService } from '../../../services/documentService';

interface DocumentIssueProps {
    memberId: string;
    memberName: string;
    paymentId: string;
    amount: number;
    onSuccess: () => void;
}

export const DocumentIssue: React.FC<DocumentIssueProps> = ({
    memberId,
    memberName,
    paymentId,
    amount,
    onSuccess
}) => {
    const [open, setOpen] = useState(false);
    const [documentType, setDocumentType] = useState<InvoiceType>('二聯式');
    const [items, setItems] = useState<InvoiceItem[]>([{
        description: '會員年費',
        quantity: 1,
        unitPrice: amount,
        amount: amount
    }]);
    const [buyerInfo, setBuyerInfo] = useState({
        name: '',
        taxId: ''
    });
    const [issueDate, setIssueDate] = useState<Date | null>(new Date());
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const companyInfo = invoiceService.getCompanyInfo();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAddItem = () => {
        setItems([...items, {
            description: '',
            quantity: 1,
            unitPrice: 0,
            amount: 0
        }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? Number(value) : items[index].quantity;
            const unitPrice = field === 'unitPrice' ? Number(value) : items[index].unitPrice;
            newItems[index] = {
                ...newItems[index],
                [field]: Number(value),
                amount: quantity * unitPrice
            };
        } else {
            newItems[index] = {
                ...newItems[index],
                [field]: value
            };
        }
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.amount, 0);
    };

    const calculateTax = () => {
        return Math.round(calculateTotal() * 0.05);
    };

    const handleSubmit = async () => {
        if (!issueDate) {
            setSnackbar({
                open: true,
                message: '請選擇開立日期',
                severity: 'error'
            });
            return;
        }

        try {
            const formattedDate = issueDate.toISOString().split('T')[0];

            if (documentType === '收據') {
                await invoiceService.createReceipt({
                    type: '收據',
                    memberId,
                    memberName,
                    paymentId,
                    payerName: memberName,
                    description: items[0].description,
                    amount: calculateTotal(),
                    date: formattedDate,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } else {
                await invoiceService.createInvoice({
                    type: documentType,
                    memberId,
                    memberName,
                    paymentId,
                    sellerName: companyInfo.name,
                    sellerTaxId: companyInfo.taxId,
                    buyerName: documentType === '三聯式' ? buyerInfo.name : undefined,
                    buyerTaxId: documentType === '三聯式' ? buyerInfo.taxId : undefined,
                    items,
                    amount: calculateTotal(),
                    taxAmount: calculateTax(),
                    date: formattedDate,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            setSnackbar({
                open: true,
                message: '開立成功',
                severity: 'success'
            });
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('開立失敗:', error);
            setSnackbar({
                open: true,
                message: '開立失敗',
                severity: 'error'
            });
        }
    };

    const handlePrint = async (doc: Invoice | Receipt) => {
        try {
            await documentService.printDocument(doc);
        } catch (error) {
            console.error('列印失敗:', error);
            setSnackbar({
                open: true,
                message: '列印失敗',
                severity: 'error'
            });
        }
    };

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                onClick={handleOpen}
            >
                開立發票/收據
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                keepMounted={false}
                disablePortal
            >
                <DialogTitle>開立發票/收據</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>類型</InputLabel>
                                    <Select
                                        value={documentType}
                                        label="類型"
                                        onChange={(e) => setDocumentType(e.target.value as InvoiceType)}
                                    >
                                        <MenuItem value="二聯式">二聯式發票（存根聯、收執聯）</MenuItem>
                                        <MenuItem value="三聯式">三聯式發票（存根聯、報帳聯、扣抵聯）</MenuItem>
                                        <MenuItem value="收據">收據</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <DatePicker
                                    label="開立日期"
                                    value={issueDate}
                                    onChange={(newValue) => setIssueDate(newValue)}
                                    format="yyyy/MM/dd"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true
                                        }
                                    }}
                                />
                            </Grid>

                            {documentType !== '收據' && (
                                <>
                                    <Grid item xs={12}>
                                        <Typography variant="h6">賣方資訊</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="公司名稱"
                                            value={companyInfo.name}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="統一編號"
                                            value={companyInfo.taxId}
                                        />
                                    </Grid>
                                </>
                            )}

                            {documentType === '三聯式' && (
                                <>
                                    <Grid item xs={12}>
                                        <Typography variant="h6">買方資訊</Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="公司名稱"
                                            value={buyerInfo.name}
                                            onChange={(e) => setBuyerInfo({ ...buyerInfo, name: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="統一編號"
                                            value={buyerInfo.taxId}
                                            onChange={(e) => setBuyerInfo({ ...buyerInfo, taxId: e.target.value })}
                                        />
                                    </Grid>
                                </>
                            )}

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">商品明細</Typography>
                                    {documentType !== '收據' && (
                                        <Button
                                            startIcon={<AddIcon />}
                                            onClick={handleAddItem}
                                        >
                                            新增項目
                                        </Button>
                                    )}
                                </Box>

                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>品名</TableCell>
                                                <TableCell align="right">數量</TableCell>
                                                <TableCell align="right">單價</TableCell>
                                                <TableCell align="right">金額</TableCell>
                                                {documentType !== '收據' && (
                                                    <TableCell align="right">操作</TableCell>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <TextField
                                                            fullWidth
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                            disabled={documentType === '收據'}
                                                            sx={{ width: 100 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            type="number"
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                            disabled={documentType === '收據'}
                                                            sx={{ width: 100 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {item.amount.toLocaleString()}
                                                    </TableCell>
                                                    {documentType !== '收據' && (
                                                        <TableCell align="right">
                                                            <IconButton
                                                                onClick={() => handleRemoveItem(index)}
                                                                disabled={items.length === 1}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Typography variant="h6" sx={{ mr: 2 }}>
                                        總計：{calculateTotal().toLocaleString()}
                                    </Typography>
                                    {documentType !== '收據' && (
                                        <Typography variant="h6" sx={{ mr: 2 }}>
                                            營業稅：{calculateTax().toLocaleString()}
                                        </Typography>
                                    )}
                                    <Typography variant="h6">
                                        總金額：{(calculateTotal() + (documentType !== '收據' ? calculateTax() : 0)).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        確認開立
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}; 