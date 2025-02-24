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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Investment, InvestmentType, MovableInvestment, ImmovableInvestment, ContractFile } from '../../../types/investment';
import { Company } from '../../../types/company';
import ApiService from '../../../services/api.service';
import ContractUpload from './ContractUpload';

interface InvestmentDetailDialogProps {
    open: boolean;
    onClose: () => void;
    investmentData: Investment | null;
    investmentType: InvestmentType;
    onSave: (data: Partial<Investment>) => Promise<void>;
}

const InvestmentDetailDialog: React.FC<InvestmentDetailDialogProps> = ({
    open,
    onClose,
    investmentData,
    investmentType,
    onSave,
}) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [formData, setFormData] = useState<Partial<MovableInvestment | ImmovableInvestment>>({
        type: investmentType,
        status: 'pending',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        if (!validateForm()) return;

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('儲存失敗:', error);
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

    const getTypedFormData = () => {
        return investmentType === 'movable'
            ? formData as Partial<MovableInvestment>
            : formData as Partial<ImmovableInvestment>;
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
                uploadDate: new Date(),
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {investmentData ? '編輯投資項目' : '新增投資項目'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>選擇公司</InputLabel>
                            <Select
                                value={formData.companyId || ''}
                                onChange={(e) => handleChange('companyId', e.target.value)}
                                error={!!errors.companyId}
                            >
                                {companies.map((company) => (
                                    <MenuItem key={company.id} value={company.id}>
                                        {company.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
                                    value={(getTypedFormData() as Partial<MovableInvestment>).purchaseDate || null}
                                    onChange={(date) => handleChange('purchaseDate', date)}
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
                            value={formData.startDate || null}
                            onChange={(date) => handleChange('startDate', date)}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="結束日期"
                            value={formData.endDate || null}
                            onChange={(date) => handleChange('endDate', date)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth>
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

export default InvestmentDetailDialog; 