import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const MainContent = ({ handleDrawerToggle }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: `240px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            資產管理系統
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          mt: 8,
        }}
      >
        <Routes>
          <Route path="/member" element={<div>會員管理</div>} />
          <Route path="/company" element={<div>公司資訊</div>} />
          <Route path="/investment" element={<div>投資管理</div>} />
          <Route path="/services" element={<div>會員服務</div>} />
          <Route path="/transaction" element={<div>交易支付</div>} />
          <Route path="/notifications" element={<div>通知提醒</div>} />
          <Route path="/security" element={<div>安全隱私</div>} />
          <Route path="/" element={<div>歡迎使用資產管理系統</div>} />
        </Routes>
      </Box>
    </Box>
  );
};

export default MainContent; 