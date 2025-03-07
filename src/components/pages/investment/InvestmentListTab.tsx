import React, { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Investment } from '../../../types/investment';
import InvestmentList from './InvestmentList';
import { ApiService } from '../../../services';
import { useSnackbar } from 'notistack';

interface InvestmentListTabProps {
    investments: Investment[];
    onEdit: (investment: Investment) => void;
    onRefresh: () => Promise<void>;
}

const InvestmentListTab: React.FC<InvestmentListTabProps> = ({
    investments,
    onEdit,
    onRefresh
}) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [investmentToDelete, setInvestmentToDelete] = useState<Investment | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const handleDeleteClick = (investment: Investment) => {
        setInvestmentToDelete(investment);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!investmentToDelete) return;

        try {
            await ApiService.deleteInvestment(investmentToDelete.id);
            enqueueSnackbar('投資項目已刪除', { variant: 'success' });
            await onRefresh();
        } catch (error) {
            enqueueSnackbar('刪除投資項目失敗', { variant: 'error' });
        } finally {
            setDeleteDialogOpen(false);
            setInvestmentToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setInvestmentToDelete(null);
    };

    return (
        <Box>
            <InvestmentList
                investments={investments}
                onEditInvestment={onEdit}
                onDeleteInvestment={handleDeleteClick}
            />

            <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    確定要刪除「{investmentToDelete?.name}」這個投資項目嗎？此操作無法復原。
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>取消</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        刪除
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InvestmentListTab; 