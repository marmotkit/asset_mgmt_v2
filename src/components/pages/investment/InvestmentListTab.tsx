import React from 'react';
import { Box } from '@mui/material';
import { Investment } from '../../../types/investment';
import InvestmentList from './InvestmentList';

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
    return (
        <Box>
            <InvestmentList
                investments={investments}
                onEditInvestment={onEdit}
                onDeleteInvestment={onRefresh}
            />
        </Box>
    );
};

export default InvestmentListTab; 