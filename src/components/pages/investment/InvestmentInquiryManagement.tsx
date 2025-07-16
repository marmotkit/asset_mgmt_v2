import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Pagination,
    Stack
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import { investmentInquiryService } from '../../../services/investmentOpportunity.service';

interface InvestmentInquiry {
    id: string;
    investment_id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    investment_amount?: number;
    message?: string;
    status: string;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
    investment_title?: string;
}

const InvestmentInquiryManagement: React.FC = () => {
    const [inquiries, setInquiries] = useState<InvestmentInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState<InvestmentInquiry | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        loadInquiries();
    }, [page, statusFilter]);

    const loadInquiries = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString()
            });

            if (statusFilter) {
                params.append('status', statusFilter);
            }

            const result = await investmentInquiryService.getInquiries(undefined, statusFilter || undefined, page, pageSize);
            setInquiries(result.inquiries || []);
            setTotal(result.total || 0);
        } catch (err) {
            setError('載入洽詢記錄失敗');
            console.error('載入洽詢記錄失敗:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (inquiry: InvestmentInquiry) => {
        setSelectedInquiry(inquiry);
        setDialogOpen(true);
    };

    const handleUpdateStatus = async (id: string, status: string, adminNotes?: string) => {
        try {
            await investmentInquiryService.updateInquiry(id, {
                status: status as 'new' | 'contacted' | 'interested' | 'not_interested' | 'closed',
                admin_notes: adminNotes
            });
            await loadInquiries();
            setDialogOpen(false);
        } catch (err) {
            setError('更新洽詢狀態失敗');
            console.error('更新洽詢狀態失敗:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('確定要刪除此洽詢記錄嗎？')) {
            try {
                await investmentInquiryService.deleteInquiry(id);
                await loadInquiries();
            } catch (err) {
                setError('刪除洽詢記錄失敗');
                console.error('刪除洽詢記錄失敗:', err);
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'warning';
            case 'contacted': return 'info';
            case 'interested': return 'success';
            case 'not_interested': return 'error';
            case 'closed': return 'default';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'new': return '新洽詢';
            case 'contacted': return '已聯絡';
            case 'interested': return '有興趣';
            case 'not_interested': return '無興趣';
            case 'closed': return '已結束';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-TW');
    };

    const formatAmount = (amount?: number) => {
        if (!amount) return '未指定';
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    投資洽詢管理
                </Typography>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>狀態篩選</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="狀態篩選"
                    >
                        <MenuItem value="">全部</MenuItem>
                        <MenuItem value="new">新洽詢</MenuItem>
                        <MenuItem value="contacted">已聯絡</MenuItem>
                        <MenuItem value="interested">有興趣</MenuItem>
                        <MenuItem value="not_interested">無興趣</MenuItem>
                        <MenuItem value="closed">已結束</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {inquiries.map((inquiry) => (
                    <Grid item xs={12} md={6} lg={4} key={inquiry.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                                        {inquiry.name}
                                    </Typography>
                                    <Chip
                                        label={getStatusText(inquiry.status)}
                                        color={getStatusColor(inquiry.status) as any}
                                        size="small"
                                    />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                                        {inquiry.email}
                                    </Typography>
                                    {inquiry.phone && (
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                                            {inquiry.phone}
                                        </Typography>
                                    )}
                                    {inquiry.company && (
                                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <BusinessIcon sx={{ mr: 1, fontSize: 16 }} />
                                            {inquiry.company}
                                        </Typography>
                                    )}
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    投資標的: {inquiry.investment_title || '未知'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    投資金額: {formatAmount(inquiry.investment_amount)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    洽詢時間: {formatDate(inquiry.created_at)}
                                </Typography>

                                {inquiry.message && (
                                    <Typography variant="body2" color="text.secondary" sx={{
                                        mb: 1,
                                        fontStyle: 'italic',
                                        backgroundColor: 'rgba(0,0,0,0.04)',
                                        p: 1,
                                        borderRadius: 1
                                    }}>
                                        {inquiry.message.length > 100
                                            ? `${inquiry.message.substring(0, 100)}...`
                                            : inquiry.message}
                                    </Typography>
                                )}
                            </CardContent>

                            <CardActions>
                                <Button
                                    size="small"
                                    startIcon={<ViewIcon />}
                                    onClick={() => handleView(inquiry)}
                                >
                                    查看詳情
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDelete(inquiry.id)}
                                >
                                    刪除
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {inquiries.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        目前沒有洽詢記錄
                    </Typography>
                </Box>
            )}

            {/* 分頁 */}
            {total > pageSize && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={Math.ceil(total / pageSize)}
                        page={page}
                        onChange={(e, newPage) => setPage(newPage)}
                        color="primary"
                    />
                </Box>
            )}

            {/* 洽詢詳情對話框 */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    洽詢詳情 - {selectedInquiry?.name}
                </DialogTitle>
                <DialogContent>
                    {selectedInquiry && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="姓名"
                                    value={selectedInquiry.name}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="電子郵件"
                                    value={selectedInquiry.email}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="電話"
                                    value={selectedInquiry.phone || ''}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="公司"
                                    value={selectedInquiry.company || ''}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="投資標的"
                                    value={selectedInquiry.investment_title || ''}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="投資金額"
                                    value={formatAmount(selectedInquiry.investment_amount)}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="洽詢訊息"
                                    value={selectedInquiry.message || ''}
                                    multiline
                                    rows={4}
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>狀態</InputLabel>
                                    <Select
                                        value={selectedInquiry.status}
                                        onChange={(e) => {
                                            setSelectedInquiry({
                                                ...selectedInquiry,
                                                status: e.target.value
                                            });
                                        }}
                                        label="狀態"
                                    >
                                        <MenuItem value="new">新洽詢</MenuItem>
                                        <MenuItem value="contacted">已聯絡</MenuItem>
                                        <MenuItem value="interested">有興趣</MenuItem>
                                        <MenuItem value="not_interested">無興趣</MenuItem>
                                        <MenuItem value="closed">已結束</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="管理員備註"
                                    value={selectedInquiry.admin_notes || ''}
                                    multiline
                                    rows={3}
                                    onChange={(e) => {
                                        setSelectedInquiry({
                                            ...selectedInquiry,
                                            admin_notes: e.target.value
                                        });
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>取消</Button>
                    <Button
                        onClick={() => {
                            if (selectedInquiry) {
                                handleUpdateStatus(
                                    selectedInquiry.id,
                                    selectedInquiry.status,
                                    selectedInquiry.admin_notes
                                );
                            }
                        }}
                        variant="contained"
                    >
                        更新狀態
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InvestmentInquiryManagement; 