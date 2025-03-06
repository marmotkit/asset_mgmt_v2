import React from 'react';
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
} from '@mui/material';
import { Investment } from '../../../types/investment';
import { formatCurrency } from '../../../utils/format';

interface HistoryTabProps {
    investments: Investment[];
}

const HistoryTab: React.FC<HistoryTabProps> = ({
    investments
}) => {
    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
                投資歷史記錄
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>日期</TableCell>
                            <TableCell>投資項目</TableCell>
                            <TableCell>類型</TableCell>
                            <TableCell>金額</TableCell>
                            <TableCell>操作類型</TableCell>
                            <TableCell>備註</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                尚無歷史記錄
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default HistoryTab; 