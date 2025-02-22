import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person,
  Business,
  AccountBalance,
  Support,
  Payment,
  Notifications,
  Security,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: '會員管理', icon: <Person />, path: '/member' },
  { text: '公司資訊', icon: <Business />, path: '/company' },
  { text: '投資管理', icon: <AccountBalance />, path: '/investment' },
  { text: '會員服務', icon: <Support />, path: '/services' },
  { text: '交易支付', icon: <Payment />, path: '/transaction' },
  { text: '通知提醒', icon: <Notifications />, path: '/notifications' },
  { text: '安全隱私', icon: <Security />, path: '/security' },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const drawer = (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" noWrap component="div">
          資產管理系統
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) handleDrawerToggle();
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar; 