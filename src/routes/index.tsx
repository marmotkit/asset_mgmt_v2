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
import RentalAndProfitManagement from '../components/pages/investment/RentalAndProfitManagement';
import MemberServicesManagement from '../components/pages/services/MemberServicesManagement';
import AccountingManagement from '../components/pages/accounting/AccountingManagement';
import InvestmentDashboard from '../components/pages/investment-dashboard/InvestmentDashboard';
import InvestmentDetail from '../components/pages/investment-dashboard/InvestmentDetail';
import InvestmentDashboardManagement from '../components/pages/investment-dashboard/admin/InvestmentManagement';
import InquiryManagement from '../components/pages/investment-dashboard/admin/InquiryManagement';
import SystemInfo from '../components/pages/SystemInfo';
import RoleBasedRoute from '../components/common/RoleBasedRoute';

// 保護路由的高階組件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// 管理員專用路由
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['admin']}>
        {children}
      </RoleBasedRoute>
    </ProtectedRoute>
  );
};

// 一般用戶路由（所有角色都可訪問）
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 公開路由 */}
      <Route path="/login" element={<Login />} />

      {/* 管理員專用路由 */}
      <Route path="/users" element={
        <AdminRoute>
          <UserManagement />
        </AdminRoute>
      } />

      <Route path="/fees" element={
        <AdminRoute>
          <FeeManagement />
        </AdminRoute>
      } />

      <Route path="/companies" element={
        <AdminRoute>
          <CompanyManagement />
        </AdminRoute>
      } />

      <Route path="/investment" element={
        <AdminRoute>
          <InvestmentManagement />
        </AdminRoute>
      } />

      {/* 新增的投資相關子路由 */}
      <Route path="/investment/rental-payment" element={
        <AdminRoute>
          <RentalAndProfitManagement initialTab={1} />
        </AdminRoute>
      } />

      <Route path="/investment/member-profit" element={
        <AdminRoute>
          <RentalAndProfitManagement initialTab={2} />
        </AdminRoute>
      } />

      <Route path="/investment/history" element={
        <AdminRoute>
          <RentalAndProfitManagement initialTab={3} />
        </AdminRoute>
      } />

      <Route path="/investment/invoice/print/:invoiceId" element={
        <AdminRoute>
          <InvoicePrintPage />
        </AdminRoute>
      } />

      <Route path="/payment" element={
        <AdminRoute>
          <AccountingManagement />
        </AdminRoute>
      } />

      <Route path="/investment-dashboard-management" element={
        <AdminRoute>
          <InvestmentDashboardManagement />
        </AdminRoute>
      } />

      <Route path="/investment-dashboard-management/inquiries" element={
        <AdminRoute>
          <InquiryManagement />
        </AdminRoute>
      } />

      <Route path="/notifications" element={
        <AdminRoute>
          <div>通知提醒</div>
        </AdminRoute>
      } />

      <Route path="/system-info" element={
        <PublicRoute>
          <SystemInfo />
        </PublicRoute>
      } />

      {/* 一般用戶可訪問的路由 */}
      <Route path="/services" element={
        <PublicRoute>
          <MemberServicesManagement />
        </PublicRoute>
      } />

      <Route path="/investment-dashboard" element={
        <PublicRoute>
          <InvestmentDashboard />
        </PublicRoute>
      } />

      <Route path="/investment-dashboard/:id" element={
        <PublicRoute>
          <InvestmentDetail />
        </PublicRoute>
      } />

      {/* 預設路由重定向 */}
      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to="/services" replace />
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