import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import { ApiService } from '../../../services/api.service';

interface EditAnomalyDialogProps {
    open: boolean;
    onClose: () => void;
    anomalyId: string;
    onSuccess: () => void;
}

interface AnomalyData {
    id: string;
    type: string;
    personId?: string;
    personName: string;
    description: string;
    occurrenceDate: string;
    status: string;
    handlingMethod?: string;
}

const anomalyTypes = [
    '合約爭議',
    '系統錯誤',
    '服務品質問題',
    '付款問題',
    '其他'
];

const statusOptions = [
    '待處理',
    '處理中',
    '已解決',
    '已關閉'
];

export const EditAnomalyDialog: React.FC<EditAnomalyDialogProps> = ({
    open,
    onClose,
    anomalyId,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<AnomalyData>({
        id: '',
        type: '',
        personName: '',
        description: '',
        occurrenceDate: '',
        status: '待處理',
        handlingMethod: ''
    });
    const [changeReason, setChangeReason] = useState('');

    useEffect(() => {
        if (open && anomalyId) {
            loadAnomalyData();
        }
    }, [open, anomalyId]);

    const loadAnomalyData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ApiService.getAnomaly(anomalyId);
            setFormData({
                id: data.id,
                type: data.type,
                personId: data.personId,
                personName: data.personName,
                description: data.description,
                occurrenceDate: data.occurrenceDate,
                status: data.status,
                handlingMethod: data.handlingMethod || ''
            });
        } catch (error) {
            setError('載入異常記錄失敗');
            console.error('載入異常記錄失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.type || !formData.personName || !formData.description || !formData.occurrenceDate) {
            setError('請填寫所有必填欄位');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await ApiService.updateAnomaly(anomalyId, {
                ...formData,
                changeReason: changeReason || '系統更新'
            });
            onSuccess();
            onClose();
        } catch (error) {
            setError('更新異常記錄失敗');
            console.error('更新異常記錄失敗:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (!saving) {
            setFormData({
                id: '',
                type: '',
                personName: '',
                description: '',
                occurrenceDate: '',
                status: '待處理',
                handlingMethod: ''
            });
            setChangeReason('');
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>編輯異常記錄</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ mt: 2 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>異常類型 *</InputLabel>
                                <Select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    label="異常類型 *"
                                >
                                    {anomalyTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="相關人員 *"
                                value={formData.personName}
                                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            label="發生日期 *"
                            type="date"
                            value={formData.occurrenceDate}
                            onChange={(e) => setFormData({ ...formData, occurrenceDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>狀態</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                label="狀態"
                            >
                                {statusOptions.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="事件描述 *"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="處理方式"
                            multiline
                            rows={3}
                            value={formData.handlingMethod}
                            onChange={(e) => setFormData({ ...formData, handlingMethod: e.target.value })}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="修改原因"
                            multiline
                            rows={2}
                            value={changeReason}
                            onChange={(e) => setChangeReason(e.target.value)}
                            placeholder="請說明修改的原因（可選）"
                            helperText="記錄修改原因有助於追蹤處理過程"
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={saving}>
                    取消
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={saving || loading}
                    startIcon={saving ? <CircularProgress size={20} /> : null}
                >
                    {saving ? '保存中...' : '保存'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 