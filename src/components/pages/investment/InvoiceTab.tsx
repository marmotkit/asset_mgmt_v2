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
    Button,
    IconButton,
    Tooltip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Download as DownloadIcon } from '@mui/icons-material';
import { Investment } from '../../../types/investment';
import { formatCurrency } from '../../../utils/format';

interface InvoiceTabProps {
    investments: Investment[];
}

const InvoiceTab: React.FC<InvoiceTabProps> = ({
    investments
}) => {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                    發票管理
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                >
                    新增發票
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>發票號碼</TableCell>
                            <TableCell>投資項目</TableCell>
                            <TableCell>開立日期</TableCell>
                            <TableCell>金額</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                尚無發票記錄
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default InvoiceTab; 