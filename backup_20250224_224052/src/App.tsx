import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import UserManagement from './components/pages/admin/UserManagement';
import Dashboard from './components/pages/Dashboard';

function App() {
  useEffect(() => {
    alert('App 組件已載入');
  }, []);

  try {
    return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/member/users" />} />
              <Route path="/member">
                <Route index element={<UserManagement />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/member/users" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    );
  } catch (error) {
    alert(`App 渲染錯誤：${error}`);
    return null;
  }
}

export default App;