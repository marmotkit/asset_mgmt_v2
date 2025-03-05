import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    Box,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { Investment, LeaseItem, LeaseStatus, ProfitSharingType } from '../../../types/investment';
import { formatCurrency } from '../../../utils/format';
import LeaseItemDialog from './LeaseItemDialog';

interface RentalAndProfitManagementProps {
    investments: Investment[];
    onUpdateInvestment: (investment: Investment) => Promise<void>;
}

const RentalAndProfitManagement: React.FC<RentalAndProfitManagementProps> = ({
    investments,
    onUpdateInvestment
}): React.ReactElement => {
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
    const [selectedLeaseItem, setSelectedLeaseItem] = useState<LeaseItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddLeaseItem = (investment: Investment) => {
        setSelectedInvestment(investment);
        setSelectedLeaseItem(null);
        setIsDialogOpen(true);
    };

    const handleEditLeaseItem = (investment: Investment, leaseItem: LeaseItem) => {
        setSelectedInvestment(investment);
        setSelectedLeaseItem(leaseItem);
        setIsDialogOpen(true);
    };

    const handleSaveLeaseItem = async (leaseItem: LeaseItem) => {
        if (!selectedInvestment) return;

        const updatedInvestment = {
            ...selectedInvestment,
            leaseItems: selectedLeaseItem
                ? selectedInvestment.leaseItems.map(item =>
                    item.id === leaseItem.id ? leaseItem : item
                )
                : [...(selectedInvestment.leaseItems || []), leaseItem]
        };

        await onUpdateInvestment(updatedInvestment);
        setIsDialogOpen(false);
    };

    const getStatusColor = (status: LeaseStatus): "success" | "error" | "warning" | "default" => {
        switch (status) {
            case 'active':
                return 'success';
            case 'terminated':
                return 'error';
            case 'expired':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: LeaseStatus): string => {
        const statusLabels: Record<LeaseStatus, string> = {
            active: '進行中',
            expired: '已到期',
            terminated: '已終止'
        };
        return statusLabels[status] || status;
    };

    const calculateMonthlyRental = (leaseItem: LeaseItem): number => {
        return leaseItem.rentalAmount || 0;
    };

    const calculateProfitSharing = (leaseItem: LeaseItem): number => {
        const profitSharing = leaseItem.profitSharing;
        if (!profitSharing) return 0;

        switch (profitSharing.type) {
            case 'percentage':
                return (leaseItem.rentalAmount * profitSharing.value) / 100;
            case 'monthly_fixed':
                return profitSharing.value;
            case 'yearly_fixed':
                return profitSharing.value / 12;
            default:
                return 0;
        }
    };

    const getProfitSharingLabel = (leaseItem: LeaseItem): string => {
        const profitSharing = leaseItem.profitSharing;
        if (!profitSharing) return '無分潤設定';

        const typeLabels: Record<ProfitSharingType, string> = {
            monthly_fixed: '每月固定',
            yearly_fixed: '每年固定',
            percentage: '營收百分比'
        };

        return `${typeLabels[profitSharing.type]}: ${profitSharing.value}${profitSharing.type === 'percentage' ? '%' : '元'}`;
    };

    return (
        <Box>
            {investments.map((investment) => (
                <Paper key={investment.id} sx={{ mb: 3, p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            {investment.name}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddLeaseItem(investment)}
                        >
                            新增租賃項目
                        </Button>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>租賃項目</TableCell>
                                    <TableCell>承租人</TableCell>
                                    <TableCell>起訖日期</TableCell>
                                    <TableCell>每月租金</TableCell>
                                    <TableCell>分潤設定</TableCell>
                                    <TableCell>狀態</TableCell>
                                    <TableCell>操作</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(investment.leaseItems || []).map((leaseItem) => (
                                    <TableRow key={leaseItem.id}>
                                        <TableCell>
                                            <Typography variant="body1">
                                                {leaseItem.name}
                                            </Typography>
                                            {leaseItem.description && (
                                                <Typography variant="body2" color="textSecondary">
                                                    {leaseItem.description}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {leaseItem.tenantInfo?.name}
                                            {leaseItem.tenantInfo?.contact && (
                                                <Typography variant="body2" color="textSecondary">
                                                    {leaseItem.tenantInfo.contact}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {leaseItem.startDate} ~ {leaseItem.endDate}
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(calculateMonthlyRental(leaseItem))}
                                        </TableCell>
                                        <TableCell>
                                            {getProfitSharingLabel(leaseItem)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(leaseItem.status)}
                                                color={getStatusColor(leaseItem.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="編輯">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditLeaseItem(investment, leaseItem)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!investment.leaseItems || investment.leaseItems.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            尚無租賃項目
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ))}

            {selectedInvestment && (
                <LeaseItemDialog
                    open={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onSave={handleSaveLeaseItem}
                    leaseItem={selectedLeaseItem}
                    investmentId={selectedInvestment.id}
                />
            )}
        </Box>
    );
};

export default RentalAndProfitManagement;
