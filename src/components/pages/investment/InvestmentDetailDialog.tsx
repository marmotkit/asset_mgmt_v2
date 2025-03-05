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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Investment, InvestmentType, ContractFile, MovableInvestment, ImmovableInvestment } from '../../../types/investment';
import { Company } from '../../../types/company';
import ApiService from '../../../services/api.service';
import ContractUpload from './ContractUpload';
import dayjs from 'dayjs';

interface InvestmentDetailDialogProps {
    open: boolean;
    onClose: () => void;
    investmentType: InvestmentType;
    onSave: (data: Partial<Investment>) => Promise<void>;
    investment?: Investment;
}

const InvestmentDetailDialog: React.FC<InvestmentDetailDialogProps> = ({
    open,
    onClose,
    investmentType,
    onSave,
    investment
}) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [formData, setFormData] = useState<Partial<MovableInvestment | ImmovableInvestment>>(
        investmentType === 'movable' 
        ? {
            type: 'movable' as const,
            status: 'pending',
            name: '',
            description: '',
            companyId: '',
            amount: 0,
            startDate: dayjs().format('YYYY-MM-DD'),
            monthlyRental: 0,
            rentalPayments: [],
            assetType: '',
            serialNumber: '',
            manufacturer: '',
            purchaseDate: dayjs().format('YYYY-MM-DD')
        } 
        : {
            type: 'immovable' as const,
            status: 'pending',
            name: '',
            description: '',
            companyId: '',
            amount: 0,
            startDate: dayjs().format('YYYY-MM-DD'),
            monthlyRental: 0,
            rentalPayments: [],
            location: '',
            area: 0,
            propertyType: ''
        }
    );
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (investment) {
            if (investment.type === 'movable') {
                setFormData(investment as MovableInvestment);
            } else {
                setFormData(investment as ImmovableInvestment);
            }
        }
    }, [investment]);

    const loadCompanies = async () => {
        try {
            const data = await ApiService.getCompanies();
            setCompanies(data);
        } catch (error) {
            console.error('載入公司資料失敗:', error);
        }
    };

    const handleFieldChange = (fieldName: string, value: any) => {
        console.log(`Updating ${fieldName} with value:`, value); 
        setFormData(prev => {
            const newData = {
                ...prev,
                [fieldName]: value
            };
            console.log('New form data:', newData); 
            return newData;
        });
    };

    const handleUploadContract = async (file: File) => {
        try {
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

            handleFieldChange('contract', mockContract);
        } catch (error) {
            console.error('上傳合約失敗:', error);
            throw error;
        }
    };

    const handleDeleteContract = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            handleFieldChange('contract', undefined);
        } catch (error) {
            console.error('刪除合約失敗:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('儲存失敗:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePurchaseDateChange = (value: any) => {
        console.log('Purchase Date changed:', value);
        if (value) {
            const formattedDate = dayjs(value).format('YYYY-MM-DD');
            console.log('Formatted purchase date:', formattedDate);
            handleFieldChange('purchaseDate', formattedDate);
        }
    };

    const handleStartDateChange = (value: any) => {
        console.log('Start Date changed:', value);
        if (value) {
            const formattedDate = dayjs(value).format('YYYY-MM-DD');
            console.log('Formatted start date:', formattedDate);
            handleFieldChange('startDate', formattedDate);
        }
    };

    const handleEndDateChange = (value: any) => {
        console.log('End Date changed:', value);
        if (value) {
            const formattedDate = dayjs(value).format('YYYY-MM-DD');
            console.log('Formatted end date:', formattedDate);
            handleFieldChange('endDate', formattedDate);
        }
    };

    // 日期選擇器的值轉換
    const getDatePickerValue = (dateString?: string) => {
        return dateString ? dayjs(dateString) : null;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{investmentType === 'movable' ? '新增動產投資項目' : '新增不動產投資項目'}</DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>選擇公司</InputLabel>
                                <Select
                                    value={formData.companyId || ''}
                                    onChange={(e) => handleFieldChange('companyId', e.target.value)}
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
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="項目名稱"
                                value={formData.name || ''}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="投資金額"
                                type="number"
                                value={formData.amount || ''}
                                onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value))}
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
                                onChange={(e) => handleFieldChange('description', e.target.value)}
                                required
                            />
                        </Grid>

                        {investmentType === 'movable' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="動產類型"
                                        value={(formData as Partial<MovableInvestment>)?.assetType || ''}
                                        onChange={(e) => handleFieldChange('assetType', e.target.value)}
                                        required={investmentType === 'movable'}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="序號"
                                        value={(formData as Partial<MovableInvestment>)?.serialNumber || ''}
                                        onChange={(e) => handleFieldChange('serialNumber', e.target.value)}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="製造商"
                                        value={(formData as Partial<MovableInvestment>)?.manufacturer || ''}
                                        onChange={(e) => handleFieldChange('manufacturer', e.target.value)}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <DatePicker
                                        label="購入日期"
                                        value={getDatePickerValue((formData as Partial<MovableInvestment>)?.purchaseDate)}
                                        onChange={handlePurchaseDateChange}
                                        format="YYYY-MM-DD"
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                required: investmentType === 'movable'
                                            }
                                        }}
                                    />
                                </Grid>
                            </>
                        )}

                        {investmentType === 'immovable' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="地點"
                                        value={(formData as Partial<ImmovableInvestment>)?.location || ''}
                                        onChange={(e) => handleFieldChange('location', e.target.value)}
                                        required={investmentType === 'immovable'}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="面積"
                                        type="number"
                                        value={(formData as Partial<ImmovableInvestment>)?.area || ''}
                                        onChange={(e) => handleFieldChange('area', parseFloat(e.target.value))}
                                        required={investmentType === 'immovable'}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="物業類型"
                                        value={(formData as Partial<ImmovableInvestment>)?.propertyType || ''}
                                        onChange={(e) => handleFieldChange('propertyType', e.target.value)}
                                        required={investmentType === 'immovable'}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="開始日期"
                                value={getDatePickerValue(formData.startDate)}
                                onChange={handleStartDateChange}
                                format="YYYY-MM-DD"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="結束日期"
                                value={getDatePickerValue(formData.endDate)}
                                onChange={handleEndDateChange}
                                format="YYYY-MM-DD"
                                slotProps={{
                                    textField: {
                                        fullWidth: true
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>狀態</InputLabel>
                                <Select
                                    value={formData.status || 'pending'}
                                    onChange={(e) => handleFieldChange('status', e.target.value)}
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
                                onChange={(e) => handleFieldChange('notes', e.target.value)}
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
                </LocalizationProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
                    {submitting ? '儲存中...' : '儲存'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InvestmentDetailDialog; 