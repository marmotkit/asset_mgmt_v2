import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
    Investment,
    InvestmentType,
    InvestmentStatus,
    InvestmentFormData,
    MovableInvestment,
    ImmovableInvestment
} from '../../../types/investment';

interface InvestmentDetailDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (investment: Investment) => Promise<void>;
    investment?: Investment | null;
}

const InvestmentDetailDialog: React.FC<InvestmentDetailDialogProps> = ({
    open,
    onClose,
    onSave,
    investment
}) => {
    const [formData, setFormData] = useState<InvestmentFormData>({
        type: 'movable',
        name: '',
        description: '',
        amount: 0,
        startDate: dayjs().format('YYYY-MM-DD'),
        status: 'pending',
        leaseItems: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (investment) {
            setFormData({
                ...investment,
                startDate: investment.startDate || dayjs().format('YYYY-MM-DD')
            });
        } else {
            setFormData({
                type: 'movable',
                name: '',
                description: '',
                amount: 0,
                startDate: dayjs().format('YYYY-MM-DD'),
                status: 'pending',
                leaseItems: []
            });
        }
    }, [investment]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) {
            newErrors.name = '請輸入投資名稱';
        }
        if (!formData.type) {
            newErrors.type = '請選擇投資類型';
        }
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = '請輸入有效的投資金額';
        }
        if (!formData.startDate) {
            newErrors.startDate = '請選擇開始日期';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        const baseInvestment = {
            id: formData.id || crypto.randomUUID(),
            companyId: formData.companyId || crypto.randomUUID(),
            name: formData.name!,
            description: formData.description || '',
            amount: formData.amount!,
            startDate: formData.startDate!,
            endDate: formData.endDate,
            status: formData.status as InvestmentStatus,
            leaseItems: formData.leaseItems || [],
            createdAt: formData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        let investment: Investment;
        if (formData.type === 'movable') {
            investment = {
                ...baseInvestment,
                type: 'movable',
                assetType: formData.assetType || '',
                serialNumber: formData.serialNumber || '',
                manufacturer: formData.manufacturer
            } as MovableInvestment;
        } else {
            investment = {
                ...baseInvestment,
                type: 'immovable',
                location: formData.location || '',
                area: formData.area || 0,
                propertyType: formData.propertyType || '',
                registrationNumber: formData.registrationNumber || ''
            } as ImmovableInvestment;
        }

        await onSave(investment);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {investment ? '編輯投資' : '新增投資'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.type}>
                            <InputLabel>投資類型</InputLabel>
                            <Select
                                value={formData.type}
                                onChange={(e) => handleFieldChange('type', e.target.value)}
                                label="投資類型"
                            >
                                <MenuItem value="movable">動產</MenuItem>
                                <MenuItem value="immovable">不動產</MenuItem>
                            </Select>
                            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.status}>
                            <InputLabel>狀態</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => handleFieldChange('status', e.target.value)}
                                label="狀態"
                            >
                                <MenuItem value="pending">審核中</MenuItem>
                                <MenuItem value="active">進行中</MenuItem>
                                <MenuItem value="completed">已完成</MenuItem>
                                <MenuItem value="terminated">已終止</MenuItem>
                            </Select>
                            {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="投資名稱"
                            value={formData.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="描述"
                            value={formData.description}
                            onChange={(e) => handleFieldChange('description', e.target.value)}
                            multiline
                            rows={2}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="投資金額"
                            value={formData.amount}
                            onChange={(e) => handleFieldChange('amount', Number(e.target.value))}
                            error={!!errors.amount}
                            helperText={errors.amount}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="開始日期"
                                value={dayjs(formData.startDate)}
                                onChange={(date) => handleFieldChange('startDate', date?.format('YYYY-MM-DD'))}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors.startDate,
                                        helperText: errors.startDate
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="結束日期"
                                value={formData.endDate ? dayjs(formData.endDate) : null}
                                onChange={(date) => handleFieldChange('endDate', date?.format('YYYY-MM-DD'))}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    {formData.type === 'movable' && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="資產類型"
                                    value={formData.assetType}
                                    onChange={(e) => handleFieldChange('assetType', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="序號"
                                    value={formData.serialNumber}
                                    onChange={(e) => handleFieldChange('serialNumber', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="製造商"
                                    value={formData.manufacturer}
                                    onChange={(e) => handleFieldChange('manufacturer', e.target.value)}
                                />
                            </Grid>
                        </>
                    )}

                    {formData.type === 'immovable' && (
                        <>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="位置"
                                    value={formData.location}
                                    onChange={(e) => handleFieldChange('location', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="面積"
                                    value={formData.area}
                                    onChange={(e) => handleFieldChange('area', Number(e.target.value))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="物業類型"
                                    value={formData.propertyType}
                                    onChange={(e) => handleFieldChange('propertyType', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="登記號碼"
                                    value={formData.registrationNumber}
                                    onChange={(e) => handleFieldChange('registrationNumber', e.target.value)}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    保存
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InvestmentDetailDialog;