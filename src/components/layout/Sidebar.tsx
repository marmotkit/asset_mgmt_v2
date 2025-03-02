import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
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
  Security as SecurityIcon,
  Receipt as FeeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      text: '會員管理',
      icon: <PeopleIcon />,
      path: '/users'
    },
    {
      text: '會費管理',
      icon: <FeeIcon />,
      path: '/fees'
    },
    {
      text: '公司資訊',
      icon: <BusinessIcon />,
      path: '/companies'
    },
    {
      text: '投資管理',
      icon: <InvestmentIcon />,
      path: '/investment'
    },
    {
      text: '會員服務',
      icon: <ServiceIcon />,
      path: '/services'
    },
    {
      text: '交易支付',
      icon: <PaymentIcon />,
      path: '/payment'
    },
    {
      text: '通知提醒',
      icon: <NotificationIcon />,
      path: '/notifications'
    },
    {
      text: '安全隱私',
      icon: <SecurityIcon />,
      path: '/security'
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: '240px',
        flexShrink: 0,
        position: 'fixed',
        height: '100vh',
        '& .MuiDrawer-paper': {
          width: '240px',
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: '#fff',
          position: 'fixed',
          height: '100vh',
        },
      }}
    >
      <Toolbar /> {/* 為 AppBar 預留空間 */}
      <Box sx={{
        overflow: 'auto',
        height: 'calc(100vh - 64px)',
      }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                  },
                  py: 1.5,  // 增加按鈕高度
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 