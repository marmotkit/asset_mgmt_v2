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
} from '@mui/material';
import {
    Edit as EditIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Investment } from '../../../types/investment';
import { Member } from '../../../types/member';
import { MemberProfit, PaymentStatus, PaymentMethod } from '../../../types/rental';
import { ApiService } from '../../../services';
import { formatCurrency, formatDate } from '../../../utils/format';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';

interface MemberProfitTabProps {
    investments: Investment[];
}

const MemberProfitTab: React.FC<MemberProfitTabProps> = ({ investments }) => {
    const [members, setMembers] = useState<Member[]>([]);
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
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        paymentDate: '',
        note: '',
    });

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

    const handleGenerateProfits = async () => {
        if (!window.confirm(`確定要生成 ${yearFilter} 年度的會員分潤項目？`)) return;

        setLoading(true);
        try {
            await Promise.all(investments.map(investment =>
                ApiService.generateMemberProfits(investment.id, yearFilter)
            ));
            await loadData();
        } catch (err) {
            setError('生成會員分潤項目失敗');
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
            paymentMethod: profit.paymentMethod || PaymentMethod.BANK_TRANSFER,
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
                        onClick={handleGenerateProfits}
                        sx={{ mr: 1 }}
                    >
                        生成分潤項目
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
                                        {profit.paymentMethod === PaymentMethod.CASH ? '現金' :
                                            profit.paymentMethod === PaymentMethod.BANK_TRANSFER ? '銀行轉帳' :
                                                profit.paymentMethod === PaymentMethod.CHECK ? '支票' : '其他'}
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
        </Box>
    );
};

export default MemberProfitTab; 