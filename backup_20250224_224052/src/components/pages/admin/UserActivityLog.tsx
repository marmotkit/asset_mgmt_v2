import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface ActivityLog {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'profile_update' | 'preference_update';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface UserActivityLogProps {
  userId: string;
}

const UserActivityLog: React.FC<UserActivityLogProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // TODO: 實作取得活動記錄的 API
      const response = await fetch(`/api/users/${userId}/activities`);
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'login':
        return <LoginIcon color="primary" />;
      case 'logout':
        return <LogoutIcon color="error" />;
      case 'profile_update':
        return <EditIcon color="info" />;
      case 'preference_update':
        return <SettingsIcon color="warning" />;
    }
  };

  const getActivityLabel = (type: ActivityLog['type']) => {
    switch (type) {
      case 'login':
        return '登入';
      case 'logout':
        return '登出';
      case 'profile_update':
        return '更新資料';
      case 'preference_update':
        return '更新偏好';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        活動記錄
      </Typography>
      <List>
        {activities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ListItem>
              <ListItemIcon>
                {getActivityIcon(activity.type)}
              </ListItemIcon>
              <ListItemText
                primary={activity.description}
                secondary={new Date(activity.timestamp).toLocaleString('zh-TW')}
              />
              <Chip
                label={getActivityLabel(activity.type)}
                size="small"
                variant="outlined"
              />
            </ListItem>
            {index < activities.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default UserActivityLog; 