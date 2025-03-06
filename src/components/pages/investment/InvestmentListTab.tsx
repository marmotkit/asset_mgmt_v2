import React from 'react';
import { Box } from '@mui/material';
import { Investment } from '../../../types/investment';
import InvestmentList from './InvestmentList';

interface InvestmentListTabProps {
    investments: Investment[];
    onEditInvestment: (investment: Investment) => void;
    onDeleteInvestment: (investment: Investment) => void;
}

const InvestmentListTab: React.FC<InvestmentListTabProps> = ({
    investments,
    onEditInvestment,
    onDeleteInvestment
}) => {
    return (
        <Box>
            <InvestmentList
                investments={investments}
                onEditInvestment={onEditInvestment}
                onDeleteInvestment={onDeleteInvestment}
            />
        </Box>
    );
};

export default InvestmentListTab; 