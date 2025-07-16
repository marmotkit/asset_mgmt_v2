import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Button,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Paper,
    InputAdornment,
    CircularProgress,
    Alert,
    Pagination,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    TrendingUp as TrendingUpIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
    Visibility as VisibilityIcon,
    Favorite as FavoriteIcon,
    Share as ShareIcon,
    FilterList as FilterIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { InvestmentOpportunity, InvestmentFilter } from '../../../types/investment-opportunity';
import { investmentOpportunityService } from '../../../services/investmentOpportunity.service';

// 投資類型選項
const investmentTypeOptions = [
    { value: 'lease', label: '租賃投資', color: 'primary' },
    { value: 'equity', label: '股權投資', color: 'success' },
    { value: 'debt', label: '債權投資', color: 'warning' },
    { value: 'real_estate', label: '房地產', color: 'info' },
    { value: 'other', label: '其他', color: 'default' }
];

// 風險等級選項
const riskLevelOptions = [
    { value: 'low', label: '低風險', color: 'success' },
    { value: 'medium', label: '中風險', color: 'warning' },
    { value: 'high', label: '高風險', color: 'error' }
];

const InvestmentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);

    // 篩選狀態
    const [filter, setFilter] = useState<InvestmentFilter>({
        status: 'active',
        search: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // 載入投資標的
    const loadOpportunities = async () => {
        setLoading(true);
        try {
            const result = await investmentOpportunityService.getInvestmentOpportunities(
                filter,
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

    // 處理篩選變更
    const handleFilterChange = (key: keyof InvestmentFilter, value: any) => {
        setFilter(prev => ({ ...prev, [key]: value }));
        setPage(1); // 重置頁碼
    };

    // 處理搜尋
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFilterChange('search', event.target.value);
    };

    // 處理金額範圍變更
    const handleAmountRangeChange = (event: Event, newValue: number | number[]) => {
        const [min, max] = newValue as number[];
        handleFilterChange('min_amount', min);
        handleFilterChange('max_amount', max);
    };

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
        return investmentTypeOptions.find(option => option.value === type)?.label || type;
    };

    // 取得風險等級標籤
    const getRiskLevelLabel = (level: string) => {
        return riskLevelOptions.find(option => option.value === level)?.label || level;
    };

    // 取得風險等級顏色
    const getRiskLevelColor = (level: string) => {
        return riskLevelOptions.find(option => option.value === level)?.color || 'default';
    };

    // 處理標的點擊
    const handleOpportunityClick = (id: string) => {
        navigate(`/investment-dashboard/${id}`);
    };

    // 處理分享
    const handleShare = (opportunity: InvestmentOpportunity) => {
        const url = `${window.location.origin}/investment-dashboard/${opportunity.id}`;
        if (navigator.share) {
            navigator.share({
                title: opportunity.title,
                text: opportunity.short_description || opportunity.description,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            // 這裡可以顯示一個提示訊息
        }
    };

    // 處理進入管理頁面
    const handleManageClick = () => {
        navigate('/investment-dashboard-management');
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4
        }}>
            <Container maxWidth="xl">
                {/* 標題區域 */}
                <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
                    <Typography
                        variant="h2"
                        component="h1"
                        sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            mb: 2,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                        }}
                    >
                        投資看板
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255,255,255,0.9)',
                            maxWidth: 600,
                            mx: 'auto'
                        }}
                    >
                        探索優質投資機會，實現財富增值
                    </Typography>

                    {/* 管理按鈕 */}
                    <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                        <Tooltip title="管理投資標的">
                            <IconButton
                                onClick={handleManageClick}
                                sx={{
                                    color: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255,255,255,0.3)',
                                    }
                                }}
                            >
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* 搜尋和篩選區域 */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder="搜尋投資標的..."
                                value={filter.search || ''}
                                onChange={handleSearch}
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
                                <InputLabel>投資類型</InputLabel>
                                <Select
                                    value={filter.investment_type || ''}
                                    onChange={(e) => handleFilterChange('investment_type', e.target.value)}
                                    label="投資類型"
                                >
                                    <MenuItem value="">全部</MenuItem>
                                    {investmentTypeOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                onClick={() => setShowFilters(!showFilters)}
                                fullWidth
                            >
                                {showFilters ? '隱藏篩選' : '更多篩選'}
                            </Button>
                        </Grid>
                    </Grid>

                    {/* 進階篩選 */}
                    {showFilters && (
                        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>風險等級</InputLabel>
                                        <Select
                                            value={filter.risk_level || ''}
                                            onChange={(e) => handleFilterChange('risk_level', e.target.value)}
                                            label="風險等級"
                                        >
                                            <MenuItem value="">全部</MenuItem>
                                            {riskLevelOptions.map(option => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography gutterBottom>投資金額範圍</Typography>
                                    <Slider
                                        value={[filter.min_amount || 0, filter.max_amount || 10000000]}
                                        onChange={handleAmountRangeChange}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={10000000}
                                        step={100000}
                                        valueLabelFormat={(value) => formatAmount(value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel>地區</InputLabel>
                                        <Select
                                            value={filter.location || ''}
                                            onChange={(e) => handleFilterChange('location', e.target.value)}
                                            label="地區"
                                        >
                                            <MenuItem value="">全部</MenuItem>
                                            <MenuItem value="台北">台北</MenuItem>
                                            <MenuItem value="新北">新北</MenuItem>
                                            <MenuItem value="桃園">桃園</MenuItem>
                                            <MenuItem value="台中">台中</MenuItem>
                                            <MenuItem value="台南">台南</MenuItem>
                                            <MenuItem value="高雄">高雄</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </Paper>

                {/* 載入中 */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress size={60} />
                    </Box>
                )}

                {/* 錯誤訊息 */}
                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                {/* 投資標的網格 */}
                {!loading && !error && (
                    <>
                        <Grid container spacing={3}>
                            {opportunities.map((opportunity) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={opportunity.id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 6
                                            },
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleOpportunityClick(opportunity.id)}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={opportunity.images?.[0]?.image_url || '/default-investment.jpg'}
                                            alt={opportunity.title}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Chip
                                                    label={getInvestmentTypeLabel(opportunity.investment_type)}
                                                    size="small"
                                                    color="primary"
                                                />
                                                <Chip
                                                    label={getRiskLevelLabel(opportunity.risk_level)}
                                                    size="small"
                                                    color={getRiskLevelColor(opportunity.risk_level) as any}
                                                />
                                            </Box>

                                            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                                                {opportunity.title}
                                            </Typography>

                                            {opportunity.subtitle && (
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    {opportunity.subtitle}
                                                </Typography>
                                            )}

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {opportunity.short_description || opportunity.description.substring(0, 100)}...
                                            </Typography>

                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {opportunity.location || '未指定'}
                                                </Typography>
                                            </Box>

                                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                                {formatAmount(opportunity.investment_amount)}
                                            </Typography>

                                            {opportunity.expected_return && (
                                                <Typography variant="body2" color="success.main">
                                                    預期報酬率: {opportunity.expected_return}%
                                                </Typography>
                                            )}
                                        </CardContent>

                                        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <VisibilityIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {opportunity.view_count}
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Tooltip title="分享">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShare(opportunity);
                                                        }}
                                                    >
                                                        <ShareIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* 分頁 */}
                        {total > pageSize && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={Math.ceil(total / pageSize)}
                                    page={page}
                                    onChange={(_, value) => setPage(value)}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        )}

                        {/* 無資料 */}
                        {opportunities.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" color="text.secondary">
                                    目前沒有符合條件的投資標的
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default InvestmentDashboard; 