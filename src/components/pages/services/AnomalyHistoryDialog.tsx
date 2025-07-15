import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip
} from '@mui/material';
import { ApiService } from '../../../services/api.service';

interface AnomalyHistoryDialogProps {
    open: boolean;
    onClose: () => void;
    anomalyId: string;
}

interface ChangeRecord {
    id: string;
    changedBy: string;
    changedAt: string;
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    changeReason: string | null;
}

const fieldNameMap: { [key: string]: string } = {
    type: '異常類型',
    person_id: '相關人員ID',
    person_name: '相關人員',
    description: '事件描述',
    occurrence_date: '發生日期',
    status: '狀態',
    handling_method: '處理方式'
};

export const AnomalyHistoryDialog: React.FC<AnomalyHistoryDialogProps> = ({
    open,
    onClose,
    anomalyId
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [changes, setChanges] = useState<ChangeRecord[]>([]);

    useEffect(() => {
        if (open && anomalyId) {
            loadChangeHistory();
        }
    }, [open, anomalyId]);

    const loadChangeHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ApiService.getAnomalyChanges(anomalyId);
            setChanges(data);
        } catch (error) {
            setError('載入修改歷史失敗');
            console.error('載入修改歷史失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-TW');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case '待處理':
                return 'warning';
            case '處理中':
                return 'info';
            case '已解決':
                return 'success';
            case '已關閉':
                return 'default';
            default:
                return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>修改歷史記錄</DialogTitle>
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

                        {changes.length === 0 ? (
                            <Typography variant="body1" color="text.secondary" textAlign="center" py={3}>
                                暫無修改記錄
                            </Typography>
                        ) : (
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>修改時間</TableCell>
                                            <TableCell>修改人員</TableCell>
                                            <TableCell>修改欄位</TableCell>
                                            <TableCell>原值</TableCell>
                                            <TableCell>新值</TableCell>
                                            <TableCell>修改原因</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {changes.map((change) => (
                                            <TableRow key={change.id}>
                                                <TableCell>
                                                    {formatDate(change.changedAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {change.changedBy}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {fieldNameMap[change.fieldName] || change.fieldName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {change.fieldName === 'status' ? (
                                                        <Chip
                                                            label={change.oldValue || '無'}
                                                            size="small"
                                                            color={getStatusColor(change.oldValue || '') as any}
                                                            variant="outlined"
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {change.oldValue || '無'}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {change.fieldName === 'status' ? (
                                                        <Chip
                                                            label={change.newValue || '無'}
                                                            size="small"
                                                            color={getStatusColor(change.newValue || '') as any}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {change.newValue || '無'}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {change.changeReason || '未說明'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    關閉
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 