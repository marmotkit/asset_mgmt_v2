import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Chip,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    DialogContentText,
    Menu
} from '@mui/material';
import { Print as PrintIcon, Add as AddIcon, Delete as DeleteIcon, Payment as PaymentIcon } from '@mui/icons-material';
import { DocumentIssue } from './DocumentIssue';
import { invoiceService } from '../../../services/invoiceService';
import { feeHistoryService } from '../../../services/feeHistoryService';
import { FeeHistory, PaymentMethod } from '../../../types/fee';
import { documentService } from '../../../services/documentService';
import type { Invoice, Receipt } from '../../../types/invoice';

interface DocumentListDialogProps {
    open: boolean;
    onClose: () => void;
    memberId: string;
    memberName: string;
}

const DocumentListDialog: React.FC<DocumentListDialogProps> = ({
    open,
    onClose,
    memberId,
    memberName
}) => {
    const [documents, setDocuments] = useState<(Invoice | Receipt)[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState(memberId);
    const [selectedMemberName, setSelectedMemberName] = useState(memberName);
    const [members, setMembers] = useState<{ memberId: string; memberName: string }[]>([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deletingDocument, setDeletingDocument] = useState<Invoice | Receipt | null>(null);

    React.useEffect(() => {
        if (open) {
            loadMembers();
        }
    }, [open]);

    const loadMembers = async () => {
        try {
            const data = await feeHistoryService.getHistories({
                status: '已收款'
            });
            const uniqueMembers = Array.from(
                new Map(data.map(item =>
                    [`${item.memberId}-${item.memberName}`, {
                        memberId: item.memberId,
                        memberName: item.memberName
                    }]
                )).values()
            );
            setMembers(uniqueMembers);
        } catch (error) {
            console.error('載入會員資料失敗:', error);
            setSnackbar({
                open: true,
                message: '載入會員資料失敗',
                severity: 'error'
            });
        }
    };

    React.useEffect(() => {
        if (open && selectedMemberId) {
            loadDocuments();
        }
    }, [open, selectedMemberId]);

    const loadDocuments = async () => {
        try {
            const docs = await invoiceService.getDocuments({ memberId: selectedMemberId });
            setDocuments(docs);
        } catch (error) {
            console.error('載入文件失敗:', error);
            setSnackbar({
                open: true,
                message: '載入文件失敗',
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

    const handleMemberSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedMember = members.find(m => m.memberId === event.target.value);
        if (selectedMember) {
            setSelectedMemberId(selectedMember.memberId);
            setSelectedMemberName(selectedMember.memberName);
        }
    };

    const handleDeleteClick = (doc: Invoice | Receipt) => {
        setDeletingDocument(doc);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingDocument) {
            try {
                await invoiceService.deleteDocument(deletingDocument.id);
                await loadDocuments();
                setSnackbar({
                    open: true,
                    message: '刪除成功',
                    severity: 'success'
                });
            } catch (error) {
                console.error('刪除失敗:', error);
                setSnackbar({
                    open: true,
                    message: '刪除失敗',
                    severity: 'error'
                });
            }
        }
        setDeleteConfirmOpen(false);
        setDeletingDocument(null);
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setDeletingDocument(null);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">
                        已開立發票/收據列表
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {selectedMemberId ?
                            `會員：${selectedMemberName} (${selectedMemberId})` :
                            '請選擇會員'}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>選擇會員</InputLabel>
                            <Select
                                value={selectedMemberId}
                                label="選擇會員"
                                onChange={(e) => handleMemberSelect(e as any)}
                            >
                                {members.map((member) => (
                                    <MenuItem key={member.memberId} value={member.memberId}>
                                        {member.memberName} ({member.memberId})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {selectedMemberId && (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>類型</TableCell>
                                            <TableCell>編號</TableCell>
                                            <TableCell>日期</TableCell>
                                            <TableCell align="right">金額</TableCell>
                                            <TableCell>操作</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {documents.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    尚未開立任何發票或收據
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            documents.map((doc) => (
                                                <TableRow key={doc.id}>
                                                    <TableCell>
                                                        <Chip
                                                            label={doc.type === '收據' ? '收據' :
                                                                doc.type === '二聯式' ? '二聯式（存根聯、收執聯）' :
                                                                    '三聯式（存根聯、報帳聯、扣抵聯）'}
                                                            color={doc.type === '收據' ? 'default' : 'primary'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {doc.type === '收據'
                                                            ? (doc as Receipt).receiptNumber
                                                            : (doc as Invoice).invoiceNumber}
                                                    </TableCell>
                                                    <TableCell>{doc.date}</TableCell>
                                                    <TableCell align="right">
                                                        {doc.amount.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <IconButton
                                                                size="small"
                                                                title="列印"
                                                                onClick={() => handlePrint(doc)}
                                                            >
                                                                <PrintIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleDeleteClick(doc)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>關閉</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        確定要刪除這份文件嗎？此操作無法復原。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>取消</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        刪除
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export const InvoiceManagement: React.FC = () => {
    const [payments, setPayments] = useState<FeeHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [newInvoiceData, setNewInvoiceData] = useState({
        memberId: '',
        memberName: '',
        amount: 0
    });
    const [isDocumentListOpen, setIsDocumentListOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deletingPayment, setDeletingPayment] = useState<FeeHistory | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const [paymentMethodAnchorEl, setPaymentMethodAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedPayment, setSelectedPayment] = useState<FeeHistory | null>(null);

    const loadPayments = async () => {
        try {
            const data = await feeHistoryService.getHistories({
                status: '已收款'
            });
            setPayments(data);
        } catch (error) {
            console.error('載入付款記錄失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    const handlePrint = (payment: FeeHistory) => {
        // TODO: 實作列印功能
        console.log('列印:', payment);
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewInvoiceData({
            memberId: '',
            memberName: '',
            amount: 0
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewInvoiceData(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : value
        }));
    };

    const handleAddInvoice = () => {
        // 這裡可以添加驗證邏輯
        if (!newInvoiceData.memberId || !newInvoiceData.memberName || !newInvoiceData.amount) {
            return;
        }

        // 創建新的付款記錄
        const newPayment: FeeHistory = {
            id: `manual-${Date.now()}`,
            memberId: newInvoiceData.memberId,
            memberName: newInvoiceData.memberName,
            userId: newInvoiceData.memberId,
            userName: newInvoiceData.memberName,
            memberType: '一般會員', // 預設值
            amount: newInvoiceData.amount,
            dueDate: new Date().toISOString().split('T')[0],
            status: '已收款',
            date: new Date().toISOString().split('T')[0],
            action: '已收款',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            paymentId: `payment-${Date.now()}`
        };

        // 更新列表
        setPayments(prev => [...prev, newPayment]);
        handleCloseDialog();
    };

    const handleDeleteClick = (payment: FeeHistory) => {
        setDeletingPayment(payment);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingPayment) {
            try {
                await feeHistoryService.deleteRecord(deletingPayment.id);
                await loadPayments();
                setSnackbar({
                    open: true,
                    message: '刪除成功',
                    severity: 'success'
                });
            } catch (error) {
                console.error('刪除失敗:', error);
                setSnackbar({
                    open: true,
                    message: '刪除失敗',
                    severity: 'error'
                });
            }
        }
        setDeleteConfirmOpen(false);
        setDeletingPayment(null);
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setDeletingPayment(null);
    };

    const handlePaymentMethodClick = (event: React.MouseEvent<HTMLElement>, payment: FeeHistory) => {
        setPaymentMethodAnchorEl(event.currentTarget);
        setSelectedPayment(payment);
    };

    const handlePaymentMethodClose = () => {
        setPaymentMethodAnchorEl(null);
        setSelectedPayment(null);
    };

    const handlePaymentMethodSelect = async (method: PaymentMethod) => {
        if (selectedPayment) {
            try {
                await feeHistoryService.updateRecord(selectedPayment.id, {
                    paymentMethod: method,
                    updatedAt: new Date().toISOString()
                });
                await loadPayments();
                setSnackbar({
                    open: true,
                    message: '更新收款方式成功',
                    severity: 'success'
                });
            } catch (error) {
                console.error('更新收款方式失敗:', error);
                setSnackbar({
                    open: true,
                    message: '更新收款方式失敗',
                    severity: 'error'
                });
            }
        }
        handlePaymentMethodClose();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">發票管理</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsDocumentListOpen(true)}
                        startIcon={<PrintIcon />}
                    >
                        列印發票/收據
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                    >
                        新增發票
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>會員編號</TableCell>
                            <TableCell>會員姓名</TableCell>
                            <TableCell>會員類型</TableCell>
                            <TableCell align="right">金額</TableCell>
                            <TableCell>繳費日期</TableCell>
                            <TableCell>收款方式</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>{payment.memberId}</TableCell>
                                <TableCell>{payment.memberName}</TableCell>
                                <TableCell>{payment.memberType}</TableCell>
                                <TableCell align="right">{payment.amount.toLocaleString()}</TableCell>
                                <TableCell>{payment.paymentDate}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={payment.paymentMethod || '未設定'}
                                        color={payment.paymentMethod ? 'primary' : 'default'}
                                        size="small"
                                        onClick={(e) => handlePaymentMethodClick(e, payment)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <DocumentIssue
                                            memberId={payment.memberId}
                                            memberName={payment.memberName}
                                            paymentId={payment.id}
                                            amount={payment.amount}
                                            onSuccess={loadPayments}
                                        />
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(payment)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {payments.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    無已收款記錄
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>新增發票</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="會員編號"
                                name="memberId"
                                value={newInvoiceData.memberId}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="會員姓名"
                                name="memberName"
                                value={newInvoiceData.memberName}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="金額"
                                name="amount"
                                type="number"
                                value={newInvoiceData.amount}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>取消</Button>
                    <Button onClick={handleAddInvoice} variant="contained" color="primary">
                        新增
                    </Button>
                </DialogActions>
            </Dialog>

            <DocumentListDialog
                open={isDocumentListOpen}
                onClose={() => setIsDocumentListOpen(false)}
                memberId={payments.length > 0 ? payments[0].memberId : ''}
                memberName={payments.length > 0 ? payments[0].memberName : ''}
            />

            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        確定要刪除這筆付款記錄嗎？此操作無法復原。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>取消</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        刪除
                    </Button>
                </DialogActions>
            </Dialog>

            <Menu
                anchorEl={paymentMethodAnchorEl}
                open={Boolean(paymentMethodAnchorEl)}
                onClose={handlePaymentMethodClose}
            >
                <MenuItem onClick={() => handlePaymentMethodSelect('轉帳' as PaymentMethod)}>轉帳</MenuItem>
                <MenuItem onClick={() => handlePaymentMethodSelect('Line Pay' as PaymentMethod)}>Line Pay</MenuItem>
                <MenuItem onClick={() => handlePaymentMethodSelect('現金' as PaymentMethod)}>現金</MenuItem>
                <MenuItem onClick={() => handlePaymentMethodSelect('票據' as PaymentMethod)}>票據</MenuItem>
                <MenuItem onClick={() => handlePaymentMethodSelect('其他' as PaymentMethod)}>其他</MenuItem>
            </Menu>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}; 