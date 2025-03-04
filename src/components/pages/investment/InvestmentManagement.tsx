import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Investment } from '../../../types/investment';
import ApiService from '../../../services/api.service';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';
import InvestmentList from './InvestmentList';
import InvestmentDetailDialog from './InvestmentDetailDialog';

const InvestmentManagement: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);

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
        setTabValue(newValue);
    };

    const handleAddInvestment = () => {
        setSelectedInvestment(null);
        setDialogOpen(true);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">投資管理</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddInvestment}
                >
                    新增投資項目
                </Button>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="動產投資" />
                    <Tab label="不動產投資" />
                </Tabs>
            </Paper>

            <InvestmentList
                investments={investments.filter(inv =>
                    tabValue === 0 ? inv.type === 'movable' : inv.type === 'immovable'
                )}
                onEdit={(investment) => {
                    setSelectedInvestment(investment);
                    setDialogOpen(true);
                }}
                onDelete={async (id) => {
                    if (window.confirm('確定要刪除此投資項目？')) {
                        try {
                            await ApiService.deleteInvestment(id);
                            await loadInvestments();
                        } catch (err) {
                            setError('刪除投資項目失敗');
                        }
                    }
                }}
            />

            <InvestmentDetailDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                investmentData={selectedInvestment}
                investmentType={tabValue === 0 ? 'movable' : 'immovable'}
                isEditing={!!selectedInvestment}
                onUpdate={async (data) => {
                    try {
                        await ApiService.updateInvestment(selectedInvestment!.id, data);
                        await loadInvestments();
                        setDialogOpen(false);
                    } catch (err) {
                        setError('更新投資項目失敗');
                    }
                }}
                onCreate={async (data) => {
                    try {
                        await ApiService.createInvestment(data);
                        await loadInvestments();
                        setDialogOpen(false);
                    } catch (err) {
                        setError('新增投資項目失敗');
                    }
                }}
                onSave={async (data) => {
                    try {
                        if (selectedInvestment) {
                            await ApiService.updateInvestment(selectedInvestment.id, data);
                        } else {
                            await ApiService.createInvestment(data);
                        }
                        await loadInvestments();
                        setDialogOpen(false);
                    } catch (err) {
                        setError('儲存投資項目失敗');
                    }
                }}
            />
        </Box>
    );
};

export default InvestmentManagement; 