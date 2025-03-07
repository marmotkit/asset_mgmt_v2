import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Login from '../components/pages/auth/Login';
import UserManagement from '../components/pages/admin/UserManagement';
import CompanyManagement from '../components/pages/company/CompanyManagement';
import InvestmentManagement from '../components/pages/investment/InvestmentManagement';
import FeeManagement from '../components/pages/fees/FeeManagement';
import InvoicePrintPage from '../components/pages/investment/InvoicePrintPage';

// 保護路由的高階組件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 公開路由 */}
      <Route path="/login" element={<Login />} />

      {/* 受保護路由 */}
      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to="/users" replace />
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      } />

      <Route path="/fees" element={
        <ProtectedRoute>
          <FeeManagement />
        </ProtectedRoute>
      } />

      <Route path="/companies" element={
        <ProtectedRoute>
          <CompanyManagement />
        </ProtectedRoute>
      } />

      <Route path="/investment" element={
        <ProtectedRoute>
          <InvestmentManagement />
        </ProtectedRoute>
      } />

      <Route path="/investment/invoice/print/:invoiceId" element={<InvoicePrintPage />} />

      <Route path="/services" element={
        <ProtectedRoute>
          <div>會員服務</div>
        </ProtectedRoute>
      } />

      <Route path="/payment" element={
        <ProtectedRoute>
          <div>交易支付</div>
        </ProtectedRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <div>通知提醒</div>
        </ProtectedRoute>
      } />

      <Route path="/security" element={
        <ProtectedRoute>
          <div>安全隱私</div>
        </ProtectedRoute>
      } />

      {/* 404 路由 */}
      <Route path="*" element={
        <ProtectedRoute>
          <div>404 Not Found</div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes; 