import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
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
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Tooltip,
    Switch,
    FormControlLabel,
    Pagination,
    Stack,
    InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Message as MessageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { InvestmentOpportunity, CreateInvestmentOpportunity, UpdateInvestmentOpportunity } from '../../../../types/investment-opportunity';
import { investmentOpportunityService, investmentInquiryService } from '../../../../services/investmentOpportunity.service';
import InvestmentForm from './InvestmentForm';

// 簡化的圖片類型，用於上傳時（還沒有 investment_id）
interface UploadImage {
    image_url: string;
    image_type: 'main' | 'gallery' | 'document';
    sort_order: number;
}

const InvestmentManagement: React.FC = () => {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    // 對話框狀態
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<InvestmentOpportunity | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [opportunityToDelete, setOpportunityToDelete] = useState<string | null>(null);

    // 篩選狀態
    const [filter, setFilter] = useState({
        status: '',
        search: ''
    });

    // 載入投資標的
    const loadOpportunities = async () => {
        setLoading(true);
        try {
            const result = await investmentOpportunityService.getInvestmentOpportunities(
                filter.status ? { status: filter.status as any } : undefined,
                'created_at',
                'desc',
                page,
                pageSize
            );
            setOpportunities(result.opportunities);
            setTotal(result.total);
            setError(null);
        } catch (err) {
            console.error('載入投資標的失敗:', err);
            setError('載入投資標的失敗，請稍後再試');
            setOpportunities([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOpportunities();
    }, [filter, page]);

    // 格式化金額
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // 取得狀態標籤
    const getStatusLabel = (status: string) => {
        const statusMap = {
            preview: { label: '預告', color: 'warning' },
            active: { label: '上市', color: 'success' },
            hidden: { label: '隱藏', color: 'default' },
            closed: { label: '關閉', color: 'error' }
        };
        return statusMap[status as keyof typeof statusMap] || { label: status, color: 'default' };
    };

    // 取得投資類型標籤
    const getInvestmentTypeLabel = (type: string) => {
        const typeMap = {
            lease: '租賃投資',
            equity: '股權投資',
            debt: '債權投資',
            real_estate: '房地產',
            other: '其他'
        };
        return typeMap[type as keyof typeof typeMap] || type;
    };

    // 處理新增
    const handleAdd = () => {
        setEditingOpportunity(null);
        setDialogOpen(true);
    };

    // 處理編輯
    const handleEdit = (opportunity: InvestmentOpportunity) => {
        setEditingOpportunity(opportunity);
        setDialogOpen(true);
    };

    // 處理刪除
    const handleDeleteClick = (id: string) => {
        setOpportunityToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!opportunityToDelete) return;

        try {
            await investmentOpportunityService.deleteInvestmentOpportunity(opportunityToDelete);
            setOpportunities(prev => prev.filter(item => item.id !== opportunityToDelete));
            setDeleteDialogOpen(false);
            setOpportunityToDelete(null);
        } catch (error) {
            console.error('刪除失敗:', error);
            setError('刪除失敗，請稍後再試');
        }
    };

    // 處理狀態變更
    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await investmentOpportunityService.updateInvestmentStatus(id, newStatus as any);
            setOpportunities(prev => prev.map(item =>
                item.id === id ? { ...item, status: newStatus as any } : item
            ));
        } catch (error) {
            console.error('更新狀態失敗:', error);
            setError('更新狀態失敗，請稍後再試');
        }
    };

    // 處理表單提交
    const handleFormSubmit = async (data: CreateInvestmentOpportunity | UpdateInvestmentOpportunity, images?: UploadImage[]) => {
        try {
            if (editingOpportunity) {
                // 更新
                const updated = await investmentOpportunityService.updateInvestmentOpportunity(
                    editingOpportunity.id,
                    data as UpdateInvestmentOpportunity
                );
                setOpportunities(prev => prev.map(item =>
                    item.id === editingOpportunity.id ? updated : item
                ));
            } else {
                // 新增
                const created = await investmentOpportunityService.createInvestmentOpportunity(
                    data as CreateInvestmentOpportunity
                );
                setOpportunities(prev => [created, ...prev]);
            }
            setDialogOpen(false);
            setEditingOpportunity(null);
        } catch (error) {
            console.error('儲存失敗:', error);
            setError('儲存失敗，請稍後再試');
        }
    };

    // 處理洽詢管理
    const handleInquiryManagement = () => {
        navigate('/investment-dashboard-management/inquiries');
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* 標題和操作按鈕 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    投資標的管理
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<MessageIcon />}
                        onClick={handleInquiryManagement}
                    >
                        洽詢管理
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                    >
                        新增投資標的
                    </Button>
                </Stack>
            </Box>

            {/* 篩選器 */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="搜尋標的名稱..."
                            value={filter.search}
                            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>狀態</InputLabel>
                            <Select
                                value={filter.status}
                                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                                label="狀態"
                            >
                                <MenuItem value="">全部</MenuItem>
                                <MenuItem value="preview">預告</MenuItem>
                                <MenuItem value="active">上市</MenuItem>
                                <MenuItem value="hidden">隱藏</MenuItem>
                                <MenuItem value="closed">關閉</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* 錯誤訊息 */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* 載入中 */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* 投資標的表格 */}
            {!loading && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>標的名稱</TableCell>
                                <TableCell>投資類型</TableCell>
                                <TableCell align="right">投資金額</TableCell>
                                <TableCell align="right">預期報酬率</TableCell>
                                <TableCell>狀態</TableCell>
                                <TableCell align="center">特色</TableCell>
                                <TableCell align="center">瀏覽/洽詢</TableCell>
                                <TableCell align="center">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {opportunities.map((opportunity) => {
                                const statusInfo = getStatusLabel(opportunity.status);
                                return (
                                    <TableRow key={opportunity.id}>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {opportunity.title}
                                                </Typography>
                                                {opportunity.subtitle && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {opportunity.subtitle}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {getInvestmentTypeLabel(opportunity.investment_type)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {formatAmount(opportunity.investment_amount)}
                                        </TableCell>
                                        <TableCell align="right">
                                            {opportunity.expected_return ? `${opportunity.expected_return}%` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={statusInfo.label}
                                                color={statusInfo.color as any}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={opportunity.featured}
                                                onChange={(e) => {
                                                    // 這裡可以添加更新特色狀態的邏輯
                                                }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">
                                                {opportunity.view_count} / {opportunity.inquiry_count}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="編輯">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(opportunity)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="刪除">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteClick(opportunity.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

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

            {/* 新增/編輯對話框 */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editingOpportunity ? '編輯投資標的' : '新增投資標的'}
                </DialogTitle>
                <DialogContent>
                    <InvestmentForm
                        opportunity={editingOpportunity}
                        onSubmit={handleFormSubmit}
                    />
                </DialogContent>
            </Dialog>

            {/* 刪除確認對話框 */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>確認刪除</DialogTitle>
                <DialogContent>
                    <Typography>
                        確定要刪除這個投資標的嗎？此操作無法復原。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        取消
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        刪除
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default InvestmentManagement; 