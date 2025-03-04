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
    FormControl,
    InputLabel,
    Select,
    InputAdornment,
    Typography,
    FormHelperText,
    Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Investment, InvestmentType, MovableInvestment, ImmovableInvestment, ContractFile, RentalPayment, ProfitSharingType, InvestmentFormData } from '../../../types/investment';
import { Company } from '../../../types/company';
import ApiService from '../../../services/api.service';
import ContractUpload from './ContractUpload';
import RentalPaymentList from './RentalPaymentList';

interface InvestmentDetailDialogProps {
    open: boolean;
    onClose: () => void;
    investmentData: Investment | null;
    investmentType: InvestmentType;
    onSave: (data: Partial<Investment>) => Promise<void>;
    isEditing: boolean;
    onUpdate: (data: Partial<Investment>) => Promise<void>;
    onCreate: (data: Partial<Investment>) => Promise<void>;
}

const InvestmentDetailDialog: React.FC<InvestmentDetailDialogProps> = ({
    open,
    onClose,
    investmentData,
    investmentType,
    onSave,
    isEditing,
    onUpdate,
    onCreate,
}) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [formData, setFormData] = useState<InvestmentFormData>({
        type: investmentType,
        status: 'pending',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (investmentData) {
            setFormData(investmentData);
        } else {
            setFormData({
                type: investmentType,
                status: 'pending',
            });
        }
        setErrors({});
    }, [investmentData, investmentType]);

    const loadCompanies = async () => {
        try {
            const data = await ApiService.getCompanies();
            setCompanies(data);
        } catch (error) {
            console.error('載入公司資料失敗:', error);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.companyId) newErrors.companyId = '請選擇公司';
        if (!formData.name) newErrors.name = '請輸入項目名稱';
        if (!formData.description) newErrors.description = '請輸入項目描述';
        if (!formData.amount) newErrors.amount = '請輸入投資金額';
        if (!formData.startDate) newErrors.startDate = '請選擇開始日期';

        if (investmentType === 'movable') {
            const movableData = formData as Partial<MovableInvestment>;
            if (!movableData.assetType) newErrors.assetType = '請輸入動產類型';
            if (!movableData.purchaseDate) newErrors.purchaseDate = '請選擇購入日期';
        } else {
            const immovableData = formData as Partial<ImmovableInvestment>;
            if (!immovableData.location) newErrors.location = '請輸入位置';
            if (!immovableData.area) newErrors.area = '請輸入面積';
            if (!immovableData.propertyType) newErrors.propertyType = '請輸入不動產類型';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.type || !formData.amount) {
            setError('請填寫必要欄位');
            return;
        }

        try {
            setLoading(true);
            const submitData = {
                ...formData,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
                purchaseDate: formData.purchaseDate || undefined
            };

            if (formData.monthlyRental) {
                const payments = generateRentalPayments(
                    submitData.startDate,
                    submitData.endDate,
                    formData.monthlyRental
                );
                submitData.rentalPayments = payments;
            }

            if (isEditing) {
                await onUpdate(submitData);
            } else {
                await onCreate(submitData);
            }
            onClose();
        } catch (error) {
            console.error('儲存失敗:', error);
            setError('儲存失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                [field]: value
            };
            return investmentType === 'movable'
                ? newData as Partial<MovableInvestment>
                : newData as Partial<ImmovableInvestment>;
        });
    };

    const handleProfitSharingChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData = {
                ...prev,
                profitSharing: {
                    ...prev.profitSharing,
                    [field]: value
                }
            };
            return investmentType === 'movable'
                ? newData as Partial<MovableInvestment>
                : newData as Partial<ImmovableInvestment>;
        });
    };

    const getTypedFormData = () => {
        return formData;
    };

    const handleUploadContract = async (file: File) => {
        try {
            // 這裡應該調用實際的上傳 API
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('investmentId', formData.id || '');

            // 模擬上傳
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockContract: ContractFile = {
                id: Date.now().toString(),
                filename: file.name,
                uploadDate: new Date().toISOString(),
                fileSize: file.size,
                fileType: file.type,
                url: URL.createObjectURL(file),
            };

            handleChange('contract', mockContract);
        } catch (error) {
            console.error('上傳合約失敗:', error);
            throw error;
        }
    };

    const handleDeleteContract = async () => {
        try {
            // 這裡應該調用實際的刪除 API
            await new Promise(resolve => setTimeout(resolve, 500));
            handleChange('contract', undefined);
        } catch (error) {
            console.error('刪除合約失敗:', error);
            throw error;
        }
    };

    const generateRentalPayments = (startDate: string | undefined, endDate: string | undefined, monthlyRental: number) => {
        if (!startDate) return [];

        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());

        const payments: RentalPayment[] = [];
        let currentDate = new Date(start.getFullYear(), start.getMonth(), 1);

        while (currentDate <= end) {
            payments.push({
                id: `payment-${Date.now()}-${currentDate.getTime()}`,
                dueDate: currentDate.toISOString(),
                amount: monthlyRental,
                status: 'pending',
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return payments;
    };

    const handleMonthlyRentalChange = (value: number) => {
        if (formData.startDate) {
            const payments = generateRentalPayments(
                formData.startDate || undefined,
                formData.endDate || undefined,
                value
            );
            handleChange('monthlyRental', value);
            handleChange('rentalPayments', payments);
        }
    };

    const handleDateChange = (field: 'startDate' | 'endDate' | 'purchaseDate') => (date: Date | null) => {
        const isoDate = date ? date.toISOString() : undefined;
        setFormData(prev => ({
            ...prev,
            [field]: isoDate
        }));

        // 如果是開始日期或結束日期變更，且有設定月租金，則重新生成租金收款記錄
        if ((field === 'startDate' || field === 'endDate') && formData.monthlyRental) {
            const payments = generateRentalPayments(
                field === 'startDate' ? isoDate : formData.startDate,
                field === 'endDate' ? isoDate : formData.endDate,
                formData.monthlyRental
            );
            setFormData(prev => ({
                ...prev,
                rentalPayments: payments
            }));
        }
    };

    const handleUpdatePayment = async (updatedPayment: RentalPayment) => {
        const payments = [...(formData.rentalPayments || [])];
        const index = payments.findIndex(p => p.id === updatedPayment.id);
        if (index !== -1) {
            payments[index] = updatedPayment;
            handleChange('rentalPayments', payments);
        }
    };

    // 生成租金收款記錄
    if (formData.monthlyRental) {
        const payments = generateRentalPayments(
            formData.startDate || undefined,
            formData.endDate || undefined,
            formData.monthlyRental
        );
        formData.rentalPayments = payments;
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {isEditing ? '編輯投資項目' : '新增投資項目'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <FormControl
                            fullWidth
                            sx={{
                                '& .MuiInputLabel-root': {
                                    backgroundColor: 'background.paper',
                                    px: 1,
                                },
                            }}
                        >
                            <InputLabel>選擇公司</InputLabel>
                            <Select
                                value={formData.companyId || ''}
                                onChange={(e) => handleChange('companyId', e.target.value)}
                                error={!!errors.companyId}
                            >
                                <MenuItem value="">
                                    <em>請選擇</em>
                                </MenuItem>
                                {companies.map((company) => (
                                    <MenuItem key={company.id} value={company.id}>
                                        {company.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {errors.companyId && (
                            <Typography color="error" variant="caption">
                                {errors.companyId}
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="項目名稱"
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
                            label="投資金額"
                            type="number"
                            value={formData.amount || ''}
                            onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                            error={!!errors.amount}
                            helperText={errors.amount}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="項目描述"
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            error={!!errors.description}
                            helperText={errors.description}
                            required
                        />
                    </Grid>

                    {/* 動產特有欄位 */}
                    {investmentType === 'movable' && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="動產類型"
                                    value={(getTypedFormData() as Partial<MovableInvestment>).assetType || ''}
                                    onChange={(e) => handleChange('assetType', e.target.value)}
                                    error={!!errors.assetType}
                                    helperText={errors.assetType}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="序號"
                                    value={(getTypedFormData() as MovableInvestment).serialNumber || ''}
                                    onChange={(e) => handleChange('serialNumber', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="製造商"
                                    value={(getTypedFormData() as Partial<MovableInvestment>).manufacturer || ''}
                                    onChange={(e) => handleChange('manufacturer', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="購入日期"
                                    value={formData.purchaseDate ? new Date(formData.purchaseDate) : undefined}
                                    onChange={(date) => handleDateChange('purchaseDate')(date)}
                                    slotProps={{
                                        textField: {
                                            error: !!errors.purchaseDate,
                                            helperText: errors.purchaseDate
                                        }
                                    }}
                                />
                            </Grid>
                        </>
                    )}

                    {/* 不動產特有欄位 */}
                    {investmentType === 'immovable' && (
                        <>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="位置"
                                    value={(getTypedFormData() as Partial<ImmovableInvestment>).location || ''}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    error={!!errors.location}
                                    helperText={errors.location}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="面積"
                                    type="number"
                                    value={(getTypedFormData() as Partial<ImmovableInvestment>).area || ''}
                                    onChange={(e) => handleChange('area', parseFloat(e.target.value))}
                                    error={!!errors.area}
                                    helperText={errors.area}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="不動產類型"
                                    value={(getTypedFormData() as Partial<ImmovableInvestment>).propertyType || ''}
                                    onChange={(e) => handleChange('propertyType', e.target.value)}
                                    error={!!errors.propertyType}
                                    helperText={errors.propertyType}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="登記號碼"
                                    value={(getTypedFormData() as Partial<ImmovableInvestment>).registrationNumber || ''}
                                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="開始日期"
                            value={formData.startDate ? new Date(formData.startDate) : undefined}
                            onChange={(date) => handleDateChange('startDate')(date)}
                            slotProps={{
                                textField: {
                                    error: !!errors.startDate,
                                    helperText: errors.startDate
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="結束日期"
                            value={formData.endDate ? new Date(formData.endDate) : undefined}
                            onChange={(date) => handleDateChange('endDate')(date)}
                            slotProps={{
                                textField: {
                                    error: !!errors.endDate,
                                    helperText: errors.endDate
                                }
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl
                            fullWidth
                            sx={{
                                '& .MuiInputLabel-root': {
                                    backgroundColor: 'background.paper',
                                    px: 1,
                                },
                            }}
                        >
                            <InputLabel>狀態</InputLabel>
                            <Select
                                value={formData.status || 'pending'}
                                onChange={(e) => handleChange('status', e.target.value)}
                            >
                                <MenuItem value="pending">審核中</MenuItem>
                                <MenuItem value="active">進行中</MenuItem>
                                <MenuItem value="completed">已完成</MenuItem>
                                <MenuItem value="terminated">已終止</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="備註"
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <ContractUpload
                            contract={formData.contract}
                            onUpload={handleUploadContract}
                            onDelete={handleDeleteContract}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="每月租金"
                            type="number"
                            value={formData.monthlyRental || ''}
                            onChange={(e) => handleMonthlyRentalChange(parseFloat(e.target.value))}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">NT$</InputAdornment>,
                            }}
                        />
                    </Grid>

                    {formData.rentalPayments && formData.rentalPayments.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                                租金收款記錄
                            </Typography>
                            <RentalPaymentList
                                payments={formData.rentalPayments}
                                onUpdatePayment={handleUpdatePayment}
                            />
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>分潤設定</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>分潤類型</InputLabel>
                                    <Select
                                        value={formData.profitSharing?.type || ''}
                                        onChange={(e) => handleProfitSharingChange('type', e.target.value)}
                                    >
                                        <MenuItem value="percentage">百分比</MenuItem>
                                        <MenuItem value="fixed">固定金額</MenuItem>
                                        <MenuItem value="other">其他</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={formData.profitSharing?.type === 'percentage' ? '百分比值' : '金額'}
                                    type="number"
                                    value={formData.profitSharing?.value || ''}
                                    onChange={(e) => handleProfitSharingChange('value', parseFloat(e.target.value))}
                                    InputProps={{
                                        endAdornment: formData.profitSharing?.type === 'percentage' ? '%' : '元'
                                    }}
                                />
                            </Grid>
                            {formData.profitSharing?.type === 'other' && (
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="其他分潤說明"
                                        multiline
                                        rows={2}
                                        value={formData.profitSharing?.description || ''}
                                        onChange={(e) => handleProfitSharingChange('description', e.target.value)}
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="最低分潤金額"
                                    type="number"
                                    value={formData.profitSharing?.minimumAmount || ''}
                                    onChange={(e) => handleProfitSharingChange('minimumAmount', parseFloat(e.target.value))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="最高分潤金額"
                                    type="number"
                                    value={formData.profitSharing?.maximumAmount || ''}
                                    onChange={(e) => handleProfitSharingChange('maximumAmount', parseFloat(e.target.value))}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? '儲存中...' : '儲存'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InvestmentDetailDialog; 