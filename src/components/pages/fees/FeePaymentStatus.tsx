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
    Tooltip,
    Tabs,
    Tab,
    TableSortLabel
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { PaymentStatus, PaymentStatusRecord, FeeSetting, FeePaymentFilter, PaymentMethod } from '../../../types/fee';
import { User } from '../../../types/user';
import { FeeApi } from '../../../services/feeApi';
import { ApiService } from '../../../services/api.service';

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

const getPaymentMethodLabel = (method: PaymentMethod | undefined | string) => {
    if (!method || method === '') return '-';
    const methodConfig: { [key: string]: string } = {
        '轉帳': '轉帳',
        'transfer': '轉帳',
        'Line Pay': 'Line Pay',
        'linepay': 'Line Pay',
        '現金': '現金',
        'cash': '現金',
        '票據': '票據',
        'check': '票據',
        '其他': '其他',
        'other': '其他'
    };
    return methodConfig[method.toLowerCase()] || method;
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
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [availableMembers, setAvailableMembers] = useState<Array<{
        id: string;
        name: string;
        type: string;
    }>>([
        { id: 'M001', name: '張三', type: '一般會員' },
        { id: 'M002', name: '李四', type: '商務會員' },
        // 這裡應該從 API 獲取會員列表
    ]);
    const [currentTab, setCurrentTab] = useState<string>(() => {
        // 根據當前 URL 判斷是否在歷史記錄頁面
        return window.location.pathname.includes('歷史記錄') ? '歷史記錄' : '收款狀況';
    });
    const [orderBy, setOrderBy] = useState<string>('dueDate');
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (column: string) => {
        if (orderBy === column) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderBy(column);
            setOrder('asc');
        }
    };

    const sortedPayments = [...payments].sort((a, b) => {
        let aValue = a[orderBy as keyof PaymentStatusRecord];
        let bValue = b[orderBy as keyof PaymentStatusRecord];
        // 金額排序
        if (orderBy === 'amount') {
            aValue = Number(aValue);
            bValue = Number(bValue);
        }
        // 到期日排序
        if (orderBy === 'dueDate') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
        }
        // 狀態排序
        if (orderBy === 'status') {
            aValue = aValue || '';
            bValue = bValue || '';
        }
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
    });

    // 載入資料
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [paymentData, settingsData] = await Promise.all([
                    FeeApi.getFees({ isHistoryPage: window.location.pathname.includes('歷史記錄') }),
                    FeeApi.getFees({ type: 'setting' })
                ]);

                setPayments(paymentData || []);
                setFeeSettings(settingsData || []);

                // 轉換會員資料格式
                const users = await ApiService.getUsers();
                const members = users.map((user: User) => ({
                    id: user.memberNo,
                    name: user.name,
                    type: user.role === 'lifetime' ? '永久會員' :
                        user.role === 'admin' ? '管理員' :
                            user.role === 'business' ? '商務會員' : '一般會員'
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
                // 刪除付款記錄
                const success = await FeeApi.deleteFee(deletePayment.id);
                if (success) {
                    // 從本地狀態中移除記錄
                    setPayments(prev => prev.filter(p => p.id !== deletePayment.id));
                    setSnackbar({
                        open: true,
                        message: '成功刪除記錄',
                        severity: 'success'
                    });
                }
            } catch (error) {
                console.error('刪除失敗:', error);
                setSnackbar({
                    open: true,
                    message: '刪除失敗',
                    severity: 'error'
                });
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
                const updated = await FeeApi.updateFee(editingPayment.id, editingPayment);
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
    const filteredPayments = payments
        .filter(payment => {
            const matchStatus = !filter.status || payment.status === filter.status;
            const matchType = !filter.memberType || payment.memberType === filter.memberType;
            const matchSearch = !filter.search ||
                payment.memberName.toLowerCase().includes(filter.search.toLowerCase()) ||
                payment.memberId.toLowerCase().includes(filter.search.toLowerCase());
            return matchStatus && matchType && matchSearch;
        })
        .sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return dateB.getTime() - dateA.getTime();
        });

    // 取得會員類型選項
    const memberTypes = Array.from(new Set(payments.map(p => p.memberType)));

    const handleCreateAnnual = async () => {
        if (!selectedMember || !selectedFeeSetting) return;

        const member = availableMembers.find(m => m.id === selectedMember);
        const feeSetting = feeSettings.find(f => f.id === selectedFeeSetting);

        if (!member || !feeSetting) return;

        try {
            // 判斷是否為5年期
            if (feeSetting.frequency === '5year') {
                const perYearAmount = Math.round(feeSetting.amount / 5);
                const paymentsToCreate = [];
                for (let i = 0; i < 5; i++) {
                    const year = Number(selectedYear) + i;
                    paymentsToCreate.push({
                        memberId: member.id,
                        memberName: member.name,
                        memberType: member.type,
                        amount: perYearAmount,
                        dueDate: `${year}-12-31`,
                        status: '待收款' as PaymentStatus,
                        note: `${year}年度會費（5年期分攤）`
                    });
                }
                const createdList = [];
                for (const payment of paymentsToCreate) {
                    const created = await FeeApi.createFees([payment]);
                    if (created) createdList.push(created);
                }
                if (createdList.length > 0) {
                    setPayments(prev => [...prev, ...createdList]);
                    setSnackbar({
                        open: true,
                        message: '成功建立5年期年度應收項目',
                        severity: 'success'
                    });
                }
            } else {
                // 原本邏輯：只產生單一年度
                const newPayment = {
                    memberId: member.id,
                    memberName: member.name,
                    memberType: member.type,
                    amount: feeSetting.amount,
                    dueDate: `${selectedYear}-12-31`,
                    status: '待收款' as PaymentStatus,
                    note: `${selectedYear}年度會費`
                };
                const created = await FeeApi.createFees([newPayment]);
                if (created) {
                    setPayments(prev => [...prev, created]);
                    setSnackbar({
                        open: true,
                        message: '成功建立年度應收項目',
                        severity: 'success'
                    });
                }
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

    // 過濾掉已經存在的會員和管理員，同時考慮年度
    const filteredAvailableMembers = availableMembers.filter(
        member => !payments.some(p =>
            p.memberId === member.id &&
            p.note?.includes(`${selectedYear}年度會費`)
        ) && member.type !== '管理員'
    );

    const handleMemberSelect = (memberId: string) => {
        setSelectedMember(memberId);
        const member = availableMembers.find(m => m.id === memberId);
        if (member) {
            // 用會員類型對應 feeSettings.name
            const matchingFeeSetting = feeSettings.find(setting => setting.name === member.type);
            if (matchingFeeSetting) {
                setSelectedFeeSetting(matchingFeeSetting.id.toString());
            } else {
                setSelectedFeeSetting('');
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

    const handleFieldChange = (field: keyof PaymentStatusRecord, value: string) => {
        if (editingPayment) {
            const newPayment = { ...editingPayment };
            switch (field) {
                case 'amount':
                    newPayment.amount = Number(value);
                    break;
                case 'status':
                    newPayment.status = value as PaymentStatus;
                    break;
                case 'paymentMethod':
                    newPayment.paymentMethod = value as PaymentMethod;
                    break;
                case 'dueDate':
                case 'paidDate':
                case 'note':
                    newPayment[field] = value;
                    break;
            }
            setEditingPayment(newPayment);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'memberId'}
                                    direction={orderBy === 'memberId' ? order : 'asc'}
                                    onClick={() => handleSort('memberId')}
                                >會員編號</TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'memberName'}
                                    direction={orderBy === 'memberName' ? order : 'asc'}
                                    onClick={() => handleSort('memberName')}
                                >姓名</TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'memberType'}
                                    direction={orderBy === 'memberType' ? order : 'asc'}
                                    onClick={() => handleSort('memberType')}
                                >會員類型</TableSortLabel>
                            </TableCell>
                            <TableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'amount'}
                                    direction={orderBy === 'amount' ? order : 'asc'}
                                    onClick={() => handleSort('amount')}
                                >金額</TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'dueDate'}
                                    direction={orderBy === 'dueDate' ? order : 'asc'}
                                    onClick={() => handleSort('dueDate')}
                                >到期日</TableSortLabel>
                            </TableCell>
                            <TableCell>繳費日期</TableCell>
                            <TableCell>收款方式</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'status'}
                                    direction={orderBy === 'status' ? order : 'asc'}
                                    onClick={() => handleSort('status')}
                                >狀態</TableSortLabel>
                            </TableCell>
                            <TableCell>備註</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedPayments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>{payment.memberId}</TableCell>
                                <TableCell>{payment.memberName}</TableCell>
                                <TableCell>{payment.memberType}</TableCell>
                                <TableCell align="right">{payment.amount.toLocaleString()}</TableCell>
                                <TableCell>{payment.dueDate}</TableCell>
                                <TableCell>{payment.paidDate || '-'}</TableCell>
                                <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                                <TableCell>{getStatusChip(payment.status)}</TableCell>
                                <TableCell>{payment.note || '-'}</TableCell>
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
                                    value={editingPayment?.status || ''}
                                    onChange={(e) => {
                                        if (editingPayment) {
                                            const newStatus = e.target.value as PaymentStatus;
                                            const newPayment = {
                                                ...editingPayment,
                                                status: newStatus,
                                                // 如果狀態改為已收款且尚未設定收款方式，預設為轉帳
                                                paymentMethod: newStatus === '已收款' && !editingPayment.paymentMethod ? '轉帳' : editingPayment.paymentMethod,
                                                // 如果狀態改為已收款且尚未設定繳費日期，設定為今天
                                                paidDate: newStatus === '已收款' && !editingPayment.paidDate ? new Date().toISOString().split('T')[0] : editingPayment.paidDate
                                            };
                                            setEditingPayment(newPayment);
                                        }
                                    }}
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
                            <FormControl fullWidth>
                                <InputLabel>收款方式</InputLabel>
                                <Select
                                    value={editingPayment?.paymentMethod || ''}
                                    onChange={(e) => {
                                        if (editingPayment) {
                                            setEditingPayment({
                                                ...editingPayment,
                                                paymentMethod: e.target.value as PaymentMethod
                                            });
                                        }
                                    }}
                                    label="收款方式"
                                >
                                    <MenuItem value="轉帳">轉帳</MenuItem>
                                    <MenuItem value="Line Pay">Line Pay</MenuItem>
                                    <MenuItem value="現金">現金</MenuItem>
                                    <MenuItem value="票據">票據</MenuItem>
                                    <MenuItem value="其他">其他</MenuItem>
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
                            <TextField
                                fullWidth
                                label="年度"
                                type="number"
                                value={selectedYear}
                                onChange={(e) => {
                                    const year = parseInt(e.target.value);
                                    if (year >= 1911) {  // 設定最小年度為1911年
                                        setSelectedYear(year);
                                    }
                                }}
                                InputProps={{
                                    inputProps: { min: 1911 }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>選擇會員</InputLabel>
                                <Select
                                    value={selectedMember || ''}
                                    onChange={(e) => handleMemberSelect(e.target.value)}
                                    fullWidth
                                >
                                    <MenuItem value="">請選擇會員</MenuItem>
                                    {filteredAvailableMembers.map((member) => (
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