import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ApiService } from '../../../services/api.service';
import { MemberProfit, PaymentStatus, RentalPayment } from '../../../types/rental';
import { User } from '../../../types/user';

// 定義子頁簽介面
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`risk-management-tabpanel-${index}`}
            aria-labelledby={`risk-management-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// 會員逾期繳款記錄組件
const MemberOverduePaymentsPanel: React.FC = () => {
    const [overduePayments, setOverduePayments] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 使用新增的API方法獲取逾期繳款記錄
                const overdue = await ApiService.getOverdueMemberPayments();
                console.log('【前端】獲取到的會員逾期繳款記錄:', overdue);
                setOverduePayments(overdue);
            } catch (error) {
                console.error('無法獲取會員逾期繳款記錄:', error);
            }
        };

        fetchData();
    }, []);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                會員逾期繳款記錄
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>會員姓名</TableCell>
                            <TableCell>年度</TableCell>
                            <TableCell>月份</TableCell>
                            <TableCell>金額</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>應付日期</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {overduePayments.length > 0 ? (
                            overduePayments
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{payment.memberName || '未知會員'}</TableCell>
                                        <TableCell>{payment.year}</TableCell>
                                        <TableCell>{payment.month}</TableCell>
                                        <TableCell>{Number(payment.amount).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label="逾期"
                                                color="error"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{payment.dueDate || '未設定'}</TableCell>
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    無會員逾期繳款記錄
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={overduePayments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="每頁列數:"
                />
            </TableContainer>
        </Box>
    );
};

// 客戶租金逾期繳款記錄組件
const CustomerOverdueRentalsPanel: React.FC = () => {
    const [overdueRentals, setOverdueRentals] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 使用新增的API方法獲取逾期租金記錄
                const overdue = await ApiService.getOverdueRentalPayments();
                console.log('【前端】獲取到的客戶租金逾期繳款記錄:', overdue);
                setOverdueRentals(overdue);
            } catch (error) {
                console.error('無法獲取客戶租金逾期繳款記錄:', error);
            }
        };

        fetchData();
    }, []);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                客戶租金逾期繳款記錄
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>承租人</TableCell>
                            <TableCell>年度</TableCell>
                            <TableCell>月份</TableCell>
                            <TableCell>金額</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>租賃期間</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {overdueRentals.length > 0 ? (
                            overdueRentals
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((rental) => (
                                    <TableRow key={rental.id}>
                                        <TableCell>{rental.renterName}</TableCell>
                                        <TableCell>{rental.year}</TableCell>
                                        <TableCell>{rental.month}</TableCell>
                                        <TableCell>{Number(rental.amount).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label="逾期"
                                                color="error"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {rental.startDate} - {rental.endDate}
                                        </TableCell>
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    無客戶租金逾期繳款記錄
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={overdueRentals.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="每頁列數:"
                />
            </TableContainer>
        </Box>
    );
};

// 其他異常記錄組件
const OtherAnomaliesPanel: React.FC = () => {
    const [anomalies, setAnomalies] = useState<any[]>([]);
    const [members, setMembers] = useState<User[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openDialog, setOpenDialog] = useState(false);
    const [newAnomaly, setNewAnomaly] = useState({
        type: '',
        personId: '',
        personName: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        status: '待處理',
        handling: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 使用新增的API方法獲取異常記錄
                const data = await ApiService.getAnomalies();
                setAnomalies(data);

                // 獲取會員資料用於選擇相關人員
                const memberData = await ApiService.getMembers();
                setMembers(memberData);
            } catch (error) {
                console.error('無法獲取異常記錄:', error);
            }
        };

        fetchData();
    }, []);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = e.target;
        setNewAnomaly({
            ...newAnomaly,
            [name as string]: value
        });

        // 如果選擇了會員，同時設置會員姓名
        if (name === 'personId') {
            const selectedMember = members.find(m => m.id === value);
            if (selectedMember) {
                setNewAnomaly({
                    ...newAnomaly,
                    personId: value as string,
                    personName: selectedMember.name
                });
            }
        }
    };

    const handleSaveAnomaly = async () => {
        try {
            // 保存新的異常記錄
            const savedAnomaly = await ApiService.recordAnomaly(newAnomaly);

            // 更新異常記錄列表
            setAnomalies([...anomalies, savedAnomaly]);

            // 重置表單並關閉對話框
            setNewAnomaly({
                type: '',
                personId: '',
                personName: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                status: '待處理',
                handling: ''
            });
            handleCloseDialog();
        } catch (error) {
            console.error('保存異常記錄失敗:', error);
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                    其他異常記錄
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                >
                    新增異常記錄
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>類型</TableCell>
                            <TableCell>相關人員</TableCell>
                            <TableCell>發生日期</TableCell>
                            <TableCell>事件描述</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>處理方式</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {anomalies.length > 0 ? (
                            anomalies
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((anomaly, index) => (
                                    <TableRow key={anomaly.id || index}>
                                        <TableCell>{anomaly.type}</TableCell>
                                        <TableCell>{anomaly.personName}</TableCell>
                                        <TableCell>{new Date(anomaly.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{anomaly.description}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={anomaly.status}
                                                color={anomaly.status === '已處理' ? 'success' : anomaly.status === '處理中' ? 'warning' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{anomaly.handling || '尚未處理'}</TableCell>
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    無其他異常記錄
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={anomalies.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="每頁列數:"
                />
            </TableContainer>

            {/* 新增異常記錄對話框 */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>新增異常記錄</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="anomaly-type-label">異常類型</InputLabel>
                                <Select
                                    labelId="anomaly-type-label"
                                    id="anomaly-type"
                                    name="type"
                                    value={newAnomaly.type}
                                    label="異常類型"
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value="繳款問題">繳款問題</MenuItem>
                                    <MenuItem value="合約爭議">合約爭議</MenuItem>
                                    <MenuItem value="遺失資料">遺失資料</MenuItem>
                                    <MenuItem value="系統錯誤">系統錯誤</MenuItem>
                                    <MenuItem value="其他">其他</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="person-label">相關人員</InputLabel>
                                <Select
                                    labelId="person-label"
                                    id="person"
                                    name="personId"
                                    value={newAnomaly.personId}
                                    label="相關人員"
                                    onChange={handleInputChange}
                                >
                                    {members.map(member => (
                                        <MenuItem key={member.id} value={member.id}>
                                            {member.name}
                                        </MenuItem>
                                    ))}
                                    <MenuItem value="other">其他人員</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {newAnomaly.personId === 'other' && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="personName"
                                    label="相關人員姓名"
                                    value={newAnomaly.personName}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                name="date"
                                label="發生日期"
                                type="date"
                                value={newAnomaly.date}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="status-label">狀態</InputLabel>
                                <Select
                                    labelId="status-label"
                                    id="status"
                                    name="status"
                                    value={newAnomaly.status}
                                    label="狀態"
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value="待處理">待處理</MenuItem>
                                    <MenuItem value="處理中">處理中</MenuItem>
                                    <MenuItem value="已處理">已處理</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="description"
                                label="事件描述"
                                multiline
                                rows={3}
                                value={newAnomaly.description}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="handling"
                                label="處理方式"
                                multiline
                                rows={2}
                                value={newAnomaly.handling}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>取消</Button>
                    <Button
                        onClick={handleSaveAnomaly}
                        variant="contained"
                        color="primary"
                        disabled={!newAnomaly.type || (!newAnomaly.personId && !newAnomaly.personName) || !newAnomaly.date || !newAnomaly.description}
                    >
                        保存
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// 風險管理頁簽主組件
const RiskManagementTab: React.FC = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    aria-label="風險管理標籤"
                    variant="fullWidth"
                >
                    <Tab label="會員逾期繳款記錄" id="tab-0" aria-controls="tabpanel-0" />
                    <Tab label="客戶租金逾期繳款記錄" id="tab-1" aria-controls="tabpanel-1" />
                    <Tab label="其他異常記錄" id="tab-2" aria-controls="tabpanel-2" />
                </Tabs>

                <TabPanel value={currentTab} index={0}>
                    <MemberOverduePaymentsPanel />
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    <CustomerOverdueRentalsPanel />
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                    <OtherAnomaliesPanel />
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default RiskManagementTab; 