import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
} from '@mui/material';
import { Company, IndustryType } from '../../../types/company';

interface CompanyDetailDialogProps {
    open: boolean;
    onClose: () => void;
    companyData: Company | null;
    onSave: (data: Partial<Company>) => Promise<void>;
}

const INDUSTRY_OPTIONS: IndustryType[] = [
    '科技業',
    '金融業',
    '製造業',
    '服務業',
    '零售業',
    '營建業',
    '運輸業',
    '其他',
];

const CompanyDetailDialog: React.FC<CompanyDetailDialogProps> = ({
    open,
    onClose,
    companyData,
    onSave,
}) => {
    const [formData, setFormData] = useState<Partial<Company>>({
        name: '',
        nameEn: '',
        industry: undefined,
        contact: {
            name: '',
            phone: '',
            fax: '',
            email: '',
        },
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (companyData) {
            setFormData(companyData);
        } else {
            setFormData({
                name: '',
                nameEn: '',
                industry: undefined,
                contact: {
                    name: '',
                    phone: '',
                    fax: '',
                    email: '',
                },
            });
        }
        setErrors({});
    }, [companyData]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) newErrors.name = '公司名稱為必填';
        if (!formData.contact?.name) newErrors['contact.name'] = '聯絡人為必填';
        if (!formData.contact?.phone) newErrors['contact.phone'] = '聯絡電話為必填';
        if (!formData.contact?.email) newErrors['contact.email'] = '電子郵件為必填';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.contact?.email && !emailRegex.test(formData.contact.email)) {
            newErrors['contact.email'] = '電子郵件格式不正確';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            // 錯誤處理已在父元件中完成
        }
    };

    const handleChange = (field: string, value: any) => {
        if (field.startsWith('contact.')) {
            const contactField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                contact: {
                    ...prev.contact!,
                    [contactField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {companyData ? '編輯公司資料' : '新增公司'}
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="公司名稱"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="英文簡稱"
                            value={formData.nameEn || ''}
                            onChange={(e) => handleChange('nameEn', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="產業類別"
                            value={formData.industry || ''}
                            onChange={(e) => handleChange('industry', e.target.value)}
                        >
                            {INDUSTRY_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="聯絡人"
                            value={formData.contact?.name || ''}
                            onChange={(e) => handleChange('contact.name', e.target.value)}
                            error={!!errors['contact.name']}
                            helperText={errors['contact.name']}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="聯絡電話"
                            value={formData.contact?.phone || ''}
                            onChange={(e) => handleChange('contact.phone', e.target.value)}
                            error={!!errors['contact.phone']}
                            helperText={errors['contact.phone']}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="傳真電話"
                            value={formData.contact?.fax || ''}
                            onChange={(e) => handleChange('contact.fax', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="電子郵件"
                            value={formData.contact?.email || ''}
                            onChange={(e) => handleChange('contact.email', e.target.value)}
                            error={!!errors['contact.email']}
                            helperText={errors['contact.email']}
                            required
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={handleSubmit} variant="contained">
                    儲存
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CompanyDetailDialog; 