import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Alert,
    CircularProgress,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Pagination,
    Stack,
    Paper,
    Divider,
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    TrendingUp as TrendingUpIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { InvestmentOpportunity, InvestmentFilter } from '../../../types/investment-opportunity';
import { investmentOpportunityService } from '../../../services/investmentOpportunity.service';
import { formatCurrency } from '../../../utils/format';
import InquiryDialog from './InquiryDialog';

const InvestmentDashboard: React.FC = () => {
    const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(12);

    // 篩選狀態
    const [filter, setFilter] = useState<InvestmentFilter>({
        status: 'active',
        featured: true
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedRisk, setSelectedRisk] = useState<string>('');

    // 洽詢對話框
    const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
    const [selectedOpportunity, setSelectedOpportunity] = useState<InvestmentOpportunity | null>(null);

    useEffect(() => {
        loadOpportunities();
    }, [page, filter]);

    const loadOpportunities = async () => {
        try {
            setLoading(true);
            const result = await investmentOpportunityService.getInvestmentOpportunities(
                filter,
                'sort_order',
                'desc',
                page,
                limit
            );
            setOpportunities(result.opportunities);
            setTotal(result.total);
        } catch (err) {
            setError('載入投資標的失敗');
            console.error('載入投資標的失敗:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        const newFilter: InvestmentFilter = {
            ...filter,
            search: searchTerm || undefined,
            investment_type: selectedType as any || undefined,
            risk_level: selectedRisk as any || undefined,
        };
        setFilter(newFilter);
        setPage(1);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedType('');
        setSelectedRisk('');
        setFilter({ status: 'active', featured: true });
        setPage(1);
    };

    const handleInquiryClick = (opportunity: InvestmentOpportunity) => {
        setSelectedOpportunity(opportunity);
        setInquiryDialogOpen(true);
    };

    const handleInquirySubmit = async () => {
        await loadOpportunities(); // 重新載入以更新洽詢數量
        setInquiryDialogOpen(false);
        setSelectedOpportunity(null);
    };

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low': return 'success';
            case 'medium': return 'warning';
            case 'high': return 'error';
            default: return 'default';
        }
    };

    const getRiskLevelLabel = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low': return '低風險';
            case 'medium': return '中風險';
            case 'high': return '高風險';
            default: return riskLevel;
        }
    };

    const getInvestmentTypeLabel = (type: string) => {
        switch (type) {
            case 'lease': return '租賃';
            case 'equity': return '股權';
            case 'debt': return '債權';
            case 'real_estate': return '不動產';
            case 'other': return '其他';
            default: return type;
        }
    };

    if (loading && opportunities.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* 標題區域 */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    投資看板
                </Typography>
                <Typography variant="h6" color="textSecondary">
                    探索優質投資機會，實現財富增值
                </Typography>
            </Box>

            {/* 搜尋和篩選區域 */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="搜尋投資標的..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>投資類型</InputLabel>
                            <Select
                                value={selectedType}
                                label="投資類型"
                                onChange={(e: SelectChangeEvent) => setSelectedType(e.target.value)}
                            >
                                <MenuItem value="">全部</MenuItem>
                                <MenuItem value="lease">租賃</MenuItem>
                                <MenuItem value="equity">股權</MenuItem>
                                <MenuItem value="debt">債權</MenuItem>
                                <MenuItem value="real_estate">不動產</MenuItem>
                                <MenuItem value="other">其他</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>風險等級</InputLabel>
                            <Select
                                value={selectedRisk}
                                label="風險等級"
                                onChange={(e: SelectChangeEvent) => setSelectedRisk(e.target.value)}
                            >
                                <MenuItem value="">全部</MenuItem>
                                <MenuItem value="low">低風險</MenuItem>
                                <MenuItem value="medium">中風險</MenuItem>
                                <MenuItem value="high">高風險</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                onClick={handleSearch}
                                fullWidth
                            >
                                搜尋
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<FilterIcon />}
                                onClick={handleClearFilters}
                            >
                                清除
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {/* 錯誤訊息 */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* 投資標的列表 */}
            <Grid container spacing={3}>
                {opportunities.map((opportunity) => (
                    <Grid item xs={12} sm={6} md={4} key={opportunity.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                {/* 標題和狀態 */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                                        {opportunity.title}
                                    </Typography>
                                    {opportunity.featured && (
                                        <Chip
                                            label="精選"
                                            color="primary"
                                            size="small"
                                            icon={<TrendingUpIcon />}
                                        />
                                    )}
                                </Box>

                                {/* 副標題 */}
                                {opportunity.subtitle && (
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        {opportunity.subtitle}
                                    </Typography>
                                )}

                                {/* 投資金額 */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                                        {formatCurrency(opportunity.investment_amount)}
                                    </Typography>
                                    {opportunity.min_investment && (
                                        <Typography variant="body2" color="textSecondary">
                                            最低投資: {formatCurrency(opportunity.min_investment)}
                                        </Typography>
                                    )}
                                </Box>

                                {/* 標籤 */}
                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    <Chip
                                        label={getInvestmentTypeLabel(opportunity.investment_type)}
                                        size="small"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={getRiskLevelLabel(opportunity.risk_level)}
                                        color={getRiskLevelColor(opportunity.risk_level) as any}
                                        size="small"
                                    />
                                </Stack>

                                {/* 位置和產業 */}
                                {(opportunity.location || opportunity.industry) && (
                                    <Box sx={{ mb: 2 }}>
                                        {opportunity.location && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="textSecondary">
                                                    {opportunity.location}
                                                </Typography>
                                            </Box>
                                        )}
                                        {opportunity.industry && (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <BusinessIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="textSecondary">
                                                    {opportunity.industry}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                {/* 預期報酬 */}
                                {opportunity.expected_return && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                                            預期年化報酬: {opportunity.expected_return}%
                                        </Typography>
                                    </Box>
                                )}

                                {/* 統計資訊 */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        瀏覽: {opportunity.view_count}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        洽詢: {opportunity.inquiry_count}
                                    </Typography>
                                </Box>

                                {/* 簡短描述 */}
                                {opportunity.short_description && (
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        {opportunity.short_description}
                                    </Typography>
                                )}
                            </CardContent>

                            <Divider />

                            <CardActions sx={{ p: 2 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => handleInquiryClick(opportunity)}
                                >
                                    立即洽詢
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* 分頁 */}
            {total > limit && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={Math.ceil(total / limit)}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            )}

            {/* 洽詢對話框 */}
            <InquiryDialog
                open={inquiryDialogOpen}
                opportunity={selectedOpportunity}
                onClose={() => {
                    setInquiryDialogOpen(false);
                    setSelectedOpportunity(null);
                }}
                onSubmit={handleInquirySubmit}
            />
        </Container>
    );
};

export default InvestmentDashboard; 