import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Button,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: '#1976d2',
                width: '100%',
            }}
        >
            <Toolbar sx={{ pr: 3 }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    資產管理系統
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {user && (
                        <Typography variant="body1">
                            {user.name}
                        </Typography>
                    )}
                    <Button
                        color="inherit"
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                    >
                        登出
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 