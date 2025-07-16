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
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    FormControlLabel,
    Checkbox,
    Alert,
    TableSortLabel,
} from '@mui/material';
import { MemberProfit, PaymentStatus, PaymentMethod } from '../../../types/rental';
import { Investment } from '../../../types/investment';
import { User } from '../../../types/user';
import { ApiService } from '../../../services';
import { formatCurrency, formatDate } from '../../../utils/format';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

type SortField = 'investmentName' | 'yearMonth' | 'amount' | 'status' | 'paymentDate' | 'paymentMethod';
type SortDirection = 'asc' | 'desc';

const AssetProfitStatusTab: React.FC = () => {
    const { user } = useAuth();
    const [memberProfits, setMemberProfits] = useState<MemberProfit[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
    const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
    const [showAllYear, setShowAllYear] = useState<boolean>(true); // 預設顯示全年
    const [sortField, setSortField] = useState<SortField>('yearMonth');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const { enqueueSnackbar } = useSnackbar();

    // 檢查用戶權限
    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'business' || user?.role === 'lifetime';

    useEffect(() => {
        loadData();
    }, [yearFilter, monthFilter, showAllYear]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 載入投資項目和會員資料
            const [investmentsData, membersData] = await Promise.all([
                ApiService.getInvestments(),
                ApiService.getMembers()
            ]);

            setInvestments(investmentsData);
            setMembers(membersData);

            // 根據用戶權限載入會員分潤資料
            let profitsData: MemberProfit[] = [];

            if (isAdmin || isManager) {
                // 管理員和管理者可以看到全部資料
                profitsData = await ApiService.getMemberProfits(
                    undefined,
                    undefined,
                    yearFilter,
                    showAllYear ? undefined : monthFilter
                );
            } else {
                // 一般會員只能看到自己的分潤資料
                profitsData = await ApiService.getMemberProfits(
                    undefined,
                    user?.id, // 只查詢當前用戶的分潤
                    yearFilter,
                    showAllYear ? undefined : monthFilter
                );
            }

            setMemberProfits(profitsData);
        } catch (err) {
            console.error('載入資產分潤狀況失敗:', err);
            setError('載入資料失敗');
            enqueueSnackbar('載入資產分潤狀況失敗', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

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
                case 'paymentDate':
                    aValue = a.paymentDate || '';
                    bValue = b.paymentDate || '';
                    break;
                case 'paymentMethod':
                    aValue = getPaymentMethodText(a.paymentMethod);
                    bValue = getPaymentMethodText(b.paymentMethod);
                    break;
                default:
                    aValue = '';
                    bValue = '';
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortLabel = (field: SortField, label: string) => (
        <TableSortLabel
            active={sortField === field}
            direction={sortField === field ? sortDirection : 'asc'}
            onClick={() => handleSort(field)}
        >
            {label}
        </TableSortLabel>
    );

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
                return '已收';
            case PaymentStatus.PENDING:
                return '待收';
            case PaymentStatus.OVERDUE:
                return '逾期';
            default:
                return '未知';
        }
    };

    const getPaymentMethodText = (method?: PaymentMethod) => {
        switch (method) {
            case PaymentMethod.CASH:
                return '現金';
            case PaymentMethod.BANK_TRANSFER:
                return '銀行轉帳';
            case PaymentMethod.CHECK:
                return '支票';
            default:
                return '-';
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">資產分潤狀況</Typography>
                <Box>
                    <FormControl sx={{ mr: 2, minWidth: 100 }}>
                        <InputLabel id="year-filter-label">年度</InputLabel>
                        <Select
                            labelId="year-filter-label"
                            value={yearFilter.toString()}
                            label="年度"
                            onChange={(e) => setYearFilter(Number(e.target.value))}
                        >
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year} 年
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {!showAllYear && (
                        <FormControl sx={{ mr: 2, minWidth: 100 }}>
                            <InputLabel id="month-filter-label">月份</InputLabel>
                            <Select
                                labelId="month-filter-label"
                                value={monthFilter.toString()}
                                label="月份"
                                onChange={(e) => setMonthFilter(Number(e.target.value))}
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <MenuItem key={month} value={month}>
                                        {month} 月
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showAllYear}
                                onChange={(e) => setShowAllYear(e.target.checked)}
                            />
                        }
                        label="當年度"
                        sx={{ mr: 2 }}
                    />
                </Box>
            </Box>

            {!isAdmin && !isManager && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    您只能查看屬於自己的資產分潤狀況
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{getSortLabel('investmentName', '投資項目')}</TableCell>
                            <TableCell>{getSortLabel('yearMonth', '年月')}</TableCell>
                            <TableCell align="right">{getSortLabel('amount', '分潤金額')}</TableCell>
                            <TableCell>{getSortLabel('status', '收款狀態')}</TableCell>
                            <TableCell>{getSortLabel('paymentMethod', '收款方式')}</TableCell>
                            <TableCell>{getSortLabel('paymentDate', '收款日期')}</TableCell>
                            <TableCell>備註</TableCell>
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
                                        {getPaymentMethodText(profit.paymentMethod)}
                                    </TableCell>
                                    <TableCell>
                                        {profit.paymentDate ? formatDate(profit.paymentDate) : '-'}
                                    </TableCell>
                                    <TableCell>{profit.note || '-'}</TableCell>
                                </TableRow>
                            );
                        })}
                        {memberProfits.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    尚無資產分潤資料
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AssetProfitStatusTab; 