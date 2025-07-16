import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardActions,
    Alert,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip
} from '@mui/material';
import {
    Sync as SyncIcon,
    AccountBalance as AccountBalanceIcon,
    Receipt as ReceiptIcon,
    Payment as PaymentIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { accountingIntegrationService } from '../../../../services/accountingIntegration.service';

interface SyncResult {
    feeReceivables: number;
    rentalReceivables: number;
    profitPayables: number;
}

const AccountingIntegrationTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [syncResults, setSyncResults] = useState<SyncResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // 執行完整同步
    const handleFullSync = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const results = await accountingIntegrationService.syncAllAccountingData();
            setSyncResults({
                feeReceivables: results.feeReceivables.length,
                rentalReceivables: results.rentalReceivables.length,
                profitPayables: results.profitPayables.length
            });
            setSuccess('會計資料同步完成！');
        } catch (err) {
            setError('同步失敗，請檢查系統狀態');
            console.error('同步失敗:', err);
        } finally {
            setLoading(false);
        }
    };

    // 執行會費同步
    const handleFeeSync = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const results = await accountingIntegrationService.syncFeeReceivables();
            setSyncResults(prev => ({
                ...prev,
                feeReceivables: results.length
            }));
            setSuccess(`會費應收帳款同步完成！共同步 ${results.length} 筆資料`);
        } catch (err) {
            setError('會費同步失敗');
            console.error('會費同步失敗:', err);
        } finally {
            setLoading(false);
        }
    };

    // 執行租金同步
    const handleRentalSync = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const results = await accountingIntegrationService.syncRentalReceivables();
            setSyncResults(prev => ({
                ...prev,
                rentalReceivables: results.length
            }));
            setSuccess(`租金應收帳款同步完成！共同步 ${results.length} 筆資料`);
        } catch (err) {
            setError('租金同步失敗');
            console.error('租金同步失敗:', err);
        } finally {
            setLoading(false);
        }
    };

    // 執行分潤同步
    const handleProfitSync = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const results = await accountingIntegrationService.syncMemberProfitPayables();
            setSyncResults(prev => ({
                ...prev,
                profitPayables: results.length
            }));
            setSuccess(`會員分潤應付帳款同步完成！共同步 ${results.length} 筆資料`);
        } catch (err) {
            setError('分潤同步失敗');
            console.error('分潤同步失敗:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                會計資料整合管理
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    此功能用於同步各模組的會計資料，確保會計系統與其他模組的資料一致性。
                    建議在執行月結前先執行同步作業。
                </Typography>
            </Alert>

            {/* 同步結果顯示 */}
            {syncResults && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        最近同步結果
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Chip
                                icon={<ReceiptIcon />}
                                label={`會費應收帳款: ${syncResults.feeReceivables} 筆`}
                                color="primary"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Chip
                                icon={<PaymentIcon />}
                                label={`租金應收帳款: ${syncResults.rentalReceivables} 筆`}
                                color="secondary"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Chip
                                icon={<AccountBalanceIcon />}
                                label={`分潤應付帳款: ${syncResults.profitPayables} 筆`}
                                color="success"
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* 錯誤和成功訊息 */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {/* 同步功能卡片 */}
            <Grid container spacing={3}>
                {/* 完整同步 */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                完整資料同步
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                同步所有模組的會計資料，包括會費、租金和分潤項目
                            </Typography>
                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="會費管理 → 應收帳款" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="租金收款 → 應收帳款" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <CheckCircleIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary="會員分潤 → 應付帳款" />
                                </ListItem>
                            </List>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={20} /> : <SyncIcon />}
                                onClick={handleFullSync}
                                disabled={loading}
                                fullWidth
                            >
                                {loading ? '同步中...' : '執行完整同步'}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                {/* 個別同步選項 */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                個別模組同步
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                選擇特定模組進行同步
                            </Typography>
                        </CardContent>
                        <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <Button
                                variant="outlined"
                                startIcon={loading ? <CircularProgress size={20} /> : <ReceiptIcon />}
                                onClick={handleFeeSync}
                                disabled={loading}
                                sx={{ mb: 1 }}
                            >
                                {loading ? '同步中...' : '同步會費應收帳款'}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
                                onClick={handleRentalSync}
                                disabled={loading}
                                sx={{ mb: 1 }}
                            >
                                {loading ? '同步中...' : '同步租金應收帳款'}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={loading ? <CircularProgress size={20} /> : <AccountBalanceIcon />}
                                onClick={handleProfitSync}
                                disabled={loading}
                            >
                                {loading ? '同步中...' : '同步分潤應付帳款'}
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* 說明文件 */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    程式邏輯說明
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <InfoIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="日記帳"
                            secondary="由財政者自行輸入，月結時系統自動計算收支"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <InfoIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="應收帳款"
                            secondary="1) 手動新增 2) 會費管理待收帶入 3) 租金收款待收帶入"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <InfoIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="應付帳款"
                            secondary="1) 手動新增 2) 會員分潤待付帶入"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <InfoIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="月結功能"
                            secondary="結算日記帳、應收帳款、應付帳款"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <InfoIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="財務報表"
                            secondary="依據所有項目結算"
                        />
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
};

export default AccountingIntegrationTab; 