import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Button,
    Alert,
    CircularProgress,
    Typography,
    Divider
} from '@mui/material';
import { InvestmentOpportunity, CreateInvestmentOpportunity, UpdateInvestmentOpportunity } from '../../../../types/investment-opportunity';

interface InvestmentFormProps {
    opportunity?: InvestmentOpportunity | null;
    onSubmit: (data: CreateInvestmentOpportunity | UpdateInvestmentOpportunity) => Promise<void>;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({ opportunity, onSubmit }) => {
    const [formData, setFormData] = useState<CreateInvestmentOpportunity>({
        title: '',
        subtitle: '',
        description: '',
        short_description: '',
        investment_amount: 0,
        min_investment: undefined,
        max_investment: undefined,
        investment_type: 'lease',
        location: '',
        industry: '',
        risk_level: 'medium',
        expected_return: undefined,
        investment_period: undefined,
        status: 'preview',
        featured: false,
        sort_order: 0
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    // 初始化表單資料
    useEffect(() => {
        if (opportunity) {
            setFormData({
                title: opportunity.title,
                subtitle: opportunity.subtitle || '',
                description: opportunity.description,
                short_description: opportunity.short_description || '',
                investment_amount: opportunity.investment_amount,
                min_investment: opportunity.min_investment,
                max_investment: opportunity.max_investment,
                investment_type: opportunity.investment_type,
                location: opportunity.location || '',
                industry: opportunity.industry || '',
                risk_level: opportunity.risk_level,
                expected_return: opportunity.expected_return,
                investment_period: opportunity.investment_period,
                status: opportunity.status,
                featured: opportunity.featured,
                sort_order: opportunity.sort_order
            });
        }
    }, [opportunity]);

    // 處理表單變更
    const handleFormChange = (field: keyof CreateInvestmentOpportunity, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // 清除錯誤
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // 表單驗證
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.title.trim()) {
            newErrors.title = '請輸入標的名稱';
        }

        if (!formData.description.trim()) {
            newErrors.description = '請輸入標的描述';
        }

        if (formData.investment_amount <= 0) {
            newErrors.investment_amount = '投資金額必須大於 0';
        }

        if (formData.min_investment && formData.min_investment <= 0) {
            newErrors.min_investment = '最低投資額必須大於 0';
        }

        if (formData.max_investment && formData.max_investment <= 0) {
            newErrors.max_investment = '最高投資額必須大於 0';
        }

        if (formData.min_investment && formData.max_investment &&
            formData.min_investment > formData.max_investment) {
            newErrors.max_investment = '最高投資額不能低於最低投資額';
        }

        if (formData.expected_return && (formData.expected_return < 0 || formData.expected_return > 100)) {
            newErrors.expected_return = '預期報酬率必須在 0-100% 之間';
        }

        if (formData.investment_period && formData.investment_period <= 0) {
            newErrors.investment_period = '投資期間必須大於 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 處理表單提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('提交失敗:', error);
            setErrors({ submit: '提交失敗，請稍後再試' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ py: 2 }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* 基本資訊 */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            基本資訊
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="標的名稱 *"
                            value={formData.title}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                            error={!!errors.title}
                            helperText={errors.title}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="副標題"
                            value={formData.subtitle}
                            onChange={(e) => handleFormChange('subtitle', e.target.value)}
                            placeholder="可選的副標題"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="簡短描述"
                            value={formData.short_description}
                            onChange={(e) => handleFormChange('short_description', e.target.value)}
                            placeholder="簡短的標的描述，用於列表顯示"
                            multiline
                            rows={2}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="詳細描述 *"
                            value={formData.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                            error={!!errors.description}
                            helperText={errors.description}
                            multiline
                            rows={6}
                            required
                        />
                    </Grid>

                    {/* 投資資訊 */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                            投資資訊
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="總投資金額 *"
                            type="number"
                            value={formData.investment_amount}
                            onChange={(e) => handleFormChange('investment_amount', parseFloat(e.target.value) || 0)}
                            error={!!errors.investment_amount}
                            helperText={errors.investment_amount}
                            InputProps={{
                                startAdornment: <Typography variant="body2">NT$</Typography>
                            }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>投資類型 *</InputLabel>
                            <Select
                                value={formData.investment_type}
                                onChange={(e) => handleFormChange('investment_type', e.target.value)}
                                label="投資類型 *"
                                required
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
                        <TextField
                            fullWidth
                            label="最低投資額"
                            type="number"
                            value={formData.min_investment || ''}
                            onChange={(e) => handleFormChange('min_investment',
                                e.target.value ? parseFloat(e.target.value) : undefined)}
                            error={!!errors.min_investment}
                            helperText={errors.min_investment}
                            InputProps={{
                                startAdornment: <Typography variant="body2">NT$</Typography>
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="最高投資額"
                            type="number"
                            value={formData.max_investment || ''}
                            onChange={(e) => handleFormChange('max_investment',
                                e.target.value ? parseFloat(e.target.value) : undefined)}
                            error={!!errors.max_investment}
                            helperText={errors.max_investment}
                            InputProps={{
                                startAdornment: <Typography variant="body2">NT$</Typography>
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="預期報酬率 (%)"
                            type="number"
                            value={formData.expected_return || ''}
                            onChange={(e) => handleFormChange('expected_return',
                                e.target.value ? parseFloat(e.target.value) : undefined)}
                            error={!!errors.expected_return}
                            helperText={errors.expected_return}
                            inputProps={{
                                min: 0,
                                max: 100,
                                step: 0.1
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="投資期間 (月)"
                            type="number"
                            value={formData.investment_period || ''}
                            onChange={(e) => handleFormChange('investment_period',
                                e.target.value ? parseInt(e.target.value) : undefined)}
                            error={!!errors.investment_period}
                            helperText={errors.investment_period}
                            inputProps={{
                                min: 1
                            }}
                        />
                    </Grid>

                    {/* 其他資訊 */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                            其他資訊
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="地區"
                            value={formData.location}
                            onChange={(e) => handleFormChange('location', e.target.value)}
                            placeholder="例如：台北市、台中市"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="產業"
                            value={formData.industry}
                            onChange={(e) => handleFormChange('industry', e.target.value)}
                            placeholder="例如：科技、房地產、製造業"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>風險等級 *</InputLabel>
                            <Select
                                value={formData.risk_level}
                                onChange={(e) => handleFormChange('risk_level', e.target.value)}
                                label="風險等級 *"
                                required
                            >
                                <MenuItem value="low">低風險</MenuItem>
                                <MenuItem value="medium">中風險</MenuItem>
                                <MenuItem value="high">高風險</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>狀態 *</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => handleFormChange('status', e.target.value)}
                                label="狀態 *"
                                required
                            >
                                <MenuItem value="preview">預告</MenuItem>
                                <MenuItem value="active">上市</MenuItem>
                                <MenuItem value="hidden">隱藏</MenuItem>
                                <MenuItem value="closed">關閉</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="排序順序"
                            type="number"
                            value={formData.sort_order}
                            onChange={(e) => handleFormChange('sort_order', parseInt(e.target.value) || 0)}
                            inputProps={{
                                min: 0
                            }}
                            helperText="數字越小排序越前面"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.featured}
                                    onChange={(e) => handleFormChange('featured', e.target.checked)}
                                />
                            }
                            label="特色標的"
                        />
                    </Grid>

                    {/* 錯誤訊息 */}
                    {errors.submit && (
                        <Grid item xs={12}>
                            <Alert severity="error">
                                {errors.submit}
                            </Alert>
                        </Grid>
                    )}

                    {/* 提交按鈕 */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? '儲存中...' : (opportunity ? '更新' : '建立')}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default InvestmentForm; 