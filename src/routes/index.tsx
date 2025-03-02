import React from 'react';
<<<<<<< Updated upstream
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Login from '../components/pages/auth/Login';
import UserManagement from '../components/pages/admin/UserManagement';

// 保護路由的高階組件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 公開路由 */}
      <Route path="/login" element={<Login />} />

      {/* 受保護路由 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/admin/users" replace />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* 其他路由 */}
      <Route
        path="/company"
        element={
          <ProtectedRoute>
            <div>公司資訊</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/investment"
        element={
          <ProtectedRoute>
            <div>投資管理</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <div>會員服務</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <div>交易支付</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <div>通知提醒</div>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <div>安全隱私</div>
          </ProtectedRoute>
        }
      />

      {/* 404 路由 */}
      <Route path="*" element={<div>404 Not Found</div>} />
=======
import { Routes, Route } from 'react-router-dom';
import UserManagement from '../components/pages/admin/UserManagement';
import Dashboard from '../components/pages/Dashboard';
import InvestmentManagement from '../components/pages/investment/InvestmentManagement';
import CompanyManagement from '../components/pages/company/CompanyManagement';
import FeeManagement from '../pages/admin/FeeManagement';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/fee-management" element={<FeeManagement />} />
      <Route path="/investment" element={<InvestmentManagement />} />
      <Route path="/company" element={<CompanyManagement />} />
>>>>>>> Stashed changes
    </Routes>
  );
};

export default AppRoutes; 