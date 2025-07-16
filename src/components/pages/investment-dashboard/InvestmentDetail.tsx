import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Chip,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
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
    IconButton,
    Tooltip,
    Breadcrumbs,
    Link
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
    TrendingUp as TrendingUpIcon,
    Schedule as ScheduleIcon,
    Visibility as VisibilityIcon,
    Share as ShareIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { InvestmentOpportunity } from '../../../types/investment-opportunity';
import { investmentOpportunityService, investmentInquiryService } from '../../../services/investmentOpportunity.service';
import InquiryForm from './InquiryForm';

const InvestmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [opportunity, setOpportunity] = useState<InvestmentOpportunity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);

    // 載入投資標的詳細資訊
    const loadOpportunity = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const data = await investmentOpportunityService.getInvestmentOpportunity(id);
            setOpportunity(data);
            setError(null);

            // 增加瀏覽次數
            await investmentOpportunityService.incrementViewCount(id);
        } catch (err) {
            console.error('載入投資標的失敗:', err);
            setError('載入投資標的失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOpportunity();
    }, [id]);

    // 格式化金額
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // 取得投資類型標籤
    const getInvestmentTypeLabel = (type: string) => {
        const options = [
            { value: 'lease', label: '租賃投資' },
            { value: 'equity', label: '股權投資' },
            { value: 'debt', label: '債權投資' },
            { value: 'real_estate', label: '房地產' },
            { value: 'other', label: '其他' }
        ];
        return options.find(option => option.value === type)?.label || type;
    };

    // 取得風險等級標籤和顏色
    const getRiskLevelInfo = (level: string) => {
        const options = [
            { value: 'low', label: '低風險', color: 'success' },
            { value: 'medium', label: '中風險', color: 'warning' },
            { value: 'high', label: '高風險', color: 'error' }
        ];
        return options.find(option => option.value === level) || { label: level, color: 'default' };
    };

    // 處理分享
    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: opportunity?.title || '投資標的',
                text: opportunity?.short_description || opportunity?.description || '',
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            // 這裡可以顯示一個提示訊息
        }
    };

    // 處理洽詢
    const handleInquiry = () => {
        setInquiryDialogOpen(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error || !opportunity) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error || '找不到投資標的'}
                </Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/investment-dashboard')}
                >
                    返回投資看板
                </Button>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* 麵包屑導航 */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 3 }}
                >
                    <Link
                        color="inherit"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/investment-dashboard');
                        }}
                        sx={{ cursor: 'pointer' }}
                    >
                        投資看板
                    </Link>
                    <Typography color="text.primary">{opportunity.title}</Typography>
                </Breadcrumbs>

                <Grid container spacing={4}>
                    {/* 主要內容區域 */}
                    <Grid item xs={12} lg={8}>
                        {/* 標的標題和狀態 */}
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                        {opportunity.title}
                                    </Typography>
                                    {opportunity.subtitle && (
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            {opportunity.subtitle}
                                        </Typography>
                                    )}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip
                                        label={getInvestmentTypeLabel(opportunity.investment_type)}
                                        color="primary"
                                    />
                                    <Chip
                                        label={getRiskLevelInfo(opportunity.risk_level).label}
                                        color={getRiskLevelInfo(opportunity.risk_level).color as any}
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {opportunity.location || '未指定地區'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {opportunity.industry || '未指定產業'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <VisibilityIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {opportunity.view_count} 次瀏覽
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<PhoneIcon />}
                                    onClick={handleInquiry}
                                    sx={{ minWidth: 150 }}
                                >
                                    立即洽詢
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<ShareIcon />}
                                    onClick={handleShare}
                                >
                                    分享
                                </Button>
                            </Box>
                        </Paper>

                        {/* 標的圖片 */}
                        {opportunity.images && opportunity.images.length > 0 && (
                            <Paper sx={{ mb: 3, overflow: 'hidden' }}>
                                <CardMedia
                                    component="img"
                                    height="400"
                                    image={opportunity.images[0].image_url}
                                    alt={opportunity.title}
                                    sx={{ objectFit: 'cover' }}
                                />
                            </Paper>
                        )}

                        {/* 標的描述 */}
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                標的介紹
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                {opportunity.description}
                            </Typography>
                        </Paper>

                        {/* 投資詳情 */}
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                投資詳情
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <TrendingUpIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="投資金額"
                                        secondary={formatAmount(opportunity.investment_amount)}
                                    />
                                </ListItem>
                                {opportunity.min_investment && (
                                    <ListItem>
                                        <ListItemIcon>
                                            <TrendingUpIcon color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="最低投資額"
                                            secondary={formatAmount(opportunity.min_investment)}
                                        />
                                    </ListItem>
                                )}
                                {opportunity.expected_return && (
                                    <ListItem>
                                        <ListItemIcon>
                                            <TrendingUpIcon color="success" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="預期報酬率"
                                            secondary={`${opportunity.expected_return}%`}
                                        />
                                    </ListItem>
                                )}
                                {opportunity.investment_period && (
                                    <ListItem>
                                        <ListItemIcon>
                                            <ScheduleIcon color="info" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="投資期間"
                                            secondary={`${opportunity.investment_period} 個月`}
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Paper>
                    </Grid>

                    {/* 側邊欄 */}
                    <Grid item xs={12} lg={4}>
                        {/* 投資摘要卡片 */}
                        <Card sx={{ mb: 3, position: 'sticky', top: 20 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    投資摘要
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {formatAmount(opportunity.investment_amount)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        總投資金額
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                                        {opportunity.expected_return || 'N/A'}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        預期報酬率
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {opportunity.investment_period || 'N/A'} 個月
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        投資期間
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    startIcon={<PhoneIcon />}
                                    onClick={handleInquiry}
                                    sx={{ mb: 2 }}
                                >
                                    立即洽詢投資
                                </Button>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<EmailIcon />}
                                    onClick={handleInquiry}
                                >
                                    發送郵件洽詢
                                </Button>
                            </CardContent>
                        </Card>

                        {/* 相關資訊 */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    相關資訊
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        投資類型
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {getInvestmentTypeLabel(opportunity.investment_type)}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        風險等級
                                    </Typography>
                                    <Chip
                                        label={getRiskLevelInfo(opportunity.risk_level).label}
                                        color={getRiskLevelInfo(opportunity.risk_level).color as any}
                                        size="small"
                                    />
                                </Box>

                                {opportunity.location && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            地區
                                        </Typography>
                                        <Typography variant="body1">
                                            {opportunity.location}
                                        </Typography>
                                    </Box>
                                )}

                                {opportunity.industry && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            產業
                                        </Typography>
                                        <Typography variant="body1">
                                            {opportunity.industry}
                                        </Typography>
                                    </Box>
                                )}

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        瀏覽次數
                                    </Typography>
                                    <Typography variant="body1">
                                        {opportunity.view_count} 次
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        洽詢次數
                                    </Typography>
                                    <Typography variant="body1">
                                        {opportunity.inquiry_count} 次
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* 洽詢對話框 */}
                <Dialog
                    open={inquiryDialogOpen}
                    onClose={() => setInquiryDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>投資洽詢</DialogTitle>
                    <DialogContent>
                        <InquiryForm
                            opportunity={opportunity}
                            onSuccess={() => {
                                setInquiryDialogOpen(false);
                                // 重新載入標的資訊以更新洽詢次數
                                loadOpportunity();
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
};

export default InvestmentDetail; 