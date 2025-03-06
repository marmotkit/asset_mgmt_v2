import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { Investment } from '../../../types/investment';
import { formatCurrency } from '../../../utils/format';

interface ReportTabProps {
    investments: Investment[];
}

const ReportTab: React.FC<ReportTabProps> = ({
    investments
}) => {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                    投資報表
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                >
                    下載報表
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            投資總覽
                        </Typography>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>總投資金額</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(0)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>總收益金額</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(0)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>投資報酬率</TableCell>
                                    <TableCell align="right">0%</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            收益分析
                        </Typography>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>本月收益</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(0)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>本年收益</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(0)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>平均月收益</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(0)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>投資項目</TableCell>
                                    <TableCell>投資金額</TableCell>
                                    <TableCell>累計收益</TableCell>
                                    <TableCell>報酬率</TableCell>
                                    <TableCell>最近收益</TableCell>
                                    <TableCell>狀態</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        尚無投資報表資料
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReportTab; 