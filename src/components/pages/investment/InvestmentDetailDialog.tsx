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
    Typography,
    SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
    Investment,
    InvestmentType,
    InvestmentStatus,
    InvestmentFormData,
    MovableInvestment,
    ImmovableInvestment
} from '../../../types/investment';
import { User } from '../../../types/user';
import { Company } from '../../../types/company';
import { ApiService } from '../../../services/api.service';

interface InvestmentDetailDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: InvestmentFormData) => Promise<void>;
    investment?: Investment;
}

const InvestmentDetailDialog: React.FC<InvestmentDetailDialogProps> = ({
    open,
    onClose,
    onSave,
    investment
}) => {
    const [formData, setFormData] = useState<InvestmentFormData>(() => ({
        companyId: investment?.companyId || '',
        userId: '',
        type: investment?.type || 'movable',
        name: investment?.name || '',
        description: investment?.description || '',
        amount: investment?.amount || 0,
        startDate: investment?.startDate || dayjs().format('YYYY-MM-DD'),
        endDate: investment?.endDate || '',
        status: investment?.status || 'pending',
        // 動產特有欄位
        assetType: investment?.type === 'movable' ? investment.assetType : '',
        serialNumber: investment?.type === 'movable' ? investment.serialNumber : '',
        manufacturer: investment?.type === 'movable' ? investment.manufacturer : '',
        // 不動產特有欄位
        location: investment?.type === 'immovable' ? investment.location : '',
        area: investment?.type === 'immovable' ? investment.area : 0,
        propertyType: investment?.type === 'immovable' ? investment.propertyType : '',
        registrationNumber: investment?.type === 'immovable' ? investment.registrationNumber : ''
    }));

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        if (investment) {
            setFormData({
                ...investment,
                userId: investment.userId || '',
                // 動產特有欄位
                assetType: investment.type === 'movable' ? investment.assetType : '',
                serialNumber: investment.type === 'movable' ? investment.serialNumber : '',
                manufacturer: investment.type === 'movable' ? investment.manufacturer : '',
                // 不動產特有欄位
                location: investment.type === 'immovable' ? investment.location : '',
                area: investment.type === 'immovable' ? investment.area : 0,
                propertyType: investment.type === 'immovable' ? investment.propertyType : '',
                registrationNumber: investment.type === 'immovable' ? investment.registrationNumber : ''
            });
        } else {
            setFormData({
                type: 'movable',
                name: '',
                description: '',
                amount: 0,
                startDate: dayjs().format('YYYY-MM-DD'),
                status: 'pending',
                companyId: '',
                userId: '',
                // 動產特有欄位
                assetType: '',
                serialNumber: '',
                manufacturer: '',
                // 不動產特有欄位
                location: '',
                area: 0,
                propertyType: '',
                registrationNumber: ''
            });
        }
        setErrors({});
        loadCompanies();
        loadUsers();
    }, [investment]);

    const loadCompanies = async () => {
        try {
            const data = await ApiService.getCompanies();
            setCompanies(data);
        } catch (error) {
            console.error('載入公司資料失敗:', error);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await ApiService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('載入會員資料失敗:', error);
        }
    };

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
        if (!formData.companyId) {
            newErrors.companyId = '請選擇所屬公司';
        }
        if (!formData.userId) {
            newErrors.userId = '請選擇所屬會員';
        }

        // 根據投資類型驗證特定欄位（暫時放寬驗證）
        if (formData.type === 'movable') {
            // 暫時移除動產特有欄位的必填驗證
            // if (!formData.assetType) {
            //     newErrors.assetType = '請輸入資產類型';
            // }
            // if (!formData.serialNumber) {
            //     newErrors.serialNumber = '請輸入序號';
            // }
        } else if (formData.type === 'immovable') {
            // 暫時移除不動產特有欄位的必填驗證
            // if (!formData.location) {
            //     newErrors.location = '請輸入位置';
            // }
            // if (!formData.propertyType) {
            //     newErrors.propertyType = '請輸入物業類型';
            // }
            // if (!formData.registrationNumber) {
            //     newErrors.registrationNumber = '請輸入登記號碼';
            // }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleTextChange = (field: keyof InvestmentFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;
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

    const handleSelectChange = (field: keyof InvestmentFormData) => (
        event: SelectChangeEvent
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleDateChange = (field: 'startDate' | 'endDate') => (value: Dayjs | null) => {
        setFormData(prev => ({
            ...prev,
            [field]: value ? value.format('YYYY-MM-DD') : ''
        }));
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save investment:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {investment ? '編輯投資' : '新增投資'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom>
                            基本資料
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="名稱"
                            value={formData.name}
                            onChange={handleTextChange('name')}
                            error={!!errors.name}
                            helperText={errors.name}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!errors.type}>
                            <InputLabel>類型</InputLabel>
                            <Select
                                value={formData.type}
                                onChange={handleSelectChange('type')}
                                label="類型"
                            >
                                <MenuItem value="movable">動產</MenuItem>
                                <MenuItem value="immovable">不動產</MenuItem>
                            </Select>
                            {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="描述"
                            value={formData.description}
                            onChange={handleTextChange('description')}
                            multiline
                            rows={2}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="投資金額"
                            type="number"
                            value={formData.amount}
                            onChange={handleTextChange('amount')}
                            error={!!errors.amount}
                            helperText={errors.amount}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!errors.status}>
                            <InputLabel>狀態</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={handleSelectChange('status')}
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
                    <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="開始日期"
                                value={dayjs(formData.startDate)}
                                onChange={handleDateChange('startDate')}
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
                    <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="結束日期"
                                value={formData.endDate ? dayjs(formData.endDate) : null}
                                onChange={handleDateChange('endDate')}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    {/* 動產特有欄位 */}
                    {formData.type === 'movable' && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    動產資料
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="資產類型"
                                    value={formData.assetType}
                                    onChange={handleTextChange('assetType')}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="序號"
                                    value={formData.serialNumber}
                                    onChange={handleTextChange('serialNumber')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="製造商"
                                    value={formData.manufacturer}
                                    onChange={handleTextChange('manufacturer')}
                                />
                            </Grid>
                        </>
                    )}

                    {/* 不動產特有欄位 */}
                    {formData.type === 'immovable' && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom>
                                    不動產資料
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="位置"
                                    value={formData.location}
                                    onChange={handleTextChange('location')}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="面積"
                                    type="number"
                                    value={formData.area}
                                    onChange={handleTextChange('area')}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="地號"
                                    value={formData.registrationNumber}
                                    onChange={handleTextChange('registrationNumber')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="用地類型"
                                    value={formData.propertyType}
                                    onChange={handleTextChange('propertyType')}
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.companyId}>
                            <InputLabel>所屬公司</InputLabel>
                            <Select
                                value={formData.companyId || ''}
                                onChange={handleSelectChange('companyId')}
                                label="所屬公司"
                            >
                                <MenuItem value="">無</MenuItem>
                                {companies.map((company) => (
                                    <MenuItem key={company.id} value={company.id}>
                                        {company.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.companyId && <FormHelperText>{errors.companyId}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.userId}>
                            <InputLabel>所屬會員</InputLabel>
                            <Select
                                value={formData.userId || ''}
                                onChange={handleSelectChange('userId')}
                                label="所屬會員"
                            >
                                <MenuItem value="">無</MenuItem>
                                {users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name} ({user.memberNo})
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.userId && <FormHelperText>{errors.userId}</FormHelperText>}
                        </FormControl>
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

export default InvestmentDetailDialog;