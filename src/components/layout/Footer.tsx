import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                position: 'fixed',
                bottom: 0,
                right: 0,
                left: { sm: 240 },
                height: 48,
                backgroundColor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: 3,
                zIndex: (theme) => theme.zIndex.drawer - 1,
            }}
        >
            <Typography variant="body2" color="text.secondary">
                Copyright © {currentYear} KT.Liang. All rights reserved.
            </Typography>
        </Box>
    );
};

export default Footer; 