import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Toolbar,
  Divider,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  AccountBalance as InvestmentIcon,
  Support as ServiceIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Receipt as FeeIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [version, setVersion] = useState(() => {
    // 從 localStorage 讀取版本號，如果沒有則使用預設值 '1.0'
    return localStorage.getItem('app_version') || '1.0';
  });
  const currentYear = new Date().getFullYear();

  // 當版本號改變時，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('app_version', version);
  }, [version]);

  const handleVersionClick = (event: React.MouseEvent<HTMLElement>) => {
    const isLeftClick = event.button === 0;
    const currentVersionParts = version.split('.');
    const major = parseInt(currentVersionParts[0]);
    let minor = parseInt(currentVersionParts[1]);

    if (isLeftClick) {
      // 左鍵點擊，版本號加0.1
      minor = minor === 9 ? 0 : minor + 1;
      const newMajor = minor === 0 ? major + 1 : major;
      setVersion(`${newMajor}.${minor}`);
    } else if (event.button === 2) {
      // 右鍵點擊，版本號減0.1
      event.preventDefault();
      if (major === 1 && minor === 0) return; // 不允許低於 1.0
      minor = minor === 0 ? 9 : minor - 1;
      const newMajor = minor === 9 ? major - 1 : major;
      setVersion(`${newMajor}.${minor}`);
    }
  };

  // 檢查是否為管理員角色
  const isAdmin = user?.role === 'admin' || user?.role === 'business' || user?.role === 'lifetime';

  // 根據角色定義菜單項目
  const getMenuItems = () => {
    const allMenuItems = [
      {
        text: '會員管理',
        icon: <PeopleIcon />,
        path: '/users',
        adminOnly: true
      },
      {
        text: '會費管理',
        icon: <FeeIcon />,
        path: '/fees',
        adminOnly: true
      },
      {
        text: '公司資訊',
        icon: <BusinessIcon />,
        path: '/companies',
        adminOnly: true
      },
      {
        text: '投資管理',
        icon: <InvestmentIcon />,
        path: '/investment',
        adminOnly: true
      },
      {
        text: '會員服務',
        icon: <ServiceIcon />,
        path: '/services',
        adminOnly: false
      },
      {
        text: '帳務管理',
        icon: <PaymentIcon />,
        path: '/payment',
        adminOnly: true
      },
      {
        text: '投資看板',
        icon: <DashboardIcon />,
        path: '/investment-dashboard',
        adminOnly: false
      },
      {
        text: '通知提醒',
        icon: <NotificationIcon />,
        path: '/notifications',
        adminOnly: true
      },
      {
        text: '安全隱私',
        icon: <SecurityIcon />,
        path: '/security',
        adminOnly: true
      }
    ];

    // 根據用戶角色過濾菜單項目
    return allMenuItems.filter(item => !item.adminOnly || isAdmin);
  };

  const menuItems = getMenuItems();

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
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Toolbar /> {/* 為 AppBar 預留空間 */}
      <Box sx={{
        overflow: 'auto',
        flex: 1,
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
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          align="center"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Copy Right © {currentYear} XXXX
        </Typography>
        <Typography
          variant="caption"
          component="div"
          align="center"
          sx={{
            cursor: 'pointer',
            userSelect: 'none',
            '&:hover': {
              color: 'primary.main',
            },
          }}
          onMouseDown={handleVersionClick}
          onContextMenu={(e) => e.preventDefault()}
        >
          Version {version}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 