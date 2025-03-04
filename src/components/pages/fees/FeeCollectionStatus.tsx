import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    IconButton,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { formatCurrency } from '../../../utils/numberUtils';
import { formatDate } from '../../../utils/dateUtils';

interface FeeCollectionData {
    id: string;
    userId: string;
    userName: string;
    memberType: string;
    amount: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    paymentMethod?: string;
    receiptNumber?: string;
    note?: string;
}

const FeeCollectionStatus: React.FC = () => {
    const [collections, setCollections] = useState<FeeCollectionData[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<FeeCollectionData | null>(null);

    // 從 localStorage 載入資料
    useEffect(() => {
        const savedData = localStorage.getItem('feeCollections');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                console.log('Loading saved data:', parsedData); // 添加日誌
                setCollections(parsedData);
            } catch (error) {
                console.error('Error parsing saved data:', error);
                initializeDefaultData();
            }
        } else {
            initializeDefaultData();
        }
    }, []);

    // 初始化預設資料
    const initializeDefaultData = () => {
        const initialData: FeeCollectionData[] = [
            {
                id: '1',
                userId: 'A001',
                userName: '系統管理員',
                memberType: '一般會員',
                amount: 30000,
                dueDate: '2024-12-31',
                status: 'pending',
                note: '2024年度會費'
            },
            {
                id: '2',
                userId: 'V001',
                userName: '梁坤榮',
                memberType: '商務會員',
                amount: 300000,
                dueDate: '2024-12-31',
                status: 'pending',
                note: '2024年度會費'
            }
        ];
        setCollections(initialData);
        localStorage.setItem('feeCollections', JSON.stringify(initialData));
    };

    // 儲存資料到 localStorage
    const saveToLocalStorage = (data: FeeCollectionData[]) => {
        console.log('Saving data:', data); // 添加日誌
        localStorage.setItem('feeCollections', JSON.stringify(data));
        setCollections(data);
    };

    const handleEdit = (collection: FeeCollectionData) => {
        setEditingId(collection.id);
        setEditData({ ...collection });
    };

    const handleSave = () => {
        if (!editData) return;

        console.log('準備儲存編輯資料:', editData);

        // 更新收款狀況
        const newCollections = collections.map(c =>
            c.id === editingId ? { ...editData } : c
        );

        // 先儲存收款狀況
        try {
            localStorage.setItem('feeCollections', JSON.stringify(newCollections));
            setCollections(newCollections);
            console.log('已更新收款狀況:', newCollections);

            // 同步更新歷史記錄
            const existingHistory = localStorage.getItem('feeHistory');
            let historyData = [];

            try {
                historyData = existingHistory ? JSON.parse(existingHistory) : [];
            } catch (e) {
                console.error('解析歷史記錄失敗:', e);
                historyData = [];
            }

            console.log('現有歷史記錄:', historyData);

            // 建立新的歷史記錄
            const newHistoryEntry = {
                id: `${editData.id}_${Date.now()}`,
                userId: editData.userId,
                userName: editData.userName,
                memberType: editData.memberType,
                amount: editData.amount,
                dueDate: editData.dueDate,
                paymentDate: editData.status === 'paid' ? new Date().toISOString() : null,
                status: editData.status,
                paymentMethod: editData.paymentMethod || '',
                receiptNumber: editData.receiptNumber || '',
                note: editData.note || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('新增歷史記錄:', newHistoryEntry);

            // 添加新的歷史記錄
            historyData.push(newHistoryEntry);
            localStorage.setItem('feeHistory', JSON.stringify(historyData));
            console.log('歷史記錄已更新');

            // 重置編輯狀態
            setEditingId(null);
            setEditData(null);

        } catch (error) {
            console.error('儲存資料時發生錯誤:', error);
            alert('儲存失敗，請重試');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'overdue':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid':
                return '已收款';
            case 'pending':
                return '待收款';
            case 'overdue':
                return '逾期';
            default:
                return status;
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>收款狀況</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>會員編號</TableCell>
                            <TableCell>姓名</TableCell>
                            <TableCell>會員類型</TableCell>
                            <TableCell align="right">金額</TableCell>
                            <TableCell>到期日</TableCell>
                            <TableCell>狀態</TableCell>
                            <TableCell>繳費方式</TableCell>
                            <TableCell>收據號碼</TableCell>
                            <TableCell>備註</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {collections.map((collection) => (
                            <TableRow key={collection.id}>
                                <TableCell>{collection.userId}</TableCell>
                                <TableCell>{collection.userName}</TableCell>
                                <TableCell>{collection.memberType}</TableCell>
                                <TableCell align="right">
                                    {editingId === collection.id ? (
                                        <TextField
                                            type="number"
                                            value={editData?.amount || ''}
                                            onChange={(e) => setEditData(prev => prev ? { ...prev, amount: Number(e.target.value) } : null)}
                                            size="small"
                                            fullWidth
                                        />
                                    ) : (
                                        formatCurrency(collection.amount)
                                    )}
                                </TableCell>
                                <TableCell>{collection.dueDate}</TableCell>
                                <TableCell>
                                    {editingId === collection.id ? (
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={editData?.status || ''}
                                                onChange={(e) => setEditData(prev => prev ? { ...prev, status: e.target.value as 'paid' | 'pending' | 'overdue' } : null)}
                                            >
                                                <MenuItem value="paid">已收款</MenuItem>
                                                <MenuItem value="pending">待收款</MenuItem>
                                                <MenuItem value="overdue">逾期</MenuItem>
                                            </Select>
                                        </FormControl>
                                    ) : (
                                        <Chip
                                            label={getStatusLabel(collection.status)}
                                            color={getStatusColor(collection.status)}
                                            size="small"
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === collection.id ? (
                                        <TextField
                                            value={editData?.paymentMethod || ''}
                                            onChange={(e) => setEditData(prev => prev ? { ...prev, paymentMethod: e.target.value } : null)}
                                            size="small"
                                            fullWidth
                                        />
                                    ) : (
                                        collection.paymentMethod || '-'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === collection.id ? (
                                        <TextField
                                            value={editData?.receiptNumber || ''}
                                            onChange={(e) => setEditData(prev => prev ? { ...prev, receiptNumber: e.target.value } : null)}
                                            size="small"
                                            fullWidth
                                        />
                                    ) : (
                                        collection.receiptNumber || '-'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === collection.id ? (
                                        <TextField
                                            value={editData?.note || ''}
                                            onChange={(e) => setEditData(prev => prev ? { ...prev, note: e.target.value } : null)}
                                            size="small"
                                            fullWidth
                                        />
                                    ) : (
                                        collection.note || '-'
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === collection.id ? (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                onClick={handleSave}
                                                size="small"
                                                color="primary"
                                                tabIndex={0}
                                            >
                                                <SaveIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={handleCancel}
                                                size="small"
                                                color="error"
                                                tabIndex={0}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <IconButton
                                            onClick={() => handleEdit(collection)}
                                            size="small"
                                            tabIndex={0}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default FeeCollectionStatus; 