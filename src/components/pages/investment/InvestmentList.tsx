import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Link,
    Typography,
    Tooltip,
    Box,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { Investment, InvestmentStatus, ProfitSharingType } from '../../../types/investment';
import { Company } from '../../../types/company';
import ApiService from '../../../services/api.service';
import { format } from 'date-fns';
import { formatCurrency } from '../../../utils/numberUtils';

interface InvestmentListProps {
    investments: Investment[];
    onEdit: (investment: Investment) => void;
    onDelete: (id: string) => void;
}

const statusColors: Record<InvestmentStatus, 'default' | 'primary' | 'success' | 'error'> = {
    pending: 'default',
    active: 'primary',
    completed: 'success',
    terminated: 'error',
};

const statusLabels: Record<InvestmentStatus, string> = {
    pending: '審核中',
    active: '進行中',
    completed: '已完成',
    terminated: '已終止',
};

const InvestmentList: React.FC<InvestmentListProps> = ({
    investments,
    onEdit,
    onDelete,
}) => {
    const [companies, setCompanies] = useState<Record<string, Company>>({});

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            const companiesList = await ApiService.getCompanies();
            const companiesMap = companiesList.reduce((acc, company) => {
                acc[company.id] = company;
                return acc;
            }, {} as Record<string, Company>);
            setCompanies(companiesMap);
        } catch (error) {
            console.error('載入公司資料失敗:', error);
        }
    };

    const renderProfitSharingInfo = (investment: Investment) => {
        if (!investment.profitSharing) return '未設定';

        const { type, value, description } = investment.profitSharing;
        switch (type) {
            case 'percentage':
                return `${value}%`;
            case 'fixed':
                return `固定 ${formatCurrency(value)}`;
            case 'other':
                return `其他: ${description || ''}`;
            default:
                return '未設定';
        }
    };

    const calculateTotalRental = (investment: Investment): number => {
        return investment.rentalPayments
            ?.filter(payment => payment.status === 'received')
            ?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    };

    const calculateTotalProfitSharing = (investment: Investment): number => {
        const totalRental = calculateTotalRental(investment);

        if (!investment.profitSharing) return 0;

        const { type, value } = investment.profitSharing;
        let profitAmount = 0;

        switch (type) {
            case 'percentage':
                profitAmount = totalRental * (value / 100);
                break;
            case 'fixed':
                // 固定金額乘以已收租金次數
                const paidPaymentsCount = investment.rentalPayments
                    ?.filter(payment => payment.status === 'received')
                    ?.length || 0;
                profitAmount = value * paidPaymentsCount;
                break;
            case 'other':
                // 其他類型暫不計算
                profitAmount = 0;
                break;
        }

        // 檢查最低和最高分潤限制
        if (investment.profitSharing.minimumAmount) {
            profitAmount = Math.max(profitAmount, investment.profitSharing.minimumAmount);
        }
        if (investment.profitSharing.maximumAmount) {
            profitAmount = Math.min(profitAmount, investment.profitSharing.maximumAmount);
        }

        return profitAmount;
    };

    const formatDate = (date: string | null | undefined): string => {
        if (!date) return '';
        return format(new Date(date), 'yyyy/MM/dd');
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>名稱</TableCell>
                        <TableCell>類型</TableCell>
                        <TableCell>公司</TableCell>
                        <TableCell>金額</TableCell>
                        <TableCell>狀態</TableCell>
                        <TableCell>開始日期</TableCell>
                        <TableCell>結束日期</TableCell>
                        <TableCell>操作</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {investments.map((investment) => (
                        <TableRow key={investment.id}>
                            <TableCell>
                                <Typography variant="body1">
                                    {investment.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {investment.description}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {investment.type === 'movable' ? '動產' : '不動產'}
                            </TableCell>
                            <TableCell>
                                {companies[investment.companyId]?.name || '-'}
                            </TableCell>
                            <TableCell>
                                {formatCurrency(investment.amount)}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={statusLabels[investment.status]}
                                    color={statusColors[investment.status]}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                {investment.startDate ? format(new Date(investment.startDate), 'yyyy-MM-dd') : '-'}
                            </TableCell>
                            <TableCell>
                                {investment.endDate ? format(new Date(investment.endDate), 'yyyy-MM-dd') : '-'}
                            </TableCell>
                            <TableCell>
                                <Box>
                                    <Tooltip title="編輯">
                                        <IconButton
                                            size="small"
                                            onClick={() => onEdit(investment)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="刪除">
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                if (window.confirm('確定要刪除此投資項目嗎？')) {
                                                    onDelete(investment.id);
                                                }
                                            }}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InvestmentList;