import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Fab,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    Palette as PaletteIcon,
    Analytics as AnalyticsIcon,
    People as PeopleIcon,
    Business as BusinessIcon,
    AccountBalance as InvestmentIcon,
    Support as ServiceIcon,
    Payment as PaymentIcon,
    Dashboard as DashboardIcon,
    Notifications as NotificationIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface SystemInfoData {
    title: string;
    description: string;
    features: string[];
    highlights: Array<{
        icon: React.ReactNode;
        title: string;
        description: string;
    }>;
    modules: Array<{
        icon: React.ReactNode;
        title: string;
        description: string;
        features: string[];
    }>;
}

const SystemInfo: React.FC = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<SystemInfoData | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // 預設系統資訊
    const defaultSystemInfo: SystemInfoData = {
        title: '資產管理系統',
        description: '這是一個專業的資產管理系統，專為組織和企業設計，提供完整的會員管理、財務管理、投資管理和服務管理功能。系統採用現代化設計，操作簡便，功能強大。',
        features: [
            '完整的會員管理體系',
            '專業的財務會計功能',
            '智能的投資管理平台',
            '全面的風險控制機制',
            '現代化的使用者介面',
            '多層級的權限管理',
            '豐富的報表分析功能',
            '即時的通知提醒系統'
        ],
        highlights: [
            {
                icon: <PaletteIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
                title: '現代化介面',
                description: '響應式設計，支援桌面和行動裝置，直觀的操作介面，降低學習成本'
            },
            {
                icon: <SecurityIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
                title: '安全性保障',
                description: '多層級權限控制，完整的操作記錄，資料備份和恢復機制'
            },
            {
                icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#ed6c02' }} />,
                title: '數據分析',
                description: '豐富的統計報表和圖表，多維度的數據分析功能，支援多種格式匯出'
            },
            {
                icon: <SpeedIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
                title: '高效能',
                description: '快速的資料查詢和處理，智能的快取機制，優化的資料庫結構'
            }
        ],
        modules: [
            {
                icon: <PeopleIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
                title: '會員管理',
                description: '完整的會員資訊維護，包含基本資料、聯絡資訊、會員類型',
                features: ['會員資料管理', '會員狀態追蹤', '會員類型設定']
            },
            {
                icon: <PaymentIcon sx={{ fontSize: 30, color: '#2e7d32' }} />,
                title: '會費管理',
                description: '彈性的會費標準配置，支援不同會員類型的差異化收費',
                features: ['會費標準設定', '會費收取記錄', '發票收據管理', '匯出功能']
            },
            {
                icon: <BusinessIcon sx={{ fontSize: 30, color: '#ed6c02' }} />,
                title: '公司管理',
                description: '完整的公司資訊維護，包含基本資料、聯絡資訊',
                features: ['公司資料管理', '公司類型分類', '公司關聯管理']
            },
            {
                icon: <InvestmentIcon sx={{ fontSize: 30, color: '#9c27b0' }} />,
                title: '投資管理',
                description: '完整的投資項目生命週期管理',
                features: ['投資項目管理', '租金管理', '利潤分配', '風險評估']
            },
            {
                icon: <PaymentIcon sx={{ fontSize: 30, color: '#d32f2f' }} />,
                title: '會計管理',
                description: '完整的會計科目體系，支援樹狀結構和分類管理',
                features: ['會計科目管理', '日記帳管理', '財務報表', '月結管理']
            },
            {
                icon: <DashboardIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
                title: '投資看板',
                description: '專業的投資標的展示平台，支援圖片和詳細資訊',
                features: ['投資標的展示', '前台洽詢', '後台管理', '圖片管理']
            },
            {
                icon: <ServiceIcon sx={{ fontSize: 30, color: '#2e7d32' }} />,
                title: '會員服務',
                description: '完整的活動規劃、報名、統計管理',
                features: ['年度活動管理', '活動報名管理', '會員關懷記錄', '風險管理']
            },
            {
                icon: <NotificationIcon sx={{ fontSize: 30, color: '#ed6c02' }} />,
                title: '通知提醒',
                description: '重要事件和狀態變更的即時通知',
                features: ['系統通知', '逾期提醒', '活動通知', '系統公告']
            }
        ]
    };

    const [systemInfo, setSystemInfo] = useState<SystemInfoData>(defaultSystemInfo);

    useEffect(() => {
        // 從 localStorage 讀取自定義系統資訊
        const savedInfo = localStorage.getItem('system_info');
        if (savedInfo) {
            try {
                setSystemInfo(JSON.parse(savedInfo));
            } catch (error) {
                console.error('Failed to parse saved system info:', error);
            }
        }
    }, []);

    const handleEdit = () => {
        setEditData(JSON.parse(JSON.stringify(systemInfo)));
        setOpenDialog(true);
    };

    const handleSave = () => {
        if (editData) {
            setSystemInfo(editData);
            localStorage.setItem('system_info', JSON.stringify(editData));
            setSnackbar({ open: true, message: '系統說明已更新', severity: 'success' });
        }
        setOpenDialog(false);
        setEditData(null);
    };

    const handleCancel = () => {
        setOpenDialog(false);
        setEditData(null);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* 標題區域 */}
            <Box sx={{ mb: 4, textAlign: 'center', position: 'relative' }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2
                }}>
                    {systemInfo.title}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}>
                    {systemInfo.description}
                </Typography>
                {isAdmin && (
                    <Fab
                        color="primary"
                        size="small"
                        onClick={handleEdit}
                        sx={{ position: 'absolute', top: 0, right: 0 }}
                    >
                        <EditIcon />
                    </Fab>
                )}
            </Box>

            {/* 系統特色 */}
            <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        🚀 系統特色
                    </Typography>
                    <Grid container spacing={3}>
                        {systemInfo.highlights.map((highlight, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Box sx={{ textAlign: 'center', p: 2 }}>
                                    {highlight.icon}
                                    <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 'bold' }}>
                                        {highlight.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {highlight.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* 主要功能 */}
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                📋 主要功能模組
            </Typography>
            <Grid container spacing={3}>
                {systemInfo.modules.map((module, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Card sx={{
                            height: '100%',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                            }
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    {module.icon}
                                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                                        {module.title}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {module.description}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {module.features.map((feature, featureIndex) => (
                                        <Chip
                                            key={featureIndex}
                                            label={feature}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.75rem' }}
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* 核心功能列表 */}
            <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        ⭐ 核心功能
                    </Typography>
                    <Grid container spacing={2}>
                        {systemInfo.features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CheckCircleIcon sx={{ mr: 1, color: '#4caf50' }} />
                                    <Typography variant="body1">
                                        {feature}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* 適用對象 */}
            <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        🎯 適用對象
                    </Typography>
                    <Grid container spacing={2}>
                        {[
                            '投資管理公司',
                            '會員制組織',
                            '資產管理機構',
                            '財務管理部門',
                            '企業管理團隊'
                        ].map((target, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <InfoIcon sx={{ mr: 1, color: '#fff' }} />
                                    <Typography variant="body1">
                                        {target}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>

            {/* 編輯對話框 */}
            <Dialog open={openDialog} onClose={handleCancel} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EditIcon sx={{ mr: 1 }} />
                        編輯系統說明
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {editData && (
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                label="系統標題"
                                value={editData.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                sx={{ mb: 3 }}
                            />
                            <TextField
                                fullWidth
                                label="系統描述"
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                multiline
                                rows={3}
                                sx={{ mb: 3 }}
                            />
                            <Typography variant="h6" gutterBottom>
                                核心功能
                            </Typography>
                            <TextField
                                fullWidth
                                label="核心功能（用逗號分隔）"
                                value={editData.features.join(', ')}
                                onChange={(e) => setEditData({
                                    ...editData,
                                    features: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                                })}
                                multiline
                                rows={3}
                                sx={{ mb: 3 }}
                                helperText="請用逗號分隔每個功能項目"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} startIcon={<CancelIcon />}>
                        取消
                    </Button>
                    <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
                        儲存
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 通知 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SystemInfo; 