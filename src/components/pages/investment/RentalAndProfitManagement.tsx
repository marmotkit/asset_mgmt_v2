import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
} from '@mui/material';
import { Investment } from '../../../types/investment';
import { formatCurrency } from '../../../utils/format';

interface RentalAndProfitManagementProps {
    investment: Investment;
}

const RentalAndProfitManagement: React.FC<RentalAndProfitManagementProps> = ({
    investment
}) => {
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                租賃與分潤管理
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
                此功能尚未開放，敬請期待
            </Typography>
        </Box>
    );
};

export default RentalAndProfitManagement;
