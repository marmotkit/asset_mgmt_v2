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
import { ProfitSharingStandard, ProfitSharingType } from '../../../types/rental';
import { ApiService } from '../../../services/api.service';
import { formatCurrency, formatDate } from '../../../utils/format';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorAlert from '../../common/ErrorAlert';

interface ProfitSharingStandardTabProps {
    investments: Investment[];
}

const ProfitSharingStandardTab: React.FC<ProfitSharingStandardTabProps> = ({ investments }) => {
    const [profitSharingStandards, setProfitSharingStandards] = useState<ProfitSharingStandard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStandard, setSelectedStandard] = useState<ProfitSharingStandard | null>(null);
    const [formData, setFormData] = useState<Partial<ProfitSharingStandard>>({
        investmentId: '',
        type: ProfitSharingType.PERCENTAGE,
        value: 0,
        startDate: '',
        endDate: '',
        note: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const standardsData = await ApiService.getProfitSharingStandards();
            setProfitSharingStandards(standardsData);
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
            type: ProfitSharingType.PERCENTAGE,
            value: 0,
            startDate: '',
            endDate: '',
            note: '',
        });
        setDialogOpen(true);
    };

    const handleEditStandard = (standard: ProfitSharingStandard) => {
        setSelectedStandard(standard);
        setFormData({
            investmentId: standard.investmentId,
            type: standard.type,
            value: standard.value,
            startDate: standard.startDate,
            endDate: standard.endDate || '',
            note: standard.note || '',
        });
        setDialogOpen(true);
    };

    const handleDeleteStandard = async (id: string) => {
        if (!window.confirm('確定要刪除此分潤標準？')) return;

        setLoading(true);
        try {
            await ApiService.deleteProfitSharingStandard(id);
            await loadData();
        } catch (err) {
            setError('刪除分潤標準失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.investmentId || !formData.type || !formData.value || !formData.startDate) {
            setError('請填寫必要欄位');
            return;
        }

        setLoading(true);
        try {
            if (selectedStandard) {
                await ApiService.updateProfitSharingStandard(selectedStandard.id, formData);
            } else {
                await ApiService.createProfitSharingStandard(formData);
            }
            await loadData();
            setDialogOpen(false);
        } catch (err) {
            setError('儲存分潤標準失敗');
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
                <Typography variant="h6">分潤標準設定</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddStandard}
                >
                    新增分潤標準
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>投資項目</TableCell>
                            <TableCell>分潤類型</TableCell>
                            <TableCell align="right">分潤金額/比例</TableCell>
                            <TableCell>生效日期</TableCell>
                            <TableCell>結束日期</TableCell>
                            <TableCell>備註</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {profitSharingStandards.map((standard) => {
                            const investment = investments.find(
                                (inv) => inv.id === standard.investmentId
                            );
                            return (
                                <TableRow key={standard.id}>
                                    <TableCell>{investment?.name || '未知項目'}</TableCell>
                                    <TableCell>
                                        {standard.type === ProfitSharingType.PERCENTAGE ? '百分比' :
                                            standard.type === ProfitSharingType.FIXED_AMOUNT ? '固定金額' : '其他'}
                                    </TableCell>
                                    <TableCell align="right">
                                        {standard.type === ProfitSharingType.PERCENTAGE
                                            ? `${standard.value}%`
                                            : formatCurrency(standard.value)}
                                    </TableCell>
                                    <TableCell>{formatDate(standard.startDate)}</TableCell>
                                    <TableCell>
                                        {standard.endDate ? formatDate(standard.endDate) : '-'}
                                    </TableCell>
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
                        {profitSharingStandards.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    尚無分潤標準資料
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedStandard ? '編輯分潤標準' : '新增分潤標準'}
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
                                select
                                fullWidth
                                label="分潤類型"
                                value={formData.type}
                                onChange={handleInputChange('type')}
                                required
                            >
                                <MenuItem value={ProfitSharingType.PERCENTAGE}>百分比</MenuItem>
                                <MenuItem value={ProfitSharingType.FIXED_AMOUNT}>固定金額</MenuItem>
                                <MenuItem value={ProfitSharingType.OTHER}>其他</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={formData.type === ProfitSharingType.PERCENTAGE ? '分潤比例 (%)' : '分潤金額'}
                                type="number"
                                value={formData.value}
                                onChange={handleInputChange('value')}
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

export default ProfitSharingStandardTab; 