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
    DialogContentText,
    TableSortLabel,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Investment } from '../../../types/investment';
import { MemberProfit, PaymentStatus, PaymentMethod } from '../../../types/rental';
import { User } from '../../../types/user';
import { ApiService } from '../../../services';
import { formatCurrency, formatDate } from '../../../utils/format';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import { useSnackbar } from 'notistack';

interface MemberProfitTabProps {
    investments: Investment[];
}

interface InvestmentSelection {
    id: string;
    name: string;
    selected: boolean;
    hasExistingProfits: boolean;
}

// 排序欄位類型
type SortField = 'investmentName' | 'memberName' | 'yearMonth' | 'amount' | 'status' | 'paymentMethod' | 'paymentDate' | 'note';

// 排序方向類型
type SortDirection = 'asc' | 'desc';

const MemberProfitTab: React.FC<MemberProfitTabProps> = ({ investments }) => {
    const [memberProfits, setMemberProfits] = useState<MemberProfit[]>([]);
    const [availableInvestments, setAvailableInvestments] = useState<Investment[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProfit, setSelectedProfit] = useState<MemberProfit | null>(null);
    const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
    const [showAllYear, setShowAllYear] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    // 排序相關狀態
    const [sortField, setSortField] = useState<SortField>('yearMonth');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const [formData, setFormData] = useState<Partial<MemberProfit>>({
        investmentId: '',
        memberId: '',
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

    // 添加清除對話框狀態
    const [clearDialogOpen, setClearDialogOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [yearFilter, monthFilter, showAllYear]);

    // 當切換到當年度模式時，自動調整排序方向為升序
    useEffect(() => {
        if (showAllYear && sortField === 'yearMonth' && sortDirection === 'desc') {
            setSortDirection('asc');
        }
    }, [showAllYear, sortField, sortDirection]);

    // 排序函數
    const sortProfits = (profits: MemberProfit[]): MemberProfit[] => {
        return [...profits].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortField) {
                case 'investmentName':
                    const investmentA = investments.find(inv => inv.id === a.investmentId);
                    const investmentB = investments.find(inv => inv.id === b.investmentId);
                    aValue = investmentA?.name || '';
                    bValue = investmentB?.name || '';
                    break;
                case 'memberName':
                    const memberA = members.find(m => m.id === a.memberId);
                    const memberB = members.find(m => m.id === b.memberId);
                    aValue = memberA?.name || '';
                    bValue = memberB?.name || '';
                    break;
                case 'yearMonth':
                    aValue = a.year * 100 + a.month;
                    bValue = b.year * 100 + b.month;
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount;
                    break;
                case 'status':
                    aValue = getStatusText(a.status);
                    bValue = getStatusText(b.status);
                    break;
                case 'paymentMethod':
                    aValue = getPaymentMethodText(a.paymentMethod);
                    bValue = getPaymentMethodText(b.paymentMethod);
                    break;
                case 'paymentDate':
                    aValue = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
                    bValue = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
                    break;
                case 'note':
                    aValue = a.note || '';
                    bValue = b.note || '';
                    break;
                default:
                    return 0;
            }

            // 處理字串比較
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    // 處理排序變更
    const handleSort = (field: SortField) => {
        const isAsc = sortField === field && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };

    // 獲取付款方式文字
    const getPaymentMethodText = (method: PaymentMethod) => {
        switch (method) {
            case PaymentMethod.CASH:
                return '現金';
            case PaymentMethod.BANK_TRANSFER:
                return '銀行轉帳';
            case PaymentMethod.CHECK:
                return '支票';
            case PaymentMethod.OTHER:
                return '其他';
            default:
                return '其他';
        }
    };

    // 獲取排序標籤
    const getSortLabel = (field: SortField, label: string) => (
        <TableSortLabel
            active={sortField === field}
            direction={sortField === field ? sortDirection : 'asc'}
            onClick={() => handleSort(field)}
        >
            {label}
        </TableSortLabel>
    );

    const loadData = async () => {
        setLoading(true);
        try {
            // 載入有分潤標準的投資項目
            const availableInvestmentsData = await ApiService.getAvailableInvestmentsForMemberProfits();
            setAvailableInvestments(availableInvestmentsData);

            // 載入會員資料
            const membersData = await ApiService.getMembers();
            setMembers(membersData);

            // 載入會員分潤資料
            const profitsData = await ApiService.getMemberProfits(
                undefined,
                undefined,
                yearFilter,
                showAllYear ? undefined : monthFilter
            );

            setMemberProfits(profitsData);
        } catch (err) {
            setError('載入資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateClick = async () => {
        // 檢查是否有選擇年度
        if (!yearFilter) {
            enqueueSnackbar('請選擇要生成的年度', { variant: 'error' });
            return;
        }

        try {
            // 載入最新的分潤資料以檢查重複
            const existingProfits = await ApiService.getMemberProfits(undefined, undefined, yearFilter);

            // 準備有分潤標準的投資項目選擇清單
            const selections: InvestmentSelection[] = availableInvestments.map(inv => ({
                id: inv.id,
                name: inv.name,
                selected: false,
                hasExistingProfits: existingProfits.some(p => p.investmentId === inv.id)
            }));

            setInvestmentSelections(selections);
            setSelectionDialogOpen(true);
        } catch (err) {
            enqueueSnackbar('生成會員分潤項目失敗', { variant: 'error' });
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
                    await ApiService.generateMemberProfits(inv.id, yearFilter);
                } catch (error) {
                    hasError = true;
                    errorMessage += `${inv.name}: ${error instanceof Error ? error.message : '生成失敗'}\n`;
                }
            }

            if (hasError) {
                enqueueSnackbar(errorMessage, { variant: 'warning' });
            } else {
                enqueueSnackbar('會員分潤項目生成完成', { variant: 'success' });
            }

            await loadData();
        } catch (error) {
            enqueueSnackbar('生成會員分潤項目時發生錯誤', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfit = (profit: MemberProfit) => {
        setSelectedProfit(profit);
        setFormData({
            ...profit,
            paymentMethod: profit.paymentMethod || PaymentMethod.BANK_TRANSFER,
            paymentDate: profit.paymentDate || '',
            note: profit.note || ''
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!selectedProfit) return;

        try {
            await ApiService.updateMemberProfit(selectedProfit.id, formData);
            enqueueSnackbar('會員分潤項目更新成功', { variant: 'success' });
            setDialogOpen(false);
            await loadData();
        } catch (error) {
            enqueueSnackbar('更新會員分潤項目失敗', { variant: 'error' });
        }
    };

    const handleInputChange = (field: keyof typeof formData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSelectChange = (field: keyof typeof formData) => (
        event: SelectChangeEvent
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PENDING:
                return 'warning';
            case PaymentStatus.PAID:
                return 'success';
            case PaymentStatus.OVERDUE:
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusText = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PENDING:
                return '待發放';
            case PaymentStatus.PAID:
                return '已發放';
            case PaymentStatus.OVERDUE:
                return '逾期';
            default:
                return '未知';
        }
    };

    const handleDeleteClick = (profit: MemberProfit) => {
        if (window.confirm('確定要刪除此會員分潤項目嗎？')) {
            handleDeleteConfirm(profit);
        }
    };

    const handleDeleteConfirm = async (profit: MemberProfit) => {
        try {
            await ApiService.deleteMemberProfit(profit.id);
            enqueueSnackbar('會員分潤項目刪除成功', { variant: 'success' });
            await loadData();
        } catch (error) {
            enqueueSnackbar('刪除會員分潤項目失敗', { variant: 'error' });
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

    // 添加清除分潤項目的處理函數
    const handleClearProfits = () => {
        setClearDialogOpen(true);
    };

    // 確認清除分潤項目
    const handleClearConfirm = async () => {
        try {
            await ApiService.clearMemberProfits(yearFilter);
            enqueueSnackbar(`已清除 ${yearFilter}年${showAllYear ? '' : monthFilter + '月'}的分潤項目`, { variant: 'success' });
            await loadData();
        } catch (err) {
            enqueueSnackbar('清除分潤項目失敗', { variant: 'error' });
        } finally {
            setClearDialogOpen(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">會員分潤管理</Typography>
                <Box>
                    <FormControl sx={{ mr: 2, minWidth: 100 }}>
                        <InputLabel id="year-filter-label" htmlFor="year-filter">年度</InputLabel>
                        <Select
                            labelId="year-filter-label"
                            id="year-filter"
                            name="year-filter"
                            value={yearFilter.toString()}
                            label="年度"
                            onChange={(e) => setYearFilter(Number(e.target.value))}
                            inputProps={{
                                'aria-labelledby': 'year-filter-label'
                            }}
                        >
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                                <MenuItem
                                    key={year}
                                    value={year}
                                    id={`year-option-${year}`}
                                >
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl sx={{ mr: 2, minWidth: 100 }}>
                        <InputLabel id="month-filter-label" htmlFor="month-filter">月份</InputLabel>
                        <Select
                            labelId="month-filter-label"
                            id="month-filter"
                            name="month-filter"
                            value={monthFilter.toString()}
                            label="月份"
                            onChange={(e) => setMonthFilter(Number(e.target.value))}
                            disabled={showAllYear}
                            inputProps={{
                                'aria-labelledby': 'month-filter-label'
                            }}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <MenuItem
                                    key={month}
                                    value={month}
                                    id={`month-option-${month}`}
                                >
                                    {month}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showAllYear}
                                onChange={(e) => {
                                    setShowAllYear(e.target.checked);
                                    if (e.target.checked) {
                                        setMonthFilter(new Date().getMonth() + 1);
                                        // 當勾選當年度時，自動調整為年月升序排序
                                        if (sortField === 'yearMonth' && sortDirection === 'desc') {
                                            setSortDirection('asc');
                                        }
                                    }
                                }}
                            />
                        }
                        label="當年度"
                        sx={{ mr: 2 }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={handleGenerateClick}
                        sx={{ mr: 1 }}
                        aria-label="生成分潤項目"
                    >
                        生成分潤項目
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleClearProfits}
                    >
                        清除分潤項目
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{getSortLabel('investmentName', '投資項目')}</TableCell>
                            <TableCell>{getSortLabel('memberName', '會員')}</TableCell>
                            <TableCell>{getSortLabel('yearMonth', '年月')}</TableCell>
                            <TableCell align="right">{getSortLabel('amount', '分潤金額')}</TableCell>
                            <TableCell>{getSortLabel('status', '發放狀態')}</TableCell>
                            <TableCell>{getSortLabel('paymentMethod', '發放方式')}</TableCell>
                            <TableCell>{getSortLabel('paymentDate', '發放日期')}</TableCell>
                            <TableCell>{getSortLabel('note', '備註')}</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortProfits(memberProfits).map((profit) => {
                            const investment = investments.find(
                                (inv) => inv.id === profit.investmentId
                            );
                            const member = members.find(
                                (m) => m.id === profit.memberId
                            );
                            return (
                                <TableRow key={profit.id}>
                                    <TableCell>{investment?.name || '未知項目'}</TableCell>
                                    <TableCell>{member?.name || '未知會員'}</TableCell>
                                    <TableCell>{`${profit.year}年${profit.month}月`}</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(profit.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusText(profit.status)}
                                            color={getStatusColor(profit.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {profit.paymentMethod ? (
                                            profit.paymentMethod === PaymentMethod.CASH ? '現金' :
                                                profit.paymentMethod === PaymentMethod.BANK_TRANSFER ? '銀行轉帳' :
                                                    profit.paymentMethod === PaymentMethod.CHECK ? '支票' : '其他'
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {profit.paymentDate ? formatDate(profit.paymentDate) : '-'}
                                    </TableCell>
                                    <TableCell>{profit.note || '-'}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditProfit(profit)}
                                            aria-label={`編輯 ${investment?.name || '未知項目'} ${profit.year}年${profit.month}月 的分潤項目`}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteClick(profit)}
                                            color="error"
                                            aria-label={`刪除 ${investment?.name || '未知項目'} ${profit.year}年${profit.month}月 的分潤項目`}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {memberProfits.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    尚無會員分潤資料
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                aria-labelledby="edit-member-profit-title"
                disableEnforceFocus
                keepMounted={false}
            >
                <DialogTitle id="edit-member-profit-title">
                    編輯會員分潤項目
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
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="會員"
                                value={formData.memberId}
                                onChange={handleInputChange('memberId')}
                                required
                                disabled
                            >
                                {members.map((member) => (
                                    <MenuItem key={member.id} value={member.id}>
                                        {member.name}
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
                                label="分潤金額"
                                type="number"
                                value={formData.amount}
                                onChange={handleInputChange('amount')}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>發放狀態</InputLabel>
                                <Select
                                    value={formData.status}
                                    label="發放狀態"
                                    onChange={handleSelectChange('status')}
                                >
                                    <MenuItem value={PaymentStatus.PENDING}>待發放</MenuItem>
                                    <MenuItem value={PaymentStatus.PAID}>已發放</MenuItem>
                                    <MenuItem value={PaymentStatus.OVERDUE}>逾期</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>發放方式</InputLabel>
                                <Select
                                    value={formData.paymentMethod}
                                    label="發放方式"
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
                                label="發放日期"
                                type="date"
                                value={formData.paymentDate}
                                onChange={handleInputChange('paymentDate')}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="備註"
                                value={formData.note}
                                onChange={handleInputChange('note')}
                                multiline
                                rows={3}
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
                maxWidth="md"
                fullWidth
                aria-labelledby="investment-selection-title"
            >
                <DialogTitle id="investment-selection-title">
                    選擇要生成分潤項目的投資項目
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        請選擇要為 {yearFilter} 年生成會員分潤項目的投資項目：
                    </DialogContentText>
                    <Grid container spacing={2}>
                        {investmentSelections.map((investment) => (
                            <Grid item xs={12} sm={6} key={investment.id}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={investment.selected}
                                            onChange={() => handleSelectionChange(investment.id)}
                                            disabled={investment.hasExistingProfits}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2">
                                                {investment.name}
                                            </Typography>
                                            {investment.hasExistingProfits && (
                                                <Typography variant="caption" color="warning.main">
                                                    已存在分潤項目
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectionDialogOpen(false)}>取消</Button>
                    <Button
                        onClick={handleGenerateConfirm}
                        variant="contained"
                        disabled={!investmentSelections.some(inv => inv.selected)}
                    >
                        生成分潤項目
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 清除確認對話框 */}
            <Dialog
                open={clearDialogOpen}
                onClose={() => setClearDialogOpen(false)}
                aria-labelledby="clear-confirmation-title"
            >
                <DialogTitle id="clear-confirmation-title">
                    確認清除分潤項目
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        確定要清除 {yearFilter}年{showAllYear ? '' : monthFilter + '月'} 的所有會員分潤項目嗎？此操作無法復原。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setClearDialogOpen(false)}>取消</Button>
                    <Button onClick={handleClearConfirm} color="error" variant="contained">
                        確認清除
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MemberProfitTab; 