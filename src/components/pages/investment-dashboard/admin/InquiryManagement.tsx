import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Tooltip,
    Pagination,
    Stack,
    Card,
    CardContent,
    Grid,
    Divider,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { InvestmentInquiry, UpdateInvestmentInquiry } from '../../../../types/investment-opportunity';
import { investmentInquiryService } from '../../../../services/investmentOpportunity.service';
import { formatCurrency } from '../../../../utils/format';

const InquiryManagement: React.FC = () => {
    const [inquiries, setInquiries] = useState<InvestmentInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);

    // 對話框狀態
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<InvestmentInquiry | null>(null);
    const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null);

    // 篩選狀態
    const [filter, setFilter] = useState({
        status: '',
        search: '',
        investmentId: ''
    });

    // 編輯表單狀態
    const [editForm, setEditForm] = useState<UpdateInvestmentInquiry>({
        status: 'new',
        admin_notes: ''
    });

    // 載入洽詢記錄
    const loadInquiries = async () => {
        setLoading(true);
        try {
            const result = await investmentInquiryService.getInquiries(
                filter.investmentId || undefined,
                filter.status || undefined,
                page,
                pageSize
            );
            setInquiries(result.inquiries);
            setTotal(result.total);
            setError(null);
        } catch (err) {
            console.error('載入洽詢記錄失敗:', err);
            setError('載入洽詢記錄失敗，請稍後再試');
            setInquiries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInquiries();
    }, [filter, page]);

    // 取得狀態標籤
    const getStatusLabel = (status: string) => {
        const statusMap = {
            new: { label: '新洽詢', color: 'primary' },
            contacted: { label: '已聯繫', color: 'info' },
            interested: { label: '有興趣', color: 'success' },
            not_interested: { label: '無興趣', color: 'warning' },
            closed: { label: '已關閉', color: 'error' }
        };
        return statusMap[status as keyof typeof statusMap] || { label: status, color: 'default' };
    };

    // 處理查看詳情
    const handleViewDetail = (inquiry: InvestmentInquiry) => {
        setSelectedInquiry(inquiry);
        setDetailDialogOpen(true);
    };

    // 處理編輯
    const handleEdit = (inquiry: InvestmentInquiry) => {
        setSelectedInquiry(inquiry);
        setEditForm({
            status: inquiry.status,
            admin_notes: inquiry.admin_notes || ''
        });
        setEditDialogOpen(true);
    };

    // 處理刪除
    const handleDeleteClick = (id: string) => {
        setInquiryToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!inquiryToDelete) return;

        try {
            await investmentInquiryService.deleteInquiry(inquiryToDelete);
            setInquiries(prev => prev.filter(item => item.id !== inquiryToDelete));
            setDeleteDialogOpen(false);
            setInquiryToDelete(null);
        } catch (error) {
            console.error('刪除失敗:', error);
            setError('刪除失敗，請稍後再試');
        }
    };

    // 處理編輯表單提交
    const handleEditSubmit = async () => {
        if (!selectedInquiry) return;

        try {
            const updated = await investmentInquiryService.updateInquiry(
                selectedInquiry.id,
                editForm
            );
            setInquiries(prev => prev.map(item =>
                item.id === selectedInquiry.id ? updated : item
            ));
            setEditDialogOpen(false);
            setSelectedInquiry(null);
        } catch (error) {
            console.error('更新失敗:', error);
            setError('更新失敗，請稍後再試');
        }
    };

    // 格式化日期
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-TW');
    };

    if (loading && inquiries.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* 標題和篩選 */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    洽詢管理
                </Typography>

                {/* 篩選區域 */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="搜尋洽詢記錄..."
                                value={filter.search}
                                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>狀態</InputLabel>
                                <Select
                                    value={filter.status}
                                    label="狀態"
                                    onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <MenuItem value="">全部狀態</MenuItem>
                                    <MenuItem value="new">新洽詢</MenuItem>
                                    <MenuItem value="contacted">已聯繫</MenuItem>
                                    <MenuItem value="interested">有興趣</MenuItem>
                                    <MenuItem value="not_interested">無興趣</MenuItem>
                                    <MenuItem value="closed">已關閉</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                variant="contained"
                                startIcon={<FilterIcon />}
                                onClick={() => setFilter({ status: '', search: '', investmentId: '' })}
                            >
                                清除篩選
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            {/* 錯誤訊息 */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* 洽詢列表 */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>洽詢者</TableCell>
                            <TableCell>投資標的</TableCell>
                            <TableCell>聯絡資訊</TableCell>
                            <TableCell>投資金額</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>洽詢時間</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {inquiries.map((inquiry) => (
                            <TableRow key={inquiry.id}>
                                <TableCell>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {inquiry.name}
                                    </Typography>
                                    {inquiry.company && (
                                        <Typography variant="body2" color="textSecondary">
                                            {inquiry.company}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1">
                                        {inquiry.investment?.title || '未知標的'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Stack spacing={0.5}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                                {inquiry.email}
                                            </Typography>
                                        </Box>
                                        {inquiry.phone && (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <PhoneIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                <Typography variant="body2">
                                                    {inquiry.phone}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    {inquiry.investment_amount ? (
                                        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(inquiry.investment_amount)}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            未指定
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={getStatusLabel(inquiry.status).label}
                                        color={getStatusLabel(inquiry.status).color as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {formatDate(inquiry.created_at)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="查看詳情">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewDetail(inquiry)}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="編輯">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(inquiry)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="刪除">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteClick(inquiry.id)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                        {inquiries.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    尚無洽詢記錄
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* 分頁 */}
            {total > pageSize && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={Math.ceil(total / pageSize)}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

            {/* 詳情對話框 */}
            <Dialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>洽詢詳情</DialogTitle>
                <DialogContent>
                    {selectedInquiry && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            洽詢者資訊
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="textSecondary">
                                                    姓名
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {selectedInquiry.name}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="textSecondary">
                                                    電子郵件
                                                </Typography>
                                                <Typography variant="body1">
                                                    {selectedInquiry.email}
                                                </Typography>
                                            </Grid>
                                            {selectedInquiry.phone && (
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        電話
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {selectedInquiry.phone}
                                                    </Typography>
                                                </Grid>
                                            )}
                                            {selectedInquiry.company && (
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        公司
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {selectedInquiry.company}
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12}>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            投資標的資訊
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {selectedInquiry.investment?.title || '未知標的'}
                                        </Typography>
                                        {selectedInquiry.investment_amount && (
                                            <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                                                投資金額: {formatCurrency(selectedInquiry.investment_amount)}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {selectedInquiry.message && (
                                <Grid item xs={12}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                洽詢內容
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />
                                            <Typography variant="body1">
                                                {selectedInquiry.message}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialogOpen(false)}>關閉</Button>
                </DialogActions>
            </Dialog>

            {/* 編輯對話框 */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>編輯洽詢狀態</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>狀態</InputLabel>
                                <Select
                                    value={editForm.status}
                                    label="狀態"
                                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                                >
                                    <MenuItem value="new">新洽詢</MenuItem>
                                    <MenuItem value="contacted">已聯繫</MenuItem>
                                    <MenuItem value="interested">有興趣</MenuItem>
                                    <MenuItem value="not_interested">無興趣</MenuItem>
                                    <MenuItem value="closed">已關閉</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="管理員備註"
                                multiline
                                rows={4}
                                value={editForm.admin_notes}
                                onChange={(e) => setEditForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                                placeholder="輸入管理員備註..."
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
                    <Button onClick={handleEditSubmit} variant="contained">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 刪除確認對話框 */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    確定要刪除這筆洽詢記錄嗎？此操作無法復原。
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        刪除
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default InquiryManagement; 