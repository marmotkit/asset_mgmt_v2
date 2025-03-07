import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { Investment } from '../../../types/investment';
import { RentalStandard } from '../../../types/rental';
import { ApiService } from '../../../services';
import { formatCurrency, formatDate } from '../../../utils/format';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';

interface RentalStandardTabProps {
    investments: Investment[];
}

const RentalStandardTab: React.FC<RentalStandardTabProps> = ({ investments }) => {
    const [rentalStandards, setRentalStandards] = useState<RentalStandard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStandard, setSelectedStandard] = useState<RentalStandard | null>(null);
    const [formData, setFormData] = useState<Partial<RentalStandard>>({
        investmentId: '',
        monthlyRent: 0,
        startDate: '',
        endDate: '',
        renterName: '',
        renterTaxId: '',
        note: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [investmentsData, standardsData] = await Promise.all([
                ApiService.getInvestments(),
                ApiService.getRentalStandards(),
            ]);
            setRentalStandards(standardsData);
        } catch (err) {
            setError('載入資料失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStandard = () => {
        setSelectedStandard(null);
        setFormData({
            investmentId: '',
            monthlyRent: 0,
            startDate: '',
            endDate: '',
            renterName: '',
            renterTaxId: '',
            note: '',
        });
        setDialogOpen(true);
    };

    const handleEditStandard = (standard: RentalStandard) => {
        setSelectedStandard(standard);
        setFormData({
            investmentId: standard.investmentId,
            monthlyRent: standard.monthlyRent,
            startDate: standard.startDate,
            endDate: standard.endDate || '',
            renterName: standard.renterName || '',
            renterTaxId: standard.renterTaxId || '',
            note: standard.note || '',
        });
        setDialogOpen(true);
    };

    const handleDeleteStandard = async (id: string) => {
        if (!window.confirm('確定要刪除此租賃標準？')) return;

        setLoading(true);
        try {
            await ApiService.deleteRentalStandard(id);
            await loadData();
        } catch (err) {
            setError('刪除租賃標準失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.investmentId || !formData.monthlyRent || !formData.startDate) {
            setError('請填寫必要欄位');
            return;
        }

        setLoading(true);
        try {
            if (selectedStandard) {
                await ApiService.updateRentalStandard(selectedStandard.id, formData);
            } else {
                await ApiService.createRentalStandard(formData);
            }
            await loadData();
            setDialogOpen(false);
        } catch (err) {
            setError('儲存租賃標準失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof typeof formData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorAlert message={error} />;

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">租賃標準設定</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddStandard}
                >
                    新增租賃標準
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>投資項目</TableCell>
                            <TableCell align="right">月租金</TableCell>
                            <TableCell>生效日期</TableCell>
                            <TableCell>結束日期</TableCell>
                            <TableCell>承租人</TableCell>
                            <TableCell>備註</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rentalStandards.map((standard) => {
                            const investment = investments.find(
                                (inv) => inv.id === standard.investmentId
                            );
                            return (
                                <TableRow key={standard.id}>
                                    <TableCell>{investment?.name || '未知項目'}</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(standard.monthlyRent)}
                                    </TableCell>
                                    <TableCell>{formatDate(standard.startDate)}</TableCell>
                                    <TableCell>
                                        {standard.endDate ? formatDate(standard.endDate) : '-'}
                                    </TableCell>
                                    <TableCell>{standard.renterName}</TableCell>
                                    <TableCell>{standard.note || '-'}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditStandard(standard)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteStandard(standard.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {rentalStandards.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    尚無租賃標準資料
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedStandard ? '編輯租賃標準' : '新增租賃標準'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="投資項目"
                                value={formData.investmentId}
                                onChange={handleInputChange('investmentId')}
                                required
                            >
                                {investments.map((investment) => (
                                    <MenuItem key={investment.id} value={investment.id}>
                                        {investment.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="月租金"
                                type="number"
                                value={formData.monthlyRent}
                                onChange={handleInputChange('monthlyRent')}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="生效日期"
                                type="date"
                                value={formData.startDate}
                                onChange={handleInputChange('startDate')}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="結束日期"
                                type="date"
                                value={formData.endDate}
                                onChange={handleInputChange('endDate')}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="承租人姓名"
                                value={formData.renterName}
                                onChange={handleInputChange('renterName')}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="統一編號"
                                value={formData.renterTaxId}
                                onChange={handleInputChange('renterTaxId')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="備註"
                                multiline
                                rows={3}
                                value={formData.note}
                                onChange={handleInputChange('note')}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>取消</Button>
                    <Button onClick={handleSave} variant="contained">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RentalStandardTab; 