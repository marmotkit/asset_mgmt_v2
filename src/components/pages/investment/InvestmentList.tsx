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
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { Investment, InvestmentStatus } from '../../../types/investment';
import { Company } from '../../../types/company';
import ApiService from '../../../services/api.service';

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

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('zh-TW');
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>項目名稱</TableCell>
                        <TableCell>公司名稱</TableCell>
                        <TableCell>投資金額</TableCell>
                        <TableCell>開始日期</TableCell>
                        <TableCell>結束日期</TableCell>
                        <TableCell>狀態</TableCell>
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
                            <TableCell>{formatAmount(investment.amount)}</TableCell>
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
                                <IconButton size="small" onClick={() => onEdit(investment)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => onDelete(investment.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InvestmentList; 