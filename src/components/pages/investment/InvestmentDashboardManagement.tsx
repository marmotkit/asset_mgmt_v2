import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
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
    Chip,
    Grid,
    Card,
    CardContent,
    CardActions,
    Fab
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { investmentOpportunityService } from '../../../services/investmentOpportunity.service';
import { InvestmentOpportunity, CreateInvestmentOpportunity, UpdateInvestmentOpportunity } from '../../../types/investment-opportunity';

interface InvestmentOpportunityForm {
    title: string;
    description: string;
    investment_type: 'lease' | 'equity' | 'debt' | 'real_estate' | 'other';
    investment_amount: number;
    min_investment?: number;
    max_investment?: number;
    expected_return?: number;
    investment_period?: number;
    risk_level: 'low' | 'medium' | 'high';
    location?: string;
    status: 'preview' | 'active' | 'hidden' | 'closed';
}

const InvestmentDashboardManagement: React.FC = () => {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<InvestmentOpportunity | null>(null);
    const [formData, setFormData] = useState<InvestmentOpportunityForm>({
        title: '',
        description: '',
        investment_type: 'other',
        investment_amount: 0,
        min_investment: 0,
        max_investment: 0,
        expected_return: 0,
        investment_period: 0,
        risk_level: 'medium',
        location: '',
        status: 'active'
    });

    useEffect(() => {
        loadOpportunities();
    }, []);

    const loadOpportunities = async () => {
        try {
            setLoading(true);
            const result = await investmentOpportunityService.getInvestmentOpportunities();
            setOpportunities(result.opportunities || []);
        } catch (err) {
            setError('載入投資標的失敗');
            console.error('載入投資標的失敗:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingOpportunity(null);
        setFormData({
            title: '',
            description: '',
            investment_type: 'other',
            investment_amount: 0,
            min_investment: 0,
            max_investment: 0,
            expected_return: 0,
            investment_period: 0,
            risk_level: 'medium',
            location: '',
            status: 'active'
        });
        setDialogOpen(true);
    };

    const handleEdit = (opportunity: InvestmentOpportunity) => {
        setEditingOpportunity(opportunity);
        setFormData({
            title: opportunity.title,
            description: opportunity.description,
            investment_type: opportunity.investment_type,
            investment_amount: opportunity.investment_amount,
            min_investment: opportunity.min_investment,
            max_investment: opportunity.max_investment,
            expected_return: opportunity.expected_return,
            investment_period: opportunity.investment_period,
            risk_level: opportunity.risk_level,
            location: opportunity.location,
            status: opportunity.status
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('確定要刪除此投資標的嗎？')) {
            try {
                await investmentOpportunityService.deleteInvestmentOpportunity(id);
                await loadOpportunities();
            } catch (err) {
                setError('刪除投資標的失敗');
                console.error('刪除投資標的失敗:', err);
            }
        }
    };

    const handleSave = async () => {
        try {
            if (editingOpportunity) {
                const updateData: UpdateInvestmentOpportunity = {
                    title: formData.title,
                    description: formData.description,
                    investment_type: formData.investment_type,
                    investment_amount: formData.investment_amount,
                    min_investment: formData.min_investment,
                    max_investment: formData.max_investment,
                    expected_return: formData.expected_return,
                    investment_period: formData.investment_period,
                    risk_level: formData.risk_level,
                    location: formData.location,
                    status: formData.status
                };
                await investmentOpportunityService.updateInvestmentOpportunity(editingOpportunity.id, updateData);
            } else {
                const createData: CreateInvestmentOpportunity = {
                    title: formData.title,
                    description: formData.description,
                    investment_type: formData.investment_type,
                    investment_amount: formData.investment_amount,
                    min_investment: formData.min_investment,
                    max_investment: formData.max_investment,
                    expected_return: formData.expected_return,
                    investment_period: formData.investment_period,
                    risk_level: formData.risk_level,
                    location: formData.location,
                    status: formData.status
                };
                await investmentOpportunityService.createInvestmentOpportunity(createData);
            }
            setDialogOpen(false);
            await loadOpportunities();
        } catch (err) {
            setError('儲存投資標的失敗');
            console.error('儲存投資標的失敗:', err);
        }
    };

    const handleInputChange = (field: keyof InvestmentOpportunityForm, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'preview': return 'warning';
            case 'hidden': return 'default';
            case 'closed': return 'error';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return '啟用';
            case 'preview': return '預覽';
            case 'hidden': return '隱藏';
            case 'closed': return '已結束';
            default: return status;
        }
    };

    const getInvestmentTypeText = (type: string) => {
        switch (type) {
            case 'lease': return '租賃投資';
            case 'equity': return '股權投資';
            case 'debt': return '債權投資';
            case 'real_estate': return '房地產';
            case 'other': return '其他';
            default: return type;
        }
    };

    const getRiskLevelText = (level: string) => {
        switch (level) {
            case 'low': return '低風險';
            case 'medium': return '中等';
            case 'high': return '高風險';
            default: return level;
        }
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
                    投資看板管理
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/investment-inquiry-management')}
                        size="large"
                    >
                        洽詢管理
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddNew}
                        size="large"
                    >
                        新增投資標的
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {opportunities.map((opportunity) => (
                    <Grid item xs={12} md={6} lg={4} key={opportunity.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                                        {opportunity.title}
                                    </Typography>
                                    <Chip
                                        label={getStatusText(opportunity.status)}
                                        color={getStatusColor(opportunity.status) as any}
                                        size="small"
                                    />
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {opportunity.description.length > 100
                                        ? `${opportunity.description.substring(0, 100)}...`
                                        : opportunity.description}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        投資類型: {getInvestmentTypeText(opportunity.investment_type)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        投資金額: ${opportunity.investment_amount.toLocaleString()}
                                    </Typography>
                                    {opportunity.min_investment && (
                                        <Typography variant="body2" color="text.secondary">
                                            最低投資: ${opportunity.min_investment.toLocaleString()}
                                        </Typography>
                                    )}
                                    {opportunity.expected_return && (
                                        <Typography variant="body2" color="text.secondary">
                                            預期報酬: {opportunity.expected_return}%
                                        </Typography>
                                    )}
                                    <Typography variant="body2" color="text.secondary">
                                        風險等級: {getRiskLevelText(opportunity.risk_level)}
                                    </Typography>
                                </Box>

                                {opportunity.location && (
                                    <Typography variant="body2" color="text.secondary">
                                        地點: {opportunity.location}
                                    </Typography>
                                )}
                            </CardContent>

                            <CardActions>
                                <Button size="small" startIcon={<ViewIcon />}>
                                    查看詳情
                                </Button>
                                <Button
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => handleEdit(opportunity)}
                                >
                                    編輯
                                </Button>
                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={() => handleDelete(opportunity.id)}
                                >
                                    刪除
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {opportunities.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        目前沒有投資標的
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        點擊「新增投資標的」開始建立
                    </Typography>
                </Box>
            )}

            {/* 新增/編輯對話框 */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingOpportunity ? '編輯投資標的' : '新增投資標的'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="標題"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="描述"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                multiline
                                rows={4}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>投資類型</InputLabel>
                                <Select
                                    value={formData.investment_type}
                                    onChange={(e) => handleInputChange('investment_type', e.target.value)}
                                    label="投資類型"
                                >
                                    <MenuItem value="lease">租賃投資</MenuItem>
                                    <MenuItem value="equity">股權投資</MenuItem>
                                    <MenuItem value="debt">債權投資</MenuItem>
                                    <MenuItem value="real_estate">房地產</MenuItem>
                                    <MenuItem value="other">其他</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth required>
                                <InputLabel>風險等級</InputLabel>
                                <Select
                                    value={formData.risk_level}
                                    onChange={(e) => handleInputChange('risk_level', e.target.value)}
                                    label="風險等級"
                                >
                                    <MenuItem value="low">低風險</MenuItem>
                                    <MenuItem value="medium">中等</MenuItem>
                                    <MenuItem value="high">高風險</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="投資金額"
                                type="number"
                                value={formData.investment_amount}
                                onChange={(e) => handleInputChange('investment_amount', Number(e.target.value))}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="最低投資金額"
                                type="number"
                                value={formData.min_investment}
                                onChange={(e) => handleInputChange('min_investment', Number(e.target.value))}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="最高投資金額"
                                type="number"
                                value={formData.max_investment}
                                onChange={(e) => handleInputChange('max_investment', Number(e.target.value))}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="預期報酬率 (%)"
                                type="number"
                                value={formData.expected_return}
                                onChange={(e) => handleInputChange('expected_return', Number(e.target.value))}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="投資期間 (月)"
                                type="number"
                                value={formData.investment_period}
                                onChange={(e) => handleInputChange('investment_period', Number(e.target.value))}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="地點"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>狀態</InputLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    label="狀態"
                                >
                                    <MenuItem value="preview">預覽</MenuItem>
                                    <MenuItem value="active">啟用</MenuItem>
                                    <MenuItem value="hidden">隱藏</MenuItem>
                                    <MenuItem value="closed">已結束</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>取消</Button>
                    <Button onClick={handleSave} variant="contained">
                        {editingOpportunity ? '更新' : '新增'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 浮動新增按鈕 */}
            <Fab
                color="primary"
                aria-label="新增投資標的"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                onClick={handleAddNew}
            >
                <AddIcon />
            </Fab>
        </Box>
    );
};

export default InvestmentDashboardManagement; 