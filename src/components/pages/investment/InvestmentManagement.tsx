import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Button,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Investment,
    InvestmentFormData,
    MovableInvestment,
    ImmovableInvestment
} from '../../../types/investment';
import { ApiService } from '../../../services/api.service';
import InvestmentListTab from './InvestmentListTab';
import RentalAndProfitTab from './RentalAndProfitTab';
import HistoryTab from './HistoryTab';
import InvoiceTab from './InvoiceTab';
import ReportTab from './ReportTab';
import InvestmentDetailDialog from './InvestmentDetailDialog';
import { Add as AddIcon } from '@mui/icons-material';

const STORAGE_KEY = 'investments';
const DEFAULT_COMPANY_ID = '5a48e67a-cbd4-4e8b-a8dc-8c0f59f88c12';
const DEFAULT_USER_ID = 'ad9bfa89-6ea5-43fa-92e8-9ecbfb5d69c5';

const InvestmentManagement: React.FC = () => {
    const [currentTab, setCurrentTab] = useState('investment');
    const [investments, setInvestments] = useState<Investment[]>(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                return JSON.parse(savedData);
            }
            return [];
        } catch (error) {
            console.error('解析 localStorage 數據失敗:', error);
            return [];
        }
    });
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [investmentToDelete, setInvestmentToDelete] = useState<Investment | null>(null);

    // 只在 investments 真正改變時才更新 localStorage
    const updateLocalStorage = useCallback((data: Investment[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, []);

    const loadInvestments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 先從 localStorage 讀取資料
            const localData = localStorage.getItem(STORAGE_KEY);
            let currentInvestments = localData ? JSON.parse(localData) as Investment[] : [];

            // 嘗試從 API 載入資料
            try {
                const apiData = await ApiService.getInvestments();
                if (apiData && apiData.length > 0) {
                    // 合併 API 資料和本地資料
                    const mergedData = apiData.map(apiItem => {
                        const localItem = currentInvestments.find((local: Investment) => local.id === apiItem.id);
                        // 如果本地有更新的資料，使用本地資料
                        if (localItem && new Date(localItem.updatedAt) > new Date(apiItem.updatedAt)) {
                            return localItem;
                        }
                        return apiItem;
                    });

                    setInvestments(mergedData);
                    updateLocalStorage(mergedData);
                } else {
                    // 如果 API 沒有返回資料，使用本地資料
                    setInvestments(currentInvestments);
                }
            } catch (apiError) {
                setInvestments(currentInvestments);
            }
        } catch (err) {
            setError('載入投資資料失敗');
        } finally {
            setLoading(false);
        }
    }, [updateLocalStorage]);

    // 移除重複的 useEffect
    useEffect(() => {
        loadInvestments();
    }, [loadInvestments]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setCurrentTab(newValue);
    };

    const handleAddClick = () => {
        setSelectedInvestment(undefined);
        setIsDialogOpen(true);
    };

    const handleEditInvestment = (investment: Investment) => {
        setSelectedInvestment(investment);
        setIsDialogOpen(true);
    };

    const handleDeleteInvestment = (investment: Investment) => {
        setInvestmentToDelete(investment);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!investmentToDelete) return;

        try {
            await ApiService.deleteInvestment(investmentToDelete.id);
            const updatedInvestments = investments.filter(item => item.id !== investmentToDelete.id);
            setInvestments(updatedInvestments);
            updateLocalStorage(updatedInvestments);
            setDeleteConfirmOpen(false);
            setInvestmentToDelete(null);
        } catch (error) {
            setError('刪除投資項目失敗');
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmOpen(false);
        setInvestmentToDelete(null);
    };

    const handleSave = async (formData: InvestmentFormData) => {
        try {
            let savedInvestment: Investment;

            // 確保基本數據的完整性
            const baseInvestment = {
                companyId: formData.companyId || '',
                userId: formData.userId || '',
                name: formData.name,
                description: formData.description || '',
                amount: formData.amount,
                startDate: formData.startDate,
                endDate: formData.endDate || '',
                status: formData.status,
                type: formData.type,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (selectedInvestment) {
                const updateData = {
                    ...baseInvestment,
                    id: selectedInvestment.id,
                    createdAt: selectedInvestment.createdAt,
                };

                if (formData.type === 'movable') {
                    savedInvestment = await ApiService.updateInvestment({
                        ...updateData,
                        assetType: formData.assetType || '',
                        serialNumber: formData.serialNumber || '',
                        manufacturer: formData.manufacturer || ''
                    } as MovableInvestment);
                } else {
                    savedInvestment = await ApiService.updateInvestment({
                        ...updateData,
                        location: formData.location || '',
                        area: formData.area || 0,
                        propertyType: formData.propertyType || '',
                        registrationNumber: formData.registrationNumber || ''
                    } as ImmovableInvestment);
                }
            } else {
                const newId = crypto.randomUUID();
                const createData = {
                    ...baseInvestment,
                    id: newId,
                };

                if (formData.type === 'movable') {
                    savedInvestment = await ApiService.createMovableInvestment({
                        ...createData,
                        assetType: formData.assetType || '',
                        serialNumber: formData.serialNumber || '',
                        manufacturer: formData.manufacturer || ''
                    } as MovableInvestment);
                } else {
                    savedInvestment = await ApiService.createImmovableInvestment({
                        ...createData,
                        location: formData.location || '',
                        area: formData.area || 0,
                        propertyType: formData.propertyType || '',
                        registrationNumber: formData.registrationNumber || ''
                    } as ImmovableInvestment);
                }
            }

            // 更新本地狀態和 localStorage
            const updatedInvestments = selectedInvestment
                ? investments.map(item => item.id === savedInvestment.id ? savedInvestment : item)
                : [...investments, savedInvestment];

            setInvestments(updatedInvestments);
            updateLocalStorage(updatedInvestments);
            setIsDialogOpen(false);
            setSelectedInvestment(undefined);
            setError(null);

            // 重新載入數據以確保同步
            await loadInvestments();
        } catch (error) {
            setError('儲存投資項目失敗');
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
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" component="h1">
                        投資管理
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleAddClick}
                    >
                        新增投資
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    aria-label="investment management tabs"
                >
                    <Tab label="投資項目" value="investment" />
                    <Tab label="租賃/分潤" value="rental" />
                    <Tab label="歷史記錄" value="history" />
                    <Tab label="發票管理" value="invoice" />
                    <Tab label="投資報表" value="report" />
                </Tabs>
            </Box>

            {currentTab === 'investment' && (
                <InvestmentListTab
                    investments={investments}
                    onEditInvestment={handleEditInvestment}
                    onDeleteInvestment={handleDeleteInvestment}
                />
            )}

            {currentTab === 'rental' && (
                <RentalAndProfitTab
                    investments={investments}
                    onUpdateInvestment={handleSave}
                />
            )}

            {currentTab === 'history' && (
                <HistoryTab
                    investments={investments}
                />
            )}

            {currentTab === 'invoice' && (
                <InvoiceTab
                    investments={investments}
                />
            )}

            {currentTab === 'report' && (
                <ReportTab
                    investments={investments}
                />
            )}

            <InvestmentDetailDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSave}
                investment={selectedInvestment}
            />

            <Dialog
                open={deleteConfirmOpen}
                onClose={handleCancelDelete}
            >
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    確定要刪除投資項目「{investmentToDelete?.name}」嗎？此操作無法復原。
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>取消</Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        刪除
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default InvestmentManagement;