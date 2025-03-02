import React, { useState } from 'react';
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
    Typography
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

interface FeeSettingType {
    id: string;
    memberType: string;
    amount: number;
    period: string;
    description: string;
}

const initialFeeSettings: FeeSettingType[] = [
    {
        id: '1',
        memberType: '一般會員',
        amount: 30000,
        period: '年',
        description: '一般會員年費'
    },
    {
        id: '2',
        memberType: '商務會員',
        amount: 300000,
        period: '年',
        description: '商務會員年費'
    },
    {
        id: '3',
        memberType: '終身會員',
        amount: 3000000,
        period: '5年',
        description: '終身會員5年費用'
    }
];

const FeeSettings: React.FC = () => {
    const [feeSettings, setFeeSettings] = useState<FeeSettingType[]>(initialFeeSettings);
    const [open, setOpen] = useState(false);
    const [editingFee, setEditingFee] = useState<FeeSettingType | null>(null);

    const handleEditClick = (fee: FeeSettingType) => {
        setEditingFee({ ...fee });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingFee(null);
    };

    const handleSave = () => {
        if (editingFee) {
            setFeeSettings(feeSettings.map(fee =>
                fee.id === editingFee.id ? editingFee : fee
            ));
            handleClose();
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
                    <Button onClick={handleClose}>取消</Button>
                    <Button onClick={handleSave} variant="contained">
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FeeSettings; 