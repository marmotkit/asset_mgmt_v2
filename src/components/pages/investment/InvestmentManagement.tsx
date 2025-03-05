import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Chip,
    Alert,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { Investment, InvestmentStatus } from '../../../types/investment';
import { ApiService } from '../../../services/api.service';
import { formatCurrency } from '../../../utils/format';
import InvestmentDetailDialog from './InvestmentDetailDialog';
import RentalAndProfitManagement from './RentalAndProfitManagement';

const InvestmentManagement: React.FC = () => {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadInvestments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ApiService.getInvestments();
            setInvestments(data || []);
        } catch (err) {
            setError('載入投資資料失敗');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInvestments();
    }, [loadInvestments]);

    const handleAddInvestment = () => {
        setSelectedInvestment(null);
        setIsDialogOpen(true);
    };

    const handleEditInvestment = (investment: Investment) => {
        setSelectedInvestment(investment);
        setIsDialogOpen(true);
    };

    const handleSaveInvestment = async (investment: Investment) => {
        try {
            setLoading(true);
            setError(null);
            if (investment.id) {
                await ApiService.updateInvestment(investment);
            } else {
                await ApiService.createInvestment(investment);
            }
            await loadInvestments();
            setIsDialogOpen(false);
        } catch (err) {
            setError('保存投資資料失敗');
        } finally {
            setLoading(false);
        }
    };

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

    if (loading && investments.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                    投資管理
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddInvestment}
                >
                    新增投資
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>投資項目</TableCell>
                            <TableCell>類型</TableCell>
                            <TableCell>投資金額</TableCell>
                            <TableCell>起訖日期</TableCell>
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
                                    <Chip
                                        label={getStatusLabel(investment.status)}
                                        color={getStatusColor(investment.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="編輯">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditInvestment(investment)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {investments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    尚無投資項目
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h5" sx={{ mb: 3 }}>
                租賃與分潤管理
            </Typography>

            <RentalAndProfitManagement
                investments={investments}
                onUpdateInvestment={handleSaveInvestment}
            />

            <InvestmentDetailDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveInvestment}
                investment={selectedInvestment}
            />
        </Box>
    );
};

export default InvestmentManagement;