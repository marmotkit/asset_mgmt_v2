import React, { useState } from 'react';
import {
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
    Typography,
    Box,
    Alert,
    CircularProgress,
    Grid,
    Chip,
} from '@mui/material';
import { InvestmentOpportunity, CreateInvestmentInquiry } from '../../../types/investment-opportunity';
import { investmentInquiryService } from '../../../services/investmentOpportunity.service';
import { formatCurrency } from '../../../utils/format';
import { useSnackbar } from 'notistack';

interface InquiryDialogProps {
    open: boolean;
    opportunity: InvestmentOpportunity | null;
    onClose: () => void;
    onSubmit: () => void;
}

const InquiryDialog: React.FC<InquiryDialogProps> = ({
    open,
    opportunity,
    onClose,
    onSubmit
}) => {
    const [formData, setFormData] = useState<CreateInvestmentInquiry>({
        investment_id: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        investment_amount: undefined,
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { enqueueSnackbar } = useSnackbar();

    // 當對話框開啟時，初始化表單資料
    React.useEffect(() => {
        if (open && opportunity) {
            setFormData({
                investment_id: opportunity.id,
                name: '',
                email: '',
                phone: '',
                company: '',
                investment_amount: opportunity.min_investment || undefined,
                message: '',
            });
            setErrors({});
        }
    }, [open, opportunity]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = '請輸入姓名';
        }

        if (!formData.email.trim()) {
            newErrors.email = '請輸入電子郵件';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '請輸入有效的電子郵件格式';
        }

        if (formData.phone && !/^[\d\-\+\(\)\s]+$/.test(formData.phone)) {
            newErrors.phone = '請輸入有效的電話號碼';
        }

        if (formData.investment_amount && formData.investment_amount < (opportunity?.min_investment || 0)) {
            newErrors.investment_amount = `投資金額不能低於 ${formatCurrency(opportunity?.min_investment || 0)}`;
        }

        if (formData.investment_amount && formData.investment_amount > (opportunity?.investment_amount || 0)) {
            newErrors.investment_amount = `投資金額不能超過 ${formatCurrency(opportunity?.investment_amount || 0)}`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            await investmentInquiryService.createInquiry(formData);
            enqueueSnackbar('洽詢已成功送出，我們會盡快與您聯繫！', { variant: 'success' });
            onSubmit();
        } catch (error) {
            console.error('送出洽詢失敗:', error);
            enqueueSnackbar('送出洽詢失敗，請稍後再試', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof CreateInvestmentInquiry, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // 清除該欄位的錯誤
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    if (!opportunity) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">投資洽詢</Typography>
                    <Chip
                        label={opportunity.featured ? '精選標的' : '一般標的'}
                        color={opportunity.featured ? 'primary' : 'default'}
                        size="small"
                    />
                </Box>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={3}>
                    {/* 投資標的資訊 */}
                    <Grid item xs={12}>
                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                {opportunity.title}
                            </Typography>
                            {opportunity.subtitle && (
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    {opportunity.subtitle}
                                </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                                <Typography variant="body2">
                                    <strong>投資金額:</strong> {formatCurrency(opportunity.investment_amount)}
                                </Typography>
                                {opportunity.min_investment && (
                                    <Typography variant="body2">
                                        <strong>最低投資:</strong> {formatCurrency(opportunity.min_investment)}
                                    </Typography>
                                )}
                                {opportunity.expected_return && (
                                    <Typography variant="body2">
                                        <strong>預期報酬:</strong> {opportunity.expected_return}%
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    {/* 洽詢表單 */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="姓名 *"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
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
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="電話號碼"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            placeholder="例: 0912-345-678"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="公司名稱"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="投資金額"
                            type="number"
                            value={formData.investment_amount || ''}
                            onChange={(e) => handleInputChange('investment_amount', e.target.value ? Number(e.target.value) : undefined)}
                            error={!!errors.investment_amount}
                            helperText={errors.investment_amount || `建議投資金額: ${formatCurrency(opportunity.min_investment || opportunity.investment_amount)}`}
                            InputProps={{
                                startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>NT$</Typography>,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="洽詢內容"
                            multiline
                            rows={4}
                            value={formData.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            placeholder="請描述您的投資需求、問題或特殊要求..."
                        />
                    </Grid>
                </Grid>

                {/* 注意事項 */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="info.main">
                        <strong>注意事項:</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        • 我們會在收到洽詢後 1-2 個工作天內與您聯繫
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        • 請確保提供的聯絡資訊正確，以便我們能及時回覆
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        • 投資金額僅供參考，實際投資條件將由雙方協商決定
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} disabled={loading}>
                    取消
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? '送出中...' : '送出洽詢'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InquiryDialog; 