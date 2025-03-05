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
    Typography,
} from '@mui/material';
import { LeaseItem, ProfitSharing, ProfitSharingType } from '../../../types/lease';
import dayjs from 'dayjs';

interface LeaseItemDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (leaseItem: LeaseItem) => Promise<void>;
    leaseItem?: LeaseItem | null;
    investmentId: string;
}

const LeaseItemDialog: React.FC<LeaseItemDialogProps> = ({
    open,
    onClose,
    onSave,
    leaseItem,
    investmentId
}) => {
    const defaultProfitSharing: ProfitSharing = {
        type: 'monthly_fixed',
        value: 0,
        description: '',
        minimumAmount: 0,
        maximumAmount: 0
    };

    const [formData, setFormData] = useState<LeaseItem>({
        id: crypto.randomUUID(),
        investmentId: investmentId,
        name: '',
        description: '',
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
        status: 'active',
        rentalAmount: 0,
        profitSharing: defaultProfitSharing,
        tenantInfo: {
            name: '',
            contact: '',
            phone: '',
            email: ''
        },
        rentalPayments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    useEffect(() => {
        if (leaseItem) {
            setFormData({
                ...leaseItem,
                profitSharing: leaseItem.profitSharing || defaultProfitSharing
            });
        }
    }, [leaseItem]);

    const handleFieldChange = (field: keyof LeaseItem, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleProfitSharingChange = (field: keyof ProfitSharing, value: any) => {
        setFormData(prev => ({
            ...prev,
            profitSharing: {
                ...defaultProfitSharing,
                ...(prev.profitSharing || {}),
                [field]: value
            }
        }));
    };

    const handleTenantInfoChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            tenantInfo: {
                ...prev.tenantInfo,
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            const leaseItemData: LeaseItem = {
                ...formData,
                investmentId: investmentId,
                id: formData.id || crypto.randomUUID(),
                createdAt: formData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rentalPayments: formData.rentalPayments || [],
                profitSharing: formData.profitSharing || defaultProfitSharing
            };

            await onSave(leaseItemData);
            onClose();
        } catch (error) {
            console.error('提交租賃項目時發生錯誤:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {leaseItem ? '編輯租賃項目' : '新增租賃項目'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="租賃項目名稱"
                            value={formData.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
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
                            rows={3}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="開始日期"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleFieldChange('startDate', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="結束日期"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleFieldChange('endDate', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="租金金額"
                            type="number"
                            value={formData.rentalAmount}
                            onChange={(e) => handleFieldChange('rentalAmount', parseFloat(e.target.value))}
                            InputProps={{
                                inputProps: { min: 0 }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            分潤設定
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>分潤類型</InputLabel>
                            <Select
                                value={formData.profitSharing?.type || defaultProfitSharing.type}
                                onChange={(e) => handleProfitSharingChange('type', e.target.value)}
                                label="分潤類型"
                            >
                                <MenuItem value="monthly_fixed">每月固定金額</MenuItem>
                                <MenuItem value="yearly_fixed">每年固定金額</MenuItem>
                                <MenuItem value="percentage">營收百分比</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="分潤值"
                            type="number"
                            value={formData.profitSharing?.value || defaultProfitSharing.value}
                            onChange={(e) => handleProfitSharingChange('value', parseFloat(e.target.value))}
                            InputProps={{
                                inputProps: { min: 0 }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="最小金額"
                            type="number"
                            value={formData.profitSharing?.minimumAmount || defaultProfitSharing.minimumAmount}
                            onChange={(e) => handleProfitSharingChange('minimumAmount', parseFloat(e.target.value))}
                            InputProps={{
                                inputProps: { min: 0 }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="最大金額"
                            type="number"
                            value={formData.profitSharing?.maximumAmount || defaultProfitSharing.maximumAmount}
                            onChange={(e) => handleProfitSharingChange('maximumAmount', parseFloat(e.target.value))}
                            InputProps={{
                                inputProps: { min: 0 }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            承租人資訊
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="承租人姓名"
                            value={formData.tenantInfo.name}
                            onChange={(e) => handleTenantInfoChange('name', e.target.value)}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="聯絡人"
                            value={formData.tenantInfo.contact}
                            onChange={(e) => handleTenantInfoChange('contact', e.target.value)}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="電話"
                            value={formData.tenantInfo.phone}
                            onChange={(e) => handleTenantInfoChange('phone', e.target.value)}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="電子郵件"
                            type="email"
                            value={formData.tenantInfo.email}
                            onChange={(e) => handleTenantInfoChange('email', e.target.value)}
                            required
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    保存
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LeaseItemDialog;
