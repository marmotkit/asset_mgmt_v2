import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  AccountBalance as InvestmentIcon,
  Support as ServiceIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: '會員管理', icon: <PeopleIcon />, path: '/member/users' },
    { text: '公司資訊', icon: <BusinessIcon />, path: '/member/company' },
    { text: '投資管理', icon: <InvestmentIcon />, path: '/member/investment' },
    { text: '會員服務', icon: <ServiceIcon />, path: '/member/service' },
    { text: '交易支付', icon: <PaymentIcon />, path: '/member/payment' },
    { text: '通知提醒', icon: <NotificationIcon />, path: '/member/notifications' },
    { text: '安全隱私', icon: <SecurityIcon />, path: '/member/security' }
  ];

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar /> {/* 為 AppBar 預留空間 */}
      <Divider />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 