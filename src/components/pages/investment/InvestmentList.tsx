import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Typography,
} from '@mui/material';
import { Investment, LeaseItem, RentalPayment, ProfitSharingType } from '../../../types/investment';
import { formatCurrency } from '../../../utils/format';

interface InvestmentListProps {
    investments: Investment[];
    onManagePayment: (investment: Investment) => void;
    onEdit: (investment: Investment) => void;
    onDelete: (investment: Investment) => void;
}

const InvestmentList: React.FC<InvestmentListProps> = ({
    investments,
    onManagePayment,
    onEdit,
    onDelete,
}) => {
    const calculateTotalRental = (leaseItems: LeaseItem[]): number => {
        return leaseItems.reduce((total, item) => {
            const itemTotal = item.rentalPayments.reduce(
                (sum, payment) => sum + payment.amount,
                0
            );
            return total + itemTotal;
        }, 0);
    };

    const calculateProfitSharing = (leaseItem: LeaseItem, totalRental: number): number => {
        if (!leaseItem.profitSharing) return 0;

        const { type, value } = leaseItem.profitSharing;
        switch (type) {
            case 'percentage':
                return (totalRental * value) / 100;
            case 'monthly_fixed':
                return value * leaseItem.rentalPayments.length;
            case 'yearly_fixed':
                const months = leaseItem.rentalPayments.length;
                return (value / 12) * months;
            default:
                return 0;
        }
    };

    const calculateTotalProfitSharing = (leaseItems: LeaseItem[]): number => {
        return leaseItems.reduce((total, item) => {
            const itemRentalTotal = item.rentalPayments.reduce(
                (sum, payment) => sum + payment.amount,
                0
            );
            return total + calculateProfitSharing(item, itemRentalTotal);
        }, 0);
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>項目名稱</TableCell>
                        <TableCell>租賃項目數</TableCell>
                        <TableCell>累計租金</TableCell>
                        <TableCell>累計分潤</TableCell>
                        <TableCell>操作</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {investments.map((investment) => {
                        const totalRental = calculateTotalRental(investment.leaseItems || []);
                        const totalProfitSharing = calculateTotalProfitSharing(investment.leaseItems || []);

                        return (
                            <TableRow key={investment.id}>
                                <TableCell>
                                    <Typography variant="body1">
                                        {investment.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {investment.description}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    {investment.leaseItems?.length || 0} 個
                                </TableCell>
                                <TableCell>{formatCurrency(totalRental)}</TableCell>
                                <TableCell>{formatCurrency(totalProfitSharing)}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => onManagePayment(investment)}
                                        sx={{ mr: 1 }}
                                    >
                                        管理租金/分潤
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => onEdit(investment)}
                                        sx={{ mr: 1 }}
                                    >
                                        編輯
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => onDelete(investment)}
                                    >
                                        刪除
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default InvestmentList;