import React, { useState } from 'react';
import {
    Box,
    Grid,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { InvestmentOpportunity, CreateInvestmentInquiry } from '../../../types/investment-opportunity';
import { investmentInquiryService } from '../../../services/investmentOpportunity.service';

interface InquiryFormProps {
    opportunity: InvestmentOpportunity;
    onSuccess: () => void;
}

const InquiryForm: React.FC<InquiryFormProps> = ({ opportunity, onSuccess }) => {
    const [formData, setFormData] = useState<CreateInvestmentInquiry>({
        investment_id: opportunity.id,
        name: '',
        email: '',
        phone: '',
        company: '',
        investment_amount: undefined,
        message: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // 格式化金額
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('zh-TW', {
            style: 'currency',
            currency: 'TWD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // 處理表單變更
    const handleFormChange = (field: keyof CreateInvestmentInquiry, value: any) => {
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

        if (!formData.name.trim()) {
            newErrors.name = '請輸入姓名';
        }

        if (!formData.email.trim()) {
            newErrors.email = '請輸入電子郵件';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '請輸入有效的電子郵件格式';
        }

        if (formData.investment_amount && formData.investment_amount <= 0) {
            newErrors.investment_amount = '投資金額必須大於 0';
        }

        if (formData.investment_amount && opportunity.min_investment &&
            formData.investment_amount < opportunity.min_investment) {
            newErrors.investment_amount = `投資金額不能低於 ${formatAmount(opportunity.min_investment)}`;
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
            await investmentInquiryService.createInquiry(formData);
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } catch (error) {
            console.error('提交洽詢失敗:', error);
            setErrors({ submit: '提交洽詢失敗，請稍後再試' });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                    洽詢已成功提交！我們會盡快與您聯繫。
                </Alert>
                <Typography variant="body2" color="text.secondary">
                    正在返回...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 2 }}>
            {/* 標的摘要 */}
            <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        投資標的摘要
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                標的名稱
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {opportunity.title}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                投資金額
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {formatAmount(opportunity.investment_amount)}
                            </Typography>
                        </Grid>
                        {opportunity.expected_return && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    預期報酬率
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                    {opportunity.expected_return}%
                                </Typography>
                            </Grid>
                        )}
                        {opportunity.investment_period && (
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    投資期間
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {opportunity.investment_period} 個月
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            {/* 洽詢表單 */}
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="姓名 *"
                            value={formData.name}
                            onChange={(e) => handleFormChange('name', e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="電子郵件 *"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="聯絡電話"
                            value={formData.phone || ''}
                            onChange={(e) => handleFormChange('phone', e.target.value)}
                            placeholder="請輸入聯絡電話"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="公司名稱"
                            value={formData.company || ''}
                            onChange={(e) => handleFormChange('company', e.target.value)}
                            placeholder="請輸入公司名稱"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="投資金額"
                            type="number"
                            value={formData.investment_amount || ''}
                            onChange={(e) => handleFormChange('investment_amount',
                                e.target.value ? parseFloat(e.target.value) : undefined)}
                            error={!!errors.investment_amount}
                            helperText={errors.investment_amount ||
                                (opportunity.min_investment ?
                                    `最低投資額: ${formatAmount(opportunity.min_investment)}` : '')}
                            InputProps={{
                                startAdornment: <Typography variant="body2">NT$</Typography>
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="洽詢內容"
                            multiline
                            rows={4}
                            value={formData.message || ''}
                            onChange={(e) => handleFormChange('message', e.target.value)}
                            placeholder="請描述您的投資意向或任何問題..."
                        />
                    </Grid>

                    {errors.submit && (
                        <Grid item xs={12}>
                            <Alert severity="error">
                                {errors.submit}
                            </Alert>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? '提交中...' : '提交洽詢'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default InquiryForm; 