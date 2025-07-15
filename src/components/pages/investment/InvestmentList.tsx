import React from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Investment, InvestmentStatus } from '../../../types/investment';
import { formatCurrency } from '../../../utils/format';


interface InvestmentListProps {
    investments: Investment[];
    onEditInvestment: (investment: Investment) => void;
    onDeleteInvestment: (investment: Investment) => void;
}

const InvestmentList: React.FC<InvestmentListProps> = ({
    investments,
    onEditInvestment,
    onDeleteInvestment
}) => {

    const getStatusColor = (status: InvestmentStatus): "success" | "error" | "warning" | "default" => {
        switch (status) {
            case 'active':
                return 'success';
            case 'completed':
                return 'success';
            case 'terminated':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: InvestmentStatus): string => {
        switch (status) {
            case 'active':
                return '進行中';
            case 'completed':
                return '已完成';
            case 'terminated':
                return '已終止';
            case 'pending':
                return '審核中';
            default:
                return status;
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>投資項目</TableCell>
                        <TableCell>類型</TableCell>
                        <TableCell>投資金額</TableCell>
                        <TableCell>起訖日期</TableCell>
                        <TableCell>所屬公司</TableCell>
                        <TableCell>所屬會員</TableCell>
                        <TableCell>狀態</TableCell>
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
                                {investment.description && (
                                    <Typography variant="body2" color="textSecondary">
                                        {investment.description}
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                {investment.type === 'movable' ? '動產' : '不動產'}
                            </TableCell>
                            <TableCell>
                                {formatCurrency(investment.amount)}
                            </TableCell>
                            <TableCell>
                                {investment.startDate} {investment.endDate ? `~ ${investment.endDate}` : ''}
                            </TableCell>
                            <TableCell>
                                {investment.company_name || ''}
                            </TableCell>
                            <TableCell>
                                {investment.user_name || ''}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={getStatusLabel(investment.status)}
                                    color={getStatusColor(investment.status)}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                <Box display="flex" gap={1}>
                                    <Tooltip title="編輯">
                                        <IconButton
                                            size="small"
                                            onClick={() => onEditInvestment(investment)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="刪除">
                                        <IconButton
                                            size="small"
                                            onClick={() => onDeleteInvestment(investment)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                    {investments.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} align="center">
                                尚無投資項目
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InvestmentList;