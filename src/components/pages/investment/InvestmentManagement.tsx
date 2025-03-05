import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    ButtonGroup,
    Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Investment, RentalPayment } from '../../../types/investment';
import ApiService from '../../../services/api.service';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import InvestmentList from './InvestmentList';
import InvestmentDetailDialog from './InvestmentDetailDialog';
import { debounce } from 'lodash';
import { message } from 'antd';
import PaymentManager from './InvestmentPaymentManager';
import dayjs from 'dayjs';

const InvestmentManagement: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
    const [isPaymentManagerOpen, setIsPaymentManagerOpen] = useState(false);

    const loadInvestments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('載入投資資料...');
            const data = await ApiService.getInvestments();
            console.log('載入的投資資料:', data);
            setInvestments(data || []);
        } catch (err) {
            console.error('載入投資資料失敗:', err);
            setError('載入投資資料失敗');
            message.error('載入投資資料失敗');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInvestments();
    }, [loadInvestments]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleAddInvestment = () => {
        setSelectedInvestment(null);
        setDialogOpen(true);
    };

    const handleEdit = (investment: Investment) => {
        setSelectedInvestment(investment);
        setDialogOpen(true);
    };

    const handleInvestmentUpdate = async (data: Partial<Investment>) => {
        try {
            if (!selectedInvestment) return;

            setLoading(true);
            console.log('更新投資項目:', selectedInvestment.id, data);
            await ApiService.updateInvestment(selectedInvestment.id, data);
            console.log('投資項目更新成功');

            // 更新成功後重新載入資料
            await loadInvestments();
            setDialogOpen(false);
        } catch (err) {
            console.error('更新投資項目失敗:', err);
            message.error('更新投資項目失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleInvestmentCreate = async (data: Partial<Investment>) => {
        try {
            setLoading(true);
            console.log('新增投資項目:', data);
            const newInvestment = await ApiService.createInvestment(data);
            console.log('投資項目新增成功:', newInvestment);

            // 新增成功後更新狀態
            setInvestments(prev => [...prev, newInvestment]);
            setDialogOpen(false);
            message.success('投資項目新增成功');
        } catch (err) {
            console.error('新增投資項目失敗:', err);
            message.error('新增投資項目失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleInvestmentSave = async (data: Partial<Investment>) => {
        try {
            if (selectedInvestment) {
                await handleInvestmentUpdate(data);
            } else {
                await handleInvestmentCreate(data);
            }
        } catch (err) {
            console.error('儲存投資項目失敗:', err);
            setError('儲存投資項目失敗');
        }
    };

    const handlePaymentManage = (investment: Investment) => {
        setSelectedInvestment(investment);
        setIsPaymentManagerOpen(true);
    };

    const handleUpdatePayment = async (payment: RentalPayment) => {
        if (!selectedInvestment) return;

        try {
            // 更新投資項目中的租金收款記錄
            const updatedInvestment = {
                ...selectedInvestment,
                rentalPayments: selectedInvestment.rentalPayments.map(p =>
                    p.id === payment.id ? payment : p
                )
            };

            await ApiService.updateInvestment(updatedInvestment.id, updatedInvestment);
            loadInvestments();
        } catch (error) {
            console.error('Failed to update payment:', error);
        }
    };

    const handleUpdateProfitSharing = async (percentage: number) => {
        if (!selectedInvestment) return;

        try {
            const updatedInvestment = {
                ...selectedInvestment,
                profitSharing: {
                    type: 'percentage' as const,
                    value: percentage
                }
            };

            await ApiService.updateInvestment(updatedInvestment.id, updatedInvestment);
            loadInvestments();
        } catch (error) {
            console.error('Failed to update profit sharing:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setLoading(true);
            console.log('刪除投資項目:', id);
            await ApiService.deleteInvestment(id);
            console.log('投資項目刪除成功');

            // 更新列表
            setInvestments(prev => prev.filter(item => item.id !== id));
            message.success('投資項目已刪除');
        } catch (err) {
            console.error('刪除投資項目失敗:', err);
            message.error('刪除投資項目失敗');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4">投資項目管理</Typography>
                        <Button
                            variant="contained"
                            onClick={() => setDialogOpen(true)}
                            startIcon={<AddIcon />}
                        >
                            新增投資項目
                        </Button>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <InvestmentList
                        investments={investments}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </Grid>
            </Grid>

            {dialogOpen && (
                <InvestmentDetailDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    investmentType={selectedInvestment?.type || 'movable'}
                    onSave={selectedInvestment ? handleInvestmentUpdate : handleInvestmentCreate}
                    investment={selectedInvestment || undefined}
                />
            )}

            {selectedInvestment && (
                <PaymentManager
                    open={isPaymentManagerOpen}
                    onClose={() => setIsPaymentManagerOpen(false)}
                    investmentName={selectedInvestment.name}
                    startDate={selectedInvestment.startDate || dayjs().format('YYYY-MM-DD')}
                    endDate={selectedInvestment.endDate ?? dayjs(selectedInvestment.startDate || dayjs().format('YYYY-MM-DD')).add(1, 'year').toISOString()}
                    monthlyRental={selectedInvestment.monthlyRental || 0}
                    payments={selectedInvestment.rentalPayments || []}
                    onUpdatePayment={handleUpdatePayment}
                    onUpdateProfitSharing={handleUpdateProfitSharing}
                />
            )}
        </Box>
    );
};

export default InvestmentManagement; 