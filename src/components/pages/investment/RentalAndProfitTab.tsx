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
    IconButton,
    Chip,
    Tooltip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { Investment } from '../../../types/investment';
import { formatCurrency } from '../../../utils/format';

interface RentalAndProfitTabProps {
    investments: Investment[];
    onUpdateInvestment: (investment: Investment) => Promise<void>;
}

const RentalAndProfitTab: React.FC<RentalAndProfitTabProps> = ({
    investments,
    onUpdateInvestment
}) => {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                    租賃與分潤管理
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    新增租賃/分潤
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>投資項目</TableCell>
                            <TableCell>類型</TableCell>
                            <TableCell>金額</TableCell>
                            <TableCell>收款日期</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                尚無租賃/分潤記錄
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RentalAndProfitTab; 