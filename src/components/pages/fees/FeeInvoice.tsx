import React, { useState } from 'react';
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
    IconButton,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid
} from '@mui/material';
import {
    Edit as EditIcon,
    Print as PrintIcon,
    Add as AddIcon
} from '@mui/icons-material';

interface InvoiceInfo {
    id: string;
    memberId: string;
    memberName: string;
    companyName: string;
    taxId: string;
    address: string;
    contactPerson: string;
    phone: string;
    email: string;
}

const mockInvoices: InvoiceInfo[] = [
    {
        id: '1',
        memberId: 'A001',
        memberName: '系統管理員',
        companyName: '系統科技有限公司',
        taxId: '12345678',
        address: '台北市信義區信義路五段7號',
        contactPerson: '王小明',
        phone: '02-12345678',
        email: 'contact@system.com'
    },
    {
        id: '2',
        memberId: 'V001',
        memberName: '梁坤榮',
        companyName: '方正公司',
        taxId: '87654321',
        address: '台北市中山區中山北路二段45號',
        contactPerson: '梁坤榮',
        phone: '02-87654321',
        email: 'y134679@hotmail.com'
    }
];

const FeeInvoice: React.FC = () => {
    const [invoices, setInvoices] = useState<InvoiceInfo[]>(mockInvoices);
    const [open, setOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<InvoiceInfo | null>(null);

    const handleEditClick = (invoice: InvoiceInfo) => {
        setEditingInvoice({ ...invoice });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingInvoice(null);
    };

    const handleSave = () => {
        if (editingInvoice) {
            setInvoices(invoices.map(invoice =>
                invoice.id === editingInvoice.id ? editingInvoice : invoice
            ));
            handleClose();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingInvoice) {
            setEditingInvoice({
                ...editingInvoice,
                [e.target.name]: e.target.value
            });
        }
    };

    const handlePrint = (invoice: InvoiceInfo) => {
        // TODO: 實作發票列印功能
        console.log('列印發票:', invoice);
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    發票管理
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditingInvoice({
                            id: String(invoices.length + 1),
                            memberId: '',
                            memberName: '',
                            companyName: '',
                            taxId: '',
                            address: '',
                            contactPerson: '',
                            phone: '',
                            email: ''
                        });
                        setOpen(true);
                    }}
                >
                    新增發票資訊
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>會員編號</TableCell>
                            <TableCell>姓名</TableCell>
                            <TableCell>公司名稱</TableCell>
                            <TableCell>統一編號</TableCell>
                            <TableCell>聯絡人</TableCell>
                            <TableCell>電話</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>{invoice.memberId}</TableCell>
                                <TableCell>{invoice.memberName}</TableCell>
                                <TableCell>{invoice.companyName}</TableCell>
                                <TableCell>{invoice.taxId}</TableCell>
                                <TableCell>{invoice.contactPerson}</TableCell>
                                <TableCell>{invoice.phone}</TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={() => handleEditClick(invoice)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handlePrint(invoice)}>
                                        <PrintIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingInvoice?.id ? '編輯發票資訊' : '新增發票資訊'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="會員編號"
                                name="memberId"
                                value={editingInvoice?.memberId || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="姓名"
                                name="memberName"
                                value={editingInvoice?.memberName || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="公司名稱"
                                name="companyName"
                                value={editingInvoice?.companyName || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="統一編號"
                                name="taxId"
                                value={editingInvoice?.taxId || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="地址"
                                name="address"
                                value={editingInvoice?.address || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="聯絡人"
                                name="contactPerson"
                                value={editingInvoice?.contactPerson || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="電話"
                                name="phone"
                                value={editingInvoice?.phone || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={editingInvoice?.email || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>取消</Button>
                    <Button onClick={handleSave} variant="contained">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FeeInvoice; 