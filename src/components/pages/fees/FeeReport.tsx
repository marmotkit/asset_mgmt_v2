import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Button,
    IconButton,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { feeHistoryService } from '../../../services/feeHistoryService';
import { invoiceService } from '../../../services/invoiceService';
import { memberService } from '../../../services/memberService';
import { FeeHistory, MemberType } from '../../../types/fee';
import { Member } from '../../../types/member';
import * as XLSX from 'xlsx';

interface DashboardStats {
    yearlyTotal: number;
    yearlyPending: number;
    memberTypeStats: {
        [key in MemberType]: number;
    };
}

interface ColumnDefinition {
    id: keyof FeeHistory | 'hasInvoice';
    label: string;
    selected: boolean;
}

export const FeeReport: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [yearOptions, setYearOptions] = useState<string[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        yearlyTotal: 0,
        yearlyPending: 0,
        memberTypeStats: {
            '一般會員': 0,
            '商務會員': 0,
            '終身會員': 0
        }
    });
    const [feeRecords, setFeeRecords] = useState<FeeHistory[]>([]);
    const [columns, setColumns] = useState<ColumnDefinition[]>([
        { id: 'memberId', label: '會員編號', selected: true },
        { id: 'memberName', label: '會員姓名', selected: true },
        { id: 'memberType', label: '會員類別', selected: true },
        { id: 'paymentDate', label: '繳費日期', selected: true },
        { id: 'paymentMethod', label: '繳費方式', selected: true },
        { id: 'status', label: '繳費狀態', selected: true },
        { id: 'hasInvoice', label: '發票/收據', selected: true }
    ]);
    const [invoiceStatus, setInvoiceStatus] = useState<{ [key: string]: boolean }>({});
    const [members, setMembers] = useState<{ [key: string]: Member }>({});

    useEffect(() => {
        // 生成年度選項（從2020年到當前年度）
        const currentYear = new Date().getFullYear();
        const years = Array.from(
            { length: currentYear - 2019 },
            (_, i) => (currentYear - i).toString()
        );
        setYearOptions(years);
        loadData();
    }, []);

    useEffect(() => {
        loadData();
    }, [selectedYear]);

    const loadData = async () => {
        try {
            const records = await feeHistoryService.getHistories();
            let filteredRecords = records;

            if (selectedYear !== 'all') {
                const targetYear = parseInt(selectedYear);
                filteredRecords = records.filter(r => {
                    if (r.paymentDate) {
                        return new Date(r.paymentDate).getFullYear() === targetYear;
                    }
                    return false;
                });
            }

            // 載入會員資料
            const allMembers = await memberService.getMembers();
            const memberMap = allMembers.reduce((acc, member) => {
                acc[member.id] = member;
                return acc;
            }, {} as { [key: string]: Member });
            setMembers(memberMap);

            setFeeRecords(filteredRecords);

            // 載入發票狀態
            const invoiceStatusMap: { [key: string]: boolean } = {};
            for (const record of filteredRecords) {
                const docs = await invoiceService.getDocuments({ memberId: record.memberId });
                invoiceStatusMap[record.id] = docs.length > 0;
            }
            setInvoiceStatus(invoiceStatusMap);

            // 計算統計數據
            const yearlyTotal = filteredRecords
                .filter(r => {
                    if (!r.paymentDate) return false;
                    return r.status === '已收款';
                })
                .reduce((sum, r) => sum + r.amount, 0);

            const yearlyPending = filteredRecords
                .filter(r => {
                    if (!r.dueDate) return false;
                    return r.status === '待收款';
                })
                .reduce((sum, r) => sum + r.amount, 0);

            const memberTypeStats = filteredRecords
                .filter(r => {
                    if (!r.paymentDate) return false;
                    return r.status === '已收款';
                })
                .reduce((acc, r) => {
                    if (r.memberType) {
                        acc[r.memberType as MemberType] = (acc[r.memberType as MemberType] || 0) + r.amount;
                    }
                    return acc;
                }, {} as { [key in MemberType]: number });

            setStats({
                yearlyTotal,
                yearlyPending,
                memberTypeStats: {
                    '一般會員': memberTypeStats['一般會員'] || 0,
                    '商務會員': memberTypeStats['商務會員'] || 0,
                    '終身會員': memberTypeStats['終身會員'] || 0
                }
            });
        } catch (error) {
            console.error('載入資料失敗:', error);
        }
    };

    const handleColumnToggle = (columnId: string) => {
        setColumns(columns.map(col =>
            col.id === columnId ? { ...col, selected: !col.selected } : col
        ));
    };

    const handleExportExcel = () => {
        const selectedColumns = columns.filter(col => col.selected);

        // 準備 Excel 資料
        const excelData = feeRecords.map((record, index) => {
            const rowData: { [key: string]: any } = {
                '序號': index + 1
            };

            selectedColumns.forEach(column => {
                rowData[column.label] = getCellValue(record, column.id);
            });

            return rowData;
        });

        // 創建工作表
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '會費收款報表');

        // 下載檔案
        const fileName = selectedYear === 'all' ?
            '會費收款總表.xlsx' :
            `${selectedYear}年度會費收款總表.xlsx`;

        XLSX.writeFile(wb, fileName);
    };

    const getCellValue = (record: FeeHistory, columnId: string) => {
        if (columnId === 'hasInvoice') {
            return invoiceStatus[record.id] ? '是' : '否';
        }
        return record[columnId as keyof FeeHistory] || '-';
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>會費報表</Typography>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>選擇年度</InputLabel>
                    <Select
                        value={selectedYear}
                        label="選擇年度"
                        onChange={(e) => setSelectedYear(e.target.value)}
                        size="small"
                    >
                        <MenuItem value="all">全部</MenuItem>
                        {yearOptions.map(year => (
                            <MenuItem key={year} value={year}>{year}年</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* 儀表板 */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', minHeight: 200 }}>
                        <CardContent sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <Typography color="textSecondary" gutterBottom>
                                {selectedYear === 'all' ? '全部總收' : `${selectedYear}年度總收`}
                            </Typography>
                            <Typography variant="h4">
                                ${stats.yearlyTotal.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', minHeight: 200 }}>
                        <CardContent sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <Typography color="textSecondary" gutterBottom>
                                {selectedYear === 'all' ? '全部待收' : `${selectedYear}年度待收`}
                            </Typography>
                            <Typography variant="h4">
                                ${stats.yearlyPending.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', minHeight: 200 }}>
                        <CardContent sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <Typography color="textSecondary" gutterBottom>
                                {selectedYear === 'all' ? '全部類別會員總收' : `${selectedYear}年度各類別會員總收`}
                            </Typography>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                {Object.entries(stats.memberTypeStats).map(([type, amount]) => (
                                    <Box key={type} sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 1,
                                        alignItems: 'center'
                                    }}>
                                        <Typography variant="body1">{type}:</Typography>
                                        <Typography variant="h6">${amount.toLocaleString()}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 報表設定 */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        {selectedYear === 'all' ? '會費收款總表' : `${selectedYear}年度會費收款總表`}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleExportExcel}
                    >
                        匯出 Excel
                    </Button>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>選擇顯示欄位：</Typography>
                    <FormGroup row>
                        {columns.map(column => (
                            <FormControlLabel
                                key={column.id}
                                control={
                                    <Checkbox
                                        checked={column.selected}
                                        onChange={() => handleColumnToggle(column.id)}
                                    />
                                }
                                label={column.label}
                            />
                        ))}
                    </FormGroup>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>序號</TableCell>
                                {columns.map(column => column.selected && (
                                    <TableCell key={column.id}>{column.label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {feeRecords.map((record, index) => (
                                <TableRow key={record.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    {columns.map(column => column.selected && (
                                        <TableCell key={column.id}>
                                            {getCellValue(record, column.id)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}; 