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

      {/* 新增的投資相關子路由 */}
      <Route path="/investment/rental-payment" element={
        <ProtectedRoute>
          <RentalAndProfitManagement initialTab={1} />
        </ProtectedRoute>
      } />

      <Route path="/investment/member-profit" element={
        <ProtectedRoute>
          <RentalAndProfitManagement initialTab={2} />
        </ProtectedRoute>
      } />

      <Route path="/investment/history" element={
        <ProtectedRoute>
          <RentalAndProfitManagement initialTab={3} />
        </ProtectedRoute>
      } />

      <Route path="/investment/invoice/print/:invoiceId" element={<InvoicePrintPage />} />

      <Route path="/services" element={
        <ProtectedRoute>
          <MemberServicesManagement />
        </ProtectedRoute>
      } />

      <Route path="/payment" element={
        <ProtectedRoute>
          <AccountingManagement />
        </ProtectedRoute>
      } />

      <Route path="/investment-dashboard" element={
        <ProtectedRoute>
          <InvestmentDashboard />
        </ProtectedRoute>
      } />

      <Route path="/investment-dashboard/:id" element={
        <ProtectedRoute>
          <InvestmentDetail />
        </ProtectedRoute>
      } />

      <Route path="/investment-dashboard-management" element={
        <ProtectedRoute>
          <InvestmentDashboardManagement />
        </ProtectedRoute>
      } />

      <Route path="/investment-dashboard-management/inquiries" element={
        <ProtectedRoute>
          <InquiryManagement />
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