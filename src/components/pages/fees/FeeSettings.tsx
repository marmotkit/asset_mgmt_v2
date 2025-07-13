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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { ApiService } from '../../../services/api.service';

interface FeeSettingType {
    id: number;
    memberType: string;
    amount: number;
    period: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

const FeeSettings: React.FC = () => {
    const [feeSettings, setFeeSettings] = useState<FeeSettingType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [editingFee, setEditingFee] = useState<FeeSettingType | null>(null);
    const [saving, setSaving] = useState(false);

    // 載入會費標準資料
    useEffect(() => {
        const loadFeeSettings = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await ApiService.getFeeSettings();
                setFeeSettings(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : '載入會費標準失敗');
            } finally {
                setLoading(false);
            }
        };

        loadFeeSettings();
    }, []);

    const handleEditClick = (fee: FeeSettingType) => {
        setEditingFee({ ...fee });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingFee(null);
        setError(null);
    };

    const handleSave = async () => {
        if (!editingFee) return;

        try {
            setSaving(true);
            setError(null);

            const updatedFee = await ApiService.updateFeeSetting(editingFee.id, {
                amount: editingFee.amount,
                period: editingFee.period,
                description: editingFee.description
            });

            setFeeSettings(feeSettings.map(fee =>
                fee.id === editingFee.id ? updatedFee : fee
            ));
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : '更新會費標準失敗');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingFee) {
            setEditingFee({
                ...editingFee,
                [e.target.name]: e.target.name === 'amount' ? Number(e.target.value) : e.target.value
            });
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
                會費標準設定
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>會員類型</TableCell>
                                <TableCell align="right">金額</TableCell>
                                <TableCell>期間</TableCell>
                                <TableCell>說明</TableCell>
                                <TableCell>操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {feeSettings.map((fee) => (
                                <TableRow key={fee.id}>
                                    <TableCell>{fee.memberType}</TableCell>
                                    <TableCell align="right">{fee.amount.toLocaleString()}</TableCell>
                                    <TableCell>{fee.period}</TableCell>
                                    <TableCell>{fee.description}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleEditClick(fee)}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>編輯會費標準</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            margin="dense"
                            label="會員類型"
                            name="memberType"
                            value={editingFee?.memberType || ''}
                            onChange={handleChange}
                            disabled
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="金額"
                            name="amount"
                            type="number"
                            value={editingFee?.amount || ''}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="期間"
                            name="period"
                            value={editingFee?.period || ''}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="說明"
                            name="description"
                            value={editingFee?.description || ''}
                            onChange={handleChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={saving}>取消</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} /> : null}
                    >
                        {saving ? '儲存中...' : '儲存'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FeeSettings; 