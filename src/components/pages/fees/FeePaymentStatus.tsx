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
    Chip,
    IconButton,
    Typography,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    SelectChangeEvent,
    CircularProgress,
    Snackbar,
    Alert,
    Tooltip
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { PaymentStatus, PaymentStatusRecord, FeeSetting, FeePaymentFilter } from '../../../types/fee';
import { User } from '../../../types/user';
import { feeService } from '../../../services/feeService';
import ApiService from '../../../services/api.service';

const getStatusChip = (status: PaymentStatus) => {
    const statusConfig = {
        '待收款': { label: '待收款', color: 'warning' as const },
        '已收款': { label: '已收款', color: 'success' as const },
        '逾期': { label: '逾期', color: 'error' as const },
        '終止': { label: '終止', color: 'default' as const }
    };

    const config = statusConfig[status] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
};

const FeePaymentStatus: React.FC = () => {
    const [payments, setPayments] = useState<PaymentStatusRecord[]>([]);
    const [feeSettings, setFeeSettings] = useState<FeeSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPayment, setEditingPayment] = useState<PaymentStatusRecord | null>(null);
    const [deletePayment, setDeletePayment] = useState<PaymentStatusRecord | null>(null);
    const [filter, setFilter] = useState<FeePaymentFilter>({
        status: '',
        memberType: '',
        search: ''
    });
    const [open, setOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const [createAnnualOpen, setCreateAnnualOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [selectedFeeSetting, setSelectedFeeSetting] = useState<string>('');
    const [availableMembers, setAvailableMembers] = useState<Array<{
        id: string;
        name: string;
        type: string;
    }>>([
        { id: 'M001', name: '張三', type: '一般會員' },
        { id: 'M002', name: '李四', type: '商務會員' },
        // 這裡應該從 API 獲取會員列表
    ]);

    // 載入資料
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [paymentData, settingsData, userData] = await Promise.all([
                    feeService.getPayments(),
                    feeService.getFeeSettings(),
                    ApiService.getUsers({
                        page: 1,
                        pageSize: 100,
                        filters: { status: 'active' }
                    })
                ]);

                setPayments(paymentData || []);
                setFeeSettings(settingsData || []);

                // 轉換會員資料格式
                const members = userData.items.map((user: User) => ({
                    id: user.memberNo,
                    name: user.name,
                    type: user.role === 'business' ? '商務會員' :
                        user.role === 'lifetime' ? '永久會員' :
                            user.role === 'admin' ? '管理員' : '一般會員'
                }));
                setAvailableMembers(members);
            } catch (error) {
                console.error('載入資料失敗:', error);
                setSnackbar({
                    open: true,
                    message: '載入資料失敗',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // 處理刪除
    const handleDeleteClick = (payment: PaymentStatusRecord) => {
        setDeletePayment(payment);
    };

    const handleDeleteConfirm = async () => {
        if (deletePayment) {
            try {
                const success = await feeService.deletePayment(deletePayment.id);
                if (success) {
                    setPayments(prev => prev.filter(p => p.id !== deletePayment.id));
                }
            } catch (error) {
                console.error('刪除失敗:', error);
            }
            setDeletePayment(null);
        }
    };

    // 處理編輯
    const handleEditClick = (payment: PaymentStatusRecord) => {
        setEditingPayment({ ...payment });
    };

    const handleEditSave = async () => {
        if (editingPayment) {
            try {
                const updated = await feeService.updatePayment(editingPayment.id, editingPayment);
                if (updated) {
                    setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
                }
            } catch (error) {
                console.error('更新失敗:', error);
            }
            setEditingPayment(null);
        }
    };

    // 處理篩選
    const handleFilterChange = (field: keyof FeePaymentFilter, value: string) => {
        setFilter(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 篩選資料
    const filteredPayments = payments.filter(payment => {
        const matchStatus = !filter.status || payment.status === filter.status;
        const matchType = !filter.memberType || payment.memberType === filter.memberType;
        const matchSearch = !filter.search ||
            payment.memberName.toLowerCase().includes(filter.search.toLowerCase()) ||
            payment.memberId.toLowerCase().includes(filter.search.toLowerCase());
        return matchStatus && matchType && matchSearch;
    });

    // 取得會員類型選項
    const memberTypes = Array.from(new Set(payments.map(p => p.memberType)));

    const handleCreateAnnual = async () => {
        if (!selectedMember || !selectedFeeSetting) return;

        const member = availableMembers.find(m => m.id === selectedMember);
        const feeSetting = feeSettings.find(f => f.id === selectedFeeSetting);

        if (!member || !feeSetting) return;

        try {
            const newPayment: Omit<PaymentStatusRecord, 'id'> = {
                memberId: member.id,
                memberName: member.name,
                memberType: member.type,
                amount: feeSetting.amount,
                dueDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0], // 設定為當年12/31
                status: '待收款',
                note: `${new Date().getFullYear()}年度會費`,
                feeSettingId: feeSetting.id
            };

            const created = await feeService.createPayment(newPayment);
            if (created) {
                setPayments(prev => [...prev, created]);
                setSnackbar({
                    open: true,
                    message: '成功建立年度應收項目',
                    severity: 'success'
                });
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: '建立年度應收項目失敗',
                severity: 'error'
            });
        }

        setCreateAnnualOpen(false);
        setSelectedMember('');
        setSelectedFeeSetting('');
    };

    // 過濾掉已經存在的會員
    const filteredAvailableMembers = availableMembers.filter(
        member => !payments.some(p => p.memberId === member.id)
    );

    const handleMemberSelect = (memberId: string) => {
        setSelectedMember(memberId);
        const member = availableMembers.find(m => m.id === memberId);
        if (member) {
            console.log('選擇的會員:', member);
            // 根據會員類型自動選擇對應的會費標準
            const memberTypeMap = {
                '一般會員': '一般會員年費',
                '商務會員': '商務會員年費',
                '永久會員': '永久會員年費',
                '管理員': '一般會員年費'
            };
            const expectedFeeName = memberTypeMap[member.type as keyof typeof memberTypeMap];
            console.log('預期的會費名稱:', expectedFeeName);
            console.log('可用的會費設定:', feeSettings);

            const matchingFeeSetting = feeSettings.find(setting => {
                console.log('比對:', setting.name, expectedFeeName);
                return setting.name === expectedFeeName;
            });

            console.log('匹配的會費設定:', matchingFeeSetting);
            if (matchingFeeSetting) {
                setSelectedFeeSetting(matchingFeeSetting.id);
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    const handleFieldChange = (field: keyof PaymentStatusRecord, value: any) => {
        if (editingPayment) {
            const newPayment = { ...editingPayment };
            if (field === 'amount') {
                newPayment[field] = Number(value);
            } else {
                newPayment[field] = value;
            }
            setEditingPayment(newPayment);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    收款狀況
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateAnnualOpen(true)}
                        sx={{ mr: 2 }}
                    >
                        產生年度應收
                    </Button>
                    <TextField
                        size="small"
                        placeholder="搜尋會員編號或姓名"
                        value={filter.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ width: 250 }}
                    />
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>會員編號</TableCell>
                            <TableCell>姓名</TableCell>
                            <TableCell>會員類型</TableCell>
                            <TableCell align="right">金額</TableCell>
                            <TableCell>到期日</TableCell>
                            <TableCell>繳費日期</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPayments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>{payment.memberId}</TableCell>
                                <TableCell>{payment.memberName}</TableCell>
                                <TableCell>{payment.memberType}</TableCell>
                                <TableCell align="right">{payment.amount.toLocaleString()}</TableCell>
                                <TableCell>{payment.dueDate}</TableCell>
                                <TableCell>{payment.paidDate || '-'}</TableCell>
                                <TableCell>{getStatusChip(payment.status)}</TableCell>
                                <TableCell>
                                    <Tooltip title="編輯">
                                        <IconButton size="small" onClick={() => handleEditClick(payment)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="刪除">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteClick(payment)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={!!editingPayment} onClose={() => setEditingPayment(null)} maxWidth="md" fullWidth>
                <DialogTitle>
                    編輯收款資訊
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="會員編號"
                                name="memberId"
                                value={editingPayment?.memberId || ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="姓名"
                                name="memberName"
                                value={editingPayment?.memberName || ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="會員類型"
                                name="memberType"
                                value={editingPayment?.memberType || ''}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="金額"
                                name="amount"
                                type="number"
                                value={editingPayment?.amount || ''}
                                onChange={(e) => handleFieldChange('amount', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="到期日"
                                name="dueDate"
                                type="date"
                                value={editingPayment?.dueDate || ''}
                                onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>狀態</InputLabel>
                                <Select
                                    name="status"
                                    value={editingPayment?.status || ''}
                                    onChange={(e) => handleFieldChange('status', e.target.value as PaymentStatus)}
                                    label="狀態"
                                >
                                    <MenuItem value="待收款">待收款</MenuItem>
                                    <MenuItem value="已收款">已收款</MenuItem>
                                    <MenuItem value="逾期">逾期</MenuItem>
                                    <MenuItem value="終止">終止</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="繳費日期"
                                name="paidDate"
                                type="date"
                                value={editingPayment?.paidDate || ''}
                                onChange={(e) => handleFieldChange('paidDate', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="備註"
                                name="note"
                                multiline
                                rows={4}
                                value={editingPayment?.note || ''}
                                onChange={(e) => handleFieldChange('note', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingPayment(null)}>取消</Button>
                    <Button onClick={handleEditSave} variant="contained">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deletePayment} onClose={() => setDeletePayment(null)}>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    <Typography>
                        確定要刪除 {deletePayment?.memberName} 的繳費記錄嗎？此操作無法復原。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeletePayment(null)}>取消</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                        刪除
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={createAnnualOpen} onClose={() => setCreateAnnualOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    產生年度應收
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ pt: 2 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>選擇會員</InputLabel>
                                <Select
                                    value={selectedMember || ''}
                                    onChange={(e) => handleMemberSelect(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value="">請選擇會員</MenuItem>
                                    {availableMembers
                                        .filter(member => !payments.some(payment => payment.memberId === member.id))
                                        .map((member) => (
                                            <MenuItem key={member.id} value={member.id}>
                                                {member.name} ({member.type})
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>會費標準</InputLabel>
                                <Select
                                    value={selectedFeeSetting}
                                    label="會費標準"
                                    onChange={(e) => setSelectedFeeSetting(e.target.value)}
                                >
                                    {(feeSettings || []).map((setting) => (
                                        <MenuItem key={setting.id} value={setting.id}>
                                            {setting.name} - {setting.amount.toLocaleString()} 元
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateAnnualOpen(false)}>取消</Button>
                    <Button
                        onClick={handleCreateAnnual}
                        variant="contained"
                        disabled={!selectedMember || !selectedFeeSetting}
                    >
                        建立
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FeePaymentStatus; 