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
    Paper,
} from '@mui/material';
import {
    Investment,
    InvestmentFormData,
    MovableInvestment,
    ImmovableInvestment
} from '../../../types/investment';
import { ApiService } from '../../../services/api.service';
import InvestmentListTab from './InvestmentListTab';
import RentalAndProfitManagement from './RentalAndProfitManagement';
import HistoryTab from './HistoryTab';
import InvoiceTab from './InvoiceTab';
import ReportTab from './ReportTab';
import InvestmentDetailDialog from './InvestmentDetailDialog';
import { Add as AddIcon } from '@mui/icons-material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`investment-tabpanel-${index}`}
            aria-labelledby={`investment-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const InvestmentManagement: React.FC = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | undefined>(undefined);

    useEffect(() => {
        loadInvestments();
    }, []);

    const loadInvestments = async () => {
        try {
            setLoading(true);
            const data = await ApiService.getInvestments();
            setInvestments(data);
        } catch (err) {
            setError('載入投資資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleAddClick = () => {
        setSelectedInvestment(undefined);
        setIsDialogOpen(true);
    };

    const handleSave = async (formData: InvestmentFormData) => {
        try {
            if (selectedInvestment) {
                if (formData.type === 'movable') {
                    await ApiService.updateInvestment({
                        ...selectedInvestment,
                        ...formData,
                    } as MovableInvestment);
                } else {
                    await ApiService.updateInvestment({
                        ...selectedInvestment,
                        ...formData,
                    } as ImmovableInvestment);
                }
            } else {
                await ApiService.createInvestment(formData);
            }
            await loadInvestments();
            setIsDialogOpen(false);
        } catch (err) {
            console.error('儲存投資項目失敗:', err);
            setError('儲存投資項目失敗');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box m={2}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">投資管理</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                >
                    新增投資
                </Button>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        aria-label="投資管理標籤"
                    >
                        <Tab label="投資項目" />
                        <Tab label="租賃/分潤" />
                        <Tab label="歷史記錄" />
                        <Tab label="發票管理" />
                        <Tab label="投資報表" />
                    </Tabs>
                </Box>

                <TabPanel value={currentTab} index={0}>
                    <InvestmentListTab
                        investments={investments}
                        onEdit={(investment: Investment) => {
                            setSelectedInvestment(investment);
                            setIsDialogOpen(true);
                        }}
                        onRefresh={loadInvestments}
                    />
                </TabPanel>
                <TabPanel value={currentTab} index={1}>
                    <RentalAndProfitManagement />
                </TabPanel>
                <TabPanel value={currentTab} index={2}>
                    <HistoryTab investments={investments} />
                </TabPanel>
                <TabPanel value={currentTab} index={3}>
                    <InvoiceTab investments={investments} />
                </TabPanel>
                <TabPanel value={currentTab} index={4}>
                    <ReportTab investments={investments} />
                </TabPanel>
            </Paper>

            <InvestmentDetailDialog
                open={isDialogOpen}
                investment={selectedInvestment}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSave}
            />
        </Box>
    );
};

export default InvestmentManagement;