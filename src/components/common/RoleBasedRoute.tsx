import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleBasedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    fallbackPath?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
    children,
    allowedRoles = ['admin'],
    fallbackPath = '/services'
}) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 檢查用戶角色是否有權限
    if (user && allowedRoles.includes(user.role)) {
        return <>{children}</>;
    }

    // 沒有權限時重定向到指定頁面
    return <Navigate to={fallbackPath} replace />;
};

export default RoleBasedRoute; 