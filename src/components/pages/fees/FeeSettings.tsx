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
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { ArrowUpward, ArrowDownward, DragIndicator } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ApiService } from '../../../services/api.service';

interface FeeSettingType {
    id: number;
    memberType: string;
    amount: number;
    period: string;
    description: string;
    order: number;
    createdAt?: string;
    updatedAt?: string;
}

const MEMBER_TYPE_OPTIONS = [
    '一般會員',
    '商務會員',
    '永久會員'
];

const FeeSettings: React.FC = () => {
    const [feeSettings, setFeeSettings] = useState<FeeSettingType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [editingFee, setEditingFee] = useState<FeeSettingType | null>(null);
    const [saving, setSaving] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [newFee, setNewFee] = useState<Partial<FeeSettingType>>({});
    const [adding, setAdding] = useState(false);

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

    const handleAddOpen = () => {
        setNewFee({ memberType: '', amount: 0, period: '', description: '' });
        setAddOpen(true);
    };
    const handleAddClose = () => {
        setAddOpen(false);
        setNewFee({});
        setError(null);
    };
    const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewFee({
            ...newFee,
            [e.target.name]: e.target.name === 'amount' ? Number(e.target.value) : e.target.value
        });
    };
    const handleAddSave = async () => {
        if (!newFee.memberType || !newFee.amount || !newFee.period) {
            setError('會員類型、金額、期間為必填');
            return;
        }
        setAdding(true);
        setError(null);
        try {
            const maxOrder = feeSettings.length > 0 ? Math.max(...feeSettings.map(f => f.order ?? 0)) : 0;
            const created = await ApiService.createFeeSetting({
                memberType: newFee.memberType!,
                amount: newFee.amount!,
                period: newFee.period!,
                description: newFee.description,
                order: maxOrder + 1
            });
            setFeeSettings([...feeSettings, created]);
            handleAddClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : '新增失敗');
        } finally {
            setAdding(false);
        }
    };

    // 拖曳排序處理
    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const newList = Array.from(feeSettings);
        const [removed] = newList.splice(result.source.index, 1);
        newList.splice(result.destination.index, 0, removed);
        // 重新計算 order
        const orders = newList.map((item, idx) => ({ id: item.id, order: idx }));
        setFeeSettings(newList);
        try {
            await ApiService.patchFeeSettingsOrder(orders);
        } catch (err) {
            setError('排序更新失敗');
        }
    };

    // 上下箭頭排序
    const moveRow = async (index: number, direction: 'up' | 'down') => {
        const newList = Array.from(feeSettings);
        if (direction === 'up' && index > 0) {
            [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
        } else if (direction === 'down' && index < newList.length - 1) {
            [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
        } else {
            return;
        }
        // 重新計算 order
        const orders = newList.map((item, idx) => ({ id: item.id, order: idx }));
        setFeeSettings(newList);
        try {
            await ApiService.patchFeeSettingsOrder(orders);
        } catch (err) {
            setError('排序更新失敗');
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
                會費標準設定
            </Typography>
            <Button variant="contained" sx={{ mb: 2 }} onClick={handleAddOpen}>
                新增會費標準
            </Button>

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
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="feeSettingsTable">
                        {(provided) => (
                            <TableContainer component={Paper} ref={provided.innerRef} {...provided.droppableProps}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell>會員類型</TableCell>
                                            <TableCell align="right">金額</TableCell>
                                            <TableCell>期間</TableCell>
                                            <TableCell>說明</TableCell>
                                            <TableCell>操作</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {feeSettings.map((fee, idx) => (
                                            <Draggable key={fee.id} draggableId={fee.id.toString()} index={idx}>
                                                {(provided, snapshot) => (
                                                    <TableRow
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            background: snapshot.isDragging ? '#f0f0f0' : undefined
                                                        }}
                                                    >
                                                        <TableCell {...provided.dragHandleProps}>
                                                            <DragIndicator style={{ cursor: 'grab' }} />
                                                        </TableCell>
                                                        <TableCell>{fee.memberType}</TableCell>
                                                        <TableCell align="right">{fee.amount.toLocaleString()}</TableCell>
                                                        <TableCell>{fee.period}</TableCell>
                                                        <TableCell>{fee.description}</TableCell>
                                                        <TableCell>
                                                            <IconButton onClick={() => moveRow(idx, 'up')} disabled={idx === 0}>
                                                                <ArrowUpward fontSize="small" />
                                                            </IconButton>
                                                            <IconButton onClick={() => moveRow(idx, 'down')} disabled={idx === feeSettings.length - 1}>
                                                                <ArrowDownward fontSize="small" />
                                                            </IconButton>
                                                            <IconButton onClick={() => handleEditClick(fee)}>
                                                                <EditIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>編輯會費標準</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth margin="dense" disabled>
                            <InputLabel>會員類型</InputLabel>
                            <Select
                                name="memberType"
                                value={editingFee?.memberType || ''}
                                label="會員類型"
                                onChange={handleChange}
                            >
                                {MEMBER_TYPE_OPTIONS.map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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

            <Dialog open={addOpen} onClose={handleAddClose}>
                <DialogTitle>新增會費標準</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>會員類型</InputLabel>
                            <Select
                                name="memberType"
                                value={newFee.memberType || ''}
                                label="會員類型"
                                onChange={handleAddChange}
                            >
                                {MEMBER_TYPE_OPTIONS.map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            margin="dense"
                            label="金額"
                            name="amount"
                            type="number"
                            value={newFee.amount || ''}
                            onChange={handleAddChange}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="期間"
                            name="period"
                            value={newFee.period || ''}
                            onChange={handleAddChange}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="說明"
                            name="description"
                            value={newFee.description || ''}
                            onChange={handleAddChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddClose} disabled={adding}>取消</Button>
                    <Button
                        onClick={handleAddSave}
                        variant="contained"
                        disabled={adding}
                        startIcon={adding ? <CircularProgress size={20} /> : null}
                    >
                        {adding ? '新增中...' : '新增'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FeeSettings; 