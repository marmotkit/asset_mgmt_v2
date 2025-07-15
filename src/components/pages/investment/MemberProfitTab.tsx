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
} from '@mui/material';
import {
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { Investment } from '../../../types/investment';
import { User } from '../../../types/user';
import { MemberProfit, PaymentStatus, PaymentMethod } from '../../../types/rental';
import { ApiService } from '../../../services/api.service';
import { formatCurrency, formatDate } from '../../../utils/format';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import zhTW from 'date-fns/locale/zh-TW';
import { useParams } from 'react-router-dom';
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

const MemberProfitTab: React.FC<MemberProfitTabProps> = ({ investments }) => {
    const { id: investmentId } = useParams<{ id: string }>();
    const [members, setMembers] = useState<User[]>([]);
    const [memberProfits, setMemberProfits] = useState<MemberProfit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProfit, setSelectedProfit] = useState<MemberProfit | null>(null);
    const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
    const [formData, setFormData] = useState<Partial<MemberProfit>>({
        investmentId: '',
        memberId: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        amount: 0,
        status: PaymentStatus.PENDING,
        paymentDate: '',
        note: '',
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [profitToDelete, setProfitToDelete] = useState<MemberProfit | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    // 新增投資項目選擇相關狀態
    const [selectionDialogOpen, setSelectionDialogOpen] = useState(false);
    const [investmentSelections, setInvestmentSelections] = useState<InvestmentSelection[]>([]);

    useEffect(() => {
        loadData();
    }, [yearFilter, monthFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [membersData, profitsData] = await Promise.all([
                ApiService.getMembers(),
                ApiService.getMemberProfits(undefined, undefined, yearFilter, monthFilter),
            ]);
            setMembers(membersData);
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

            // 獲取有租賃標準和分潤標準的投資項目
            const availableInvestments = await ApiService.getAvailableInvestmentsForMemberProfits();

            if (availableInvestments.length === 0) {
                enqueueSnackbar('沒有可用的投資項目。請確保投資項目已設定租賃標準和分潤標準。', { variant: 'warning' });
                return;
            }

            // 準備投資項目選擇清單
            const selections: InvestmentSelection[] = availableInvestments.map(inv => ({
                id: inv.id,
                name: inv.name,
                selected: false,
                hasExistingProfits: existingProfits.some(p => p.investmentId === inv.id)
            }));

            setInvestmentSelections(selections);
            setSelectionDialogOpen(true);
        } catch (error) {
            enqueueSnackbar('準備生成資料時發生錯誤', { variant: 'error' });
        }
    };

    const handleGenerateConfirm = async () => {
        setSelectionDialogOpen(false);
        setLoading(true);
        let hasError = false;
        let errorMessage = '';
        console.log('開始生成會員分潤項目...');

        try {
            // 取得選擇的投資項目
            const selectedInvestments = investmentSelections.filter(inv => inv.selected);
            console.log(`選擇了 ${selectedInvestments.length} 個投資項目進行分潤生成`);

            if (selectedInvestments.length === 0) {
                enqueueSnackbar('請選擇至少一個投資項目進行分潤生成', { variant: 'warning' });
                setLoading(false);
                return;
            }

            // 依序處理每個選擇的投資項目
            for (const inv of selectedInvestments) {
                try {
                    console.log(`正在為投資項目 ${inv.name}(${inv.id}) 生成分潤...`);
                    await ApiService.generateMemberProfits(inv.id, yearFilter);
                    console.log(`投資項目 ${inv.name} 分潤生成成功`);
                } catch (error) {
                    hasError = true;
                    const errMsg = error instanceof Error ? error.message : '生成失敗';
                    errorMessage += `${inv.name}: ${errMsg}\n`;
                    console.error(`投資項目 ${inv.name} 分潤生成失敗:`, error);

                    // 檢查是否是會員不存在的問題
                    if (errMsg.includes('找不到所屬會員')) {
                        // 提示用戶需要檢查投資項目與會員的關聯
                        enqueueSnackbar(`投資項目 ${inv.name} 的所屬會員不存在或未設定，請先更新投資項目的會員關聯`,
                            { variant: 'error', autoHideDuration: 6000 });
                    }
                }
            }

            if (hasError) {
                console.warn('部分投資項目生成失敗:', errorMessage);
                enqueueSnackbar('部分投資項目生成失敗:\n' + errorMessage, {
                    variant: 'warning',
                    autoHideDuration: 8000
                });
            } else {
                console.log('所有投資項目分潤生成完成');
                enqueueSnackbar('會員分潤項目生成完成', { variant: 'success' });
            }

            console.log('重新載入分潤資料...');
            await loadData();
            console.log('資料重新載入完成');

            // 移除強制跳轉，讓頁面保持在當前狀態
            console.log('分潤生成完成，頁面保持在當前狀態');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : '未知錯誤';
            console.error('生成會員分潤項目時發生錯誤:', errorMsg);
            enqueueSnackbar(`生成會員分潤項目時發生錯誤: ${errorMsg}`, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfit = (profit: MemberProfit) => {
        setSelectedProfit(profit);
        setFormData({
            investmentId: profit.investmentId,
            memberId: profit.memberId,
            year: profit.year,
            month: profit.month,
            amount: profit.amount,
            status: profit.status,
            paymentDate: profit.paymentDate || '',
            note: profit.note || '',
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.investmentId || !formData.memberId || !formData.amount || !formData.status) {
            setError('請填寫必要欄位');
            return;
        }

        setLoading(true);
        try {
            if (selectedProfit) {
                await ApiService.updateMemberProfit(selectedProfit.id, formData);
            }
            await loadData();
            setDialogOpen(false);
        } catch (err) {
            setError('儲存會員分潤項目失敗');
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
                return '已發放';
            case PaymentStatus.PENDING:
                return '待發放';
            case PaymentStatus.OVERDUE:
                return '逾期';
            default:
                return '未知';
        }
    };

    const handleDeleteClick = (profit: MemberProfit) => {
        setProfitToDelete(profit);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!profitToDelete) return;

        try {
            await ApiService.deleteMemberProfit(profitToDelete.id);
            enqueueSnackbar('分潤項目已刪除', { variant: 'success' });
            await loadData();
        } catch (error) {
            enqueueSnackbar('刪除分潤項目失敗', { variant: 'error' });
        } finally {
            setDeleteDialogOpen(false);
            setProfitToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setProfitToDelete(null);
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

    const handleClearProfits = async () => {
        if (window.confirm('確定要清除所有會員分潤項目嗎？這將刪除所有已生成的分潤項目。')) {
            setLoading(true);
            try {
                await ApiService.clearMemberProfits();
                enqueueSnackbar('已清除所有會員分潤項目', { variant: 'success' });
                await loadData();
            } catch (error) {
                enqueueSnackbar('清除會員分潤項目失敗', { variant: 'error' });
            } finally {
                setLoading(false);
            }
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
                        onClick={handleGenerateClick}
                        sx={{ mr: 1 }}
                    >
                        生成分潤項目
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleClearProfits}
                        sx={{ mr: 1 }}
                    >
                        清除分潤項目
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>投資項目</TableCell>
                            <TableCell>會員</TableCell>
                            <TableCell>年月</TableCell>
                            <TableCell align="right">分潤金額</TableCell>
                            <TableCell>發放狀態</TableCell>
                            <TableCell>發放方式</TableCell>
                            <TableCell>發放日期</TableCell>
                            <TableCell>備註</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {memberProfits.map((profit) => {
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
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteClick(profit)}
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

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
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
                        <Grid item xs={12} sm={6}>
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
                        <Grid item xs={12} sm={6}>
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

            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    確定要刪除這個分潤項目嗎？此操作無法復原。
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>取消</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        刪除
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 投資項目選擇對話框 */}
            <Dialog
                open={selectionDialogOpen}
                onClose={() => setSelectionDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>選擇要生成分潤項目的投資項目</DialogTitle>
                <DialogContent>
                    {investmentSelections.map((inv) => (
                        <Box key={inv.id} sx={{ mb: 1 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={inv.selected}
                                        onChange={() => handleSelectionChange(inv.id)}
                                        disabled={inv.hasExistingProfits}
                                    />
                                }
                                label={inv.name}
                            />
                            {inv.hasExistingProfits && (
                                <Typography variant="caption" color="error">
                                    （已存在分潤項目）
                                </Typography>
                            )}
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectionDialogOpen(false)}>取消</Button>
                    <Button
                        onClick={handleGenerateConfirm}
                        variant="contained"
                        disabled={!investmentSelections.some(inv => inv.selected)}
                    >
                        生成
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MemberProfitTab; 