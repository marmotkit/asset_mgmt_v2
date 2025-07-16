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
import { investmentOpportunityService } from '../../../services/investmentOpportunity.service';

interface InvestmentOpportunity {
    id: number;
    title: string;
    description: string;
    investment_type: string;
    min_investment: number;
    max_investment: number;
    total_amount: number;
    current_amount: number;
    expected_return: number;
    duration_months: number;
    risk_level: string;
    location: string;
    contact_person: string;
    contact_phone: string;
    contact_email: string;
    status: string;
    created_at: string;
    updated_at: string;
}

interface InvestmentOpportunityForm {
    title: string;
    description: string;
    investment_type: string;
    min_investment: number;
    max_investment: number;
    total_amount: number;
    expected_return: number;
    duration_months: number;
    risk_level: string;
    location: string;
    contact_person: string;
    contact_phone: string;
    contact_email: string;
    status: string;
}

const InvestmentDashboardManagement: React.FC = () => {
    const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<InvestmentOpportunity | null>(null);
    const [formData, setFormData] = useState<InvestmentOpportunityForm>({
        title: '',
        description: '',
        investment_type: '',
        min_investment: 0,
        max_investment: 0,
        total_amount: 0,
        expected_return: 0,
        duration_months: 0,
        risk_level: '',
        location: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
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
            investment_type: '',
            min_investment: 0,
            max_investment: 0,
            total_amount: 0,
            expected_return: 0,
            duration_months: 0,
            risk_level: '',
            location: '',
            contact_person: '',
            contact_phone: '',
            contact_email: '',
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
            min_investment: opportunity.min_investment,
            max_investment: opportunity.max_investment,
            total_amount: opportunity.total_amount,
            expected_return: opportunity.expected_return,
            duration_months: opportunity.duration_months,
            risk_level: opportunity.risk_level,
            location: opportunity.location,
            contact_person: opportunity.contact_person,
            contact_phone: opportunity.contact_phone,
            contact_email: opportunity.contact_email,
            status: opportunity.status
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('確定要刪除此投資標的嗎？')) {
            try {
                await investmentOpportunityService.deleteInvestmentOpportunity(id.toString());
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
                await investmentOpportunityService.updateInvestmentOpportunity(editingOpportunity.id.toString(), formData);
            } else {
                await investmentOpportunityService.createInvestmentOpportunity(formData);
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
            case 'inactive': return 'default';
            case 'closed': return 'error';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return '啟用';
            case 'inactive': return '停用';
            case 'closed': return '已結束';
            default: return status;
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
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddNew}
                    size="large"
                >
                    新增投資標的
                </Button>
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
                                        投資類型: {opportunity.investment_type}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        最低投資: ${opportunity.min_investment.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        預期報酬: {opportunity.expected_return}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        風險等級: {opportunity.risk_level}
                                    </Typography>
                                </Box>

                                <Typography variant="body2" color="text.secondary">
                                    地點: {opportunity.location}
                                </Typography>
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
                                    <MenuItem value="不動產投資">不動產投資</MenuItem>
                                    <MenuItem value="廠房投資">廠房投資</MenuItem>
                                    <MenuItem value="住宅開發">住宅開發</MenuItem>
                                    <MenuItem value="股權投資">股權投資</MenuItem>
                                    <MenuItem value="設備租賃">設備租賃</MenuItem>
                                    <MenuItem value="其他">其他</MenuItem>
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
                                    <MenuItem value="低風險">低風險</MenuItem>
                                    <MenuItem value="中等">中等</MenuItem>
                                    <MenuItem value="中高風險">中高風險</MenuItem>
                                    <MenuItem value="高風險">高風險</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="最低投資金額"
                                type="number"
                                value={formData.min_investment}
                                onChange={(e) => handleInputChange('min_investment', Number(e.target.value))}
                                required
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
                                label="總投資金額"
                                type="number"
                                value={formData.total_amount}
                                onChange={(e) => handleInputChange('total_amount', Number(e.target.value))}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="預期報酬率 (%)"
                                type="number"
                                value={formData.expected_return}
                                onChange={(e) => handleInputChange('expected_return', Number(e.target.value))}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="投資期間 (月)"
                                type="number"
                                value={formData.duration_months}
                                onChange={(e) => handleInputChange('duration_months', Number(e.target.value))}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="地點"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="聯絡人"
                                value={formData.contact_person}
                                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="聯絡電話"
                                value={formData.contact_phone}
                                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="聯絡信箱"
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                required
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
                                    <MenuItem value="active">啟用</MenuItem>
                                    <MenuItem value="inactive">停用</MenuItem>
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