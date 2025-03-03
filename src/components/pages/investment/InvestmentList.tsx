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
import { Investment, InvestmentStatus } from '../../../types/investment';
import { Company } from '../../../types/company';
import ApiService from '../../../services/api.service';
import { formatDate } from '../../../utils/dateUtils';
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

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>項目名稱</TableCell>
                        <TableCell>公司名稱</TableCell>
                        <TableCell align="right">投資金額</TableCell>
                        <TableCell>開始日期</TableCell>
                        <TableCell>結束日期</TableCell>
                        <TableCell>狀態</TableCell>
                        <TableCell>分潤設定</TableCell>
                        <TableCell>合約</TableCell>
                        <TableCell>操作</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {investments.map((investment) => (
                        <TableRow key={investment.id}>
                            <TableCell>{investment.name}</TableCell>
                            <TableCell>
                                {companies[investment.companyId]?.name || '-'}
                            </TableCell>
                            <TableCell align="right">{formatCurrency(investment.amount)}</TableCell>
                            <TableCell>{formatDate(investment.startDate)}</TableCell>
                            <TableCell>
                                {investment.endDate ? formatDate(investment.endDate) : '-'}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={statusLabels[investment.status]}
                                    color={statusColors[investment.status]}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {renderProfitSharingInfo(investment)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {investment.contract ? (
                                    <Link href={investment.contract.url} target="_blank">
                                        查看合約
                                    </Link>
                                ) : (
                                    <Typography variant="caption" color="textSecondary">
                                        未上傳
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Tooltip title="編輯">
                                    <IconButton size="small" onClick={() => onEdit(investment)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="刪除">
                                    <IconButton size="small" onClick={() => onDelete(investment.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InvestmentList; 