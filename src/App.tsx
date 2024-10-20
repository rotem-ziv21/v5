import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import BusinessSettings from './components/BusinessSettings';
import TeamManagement from './components/TeamManagement';
import TenantView from './components/TenantView';
import Login from './components/Login';
import { AuthService } from './services/AuthService';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/business-settings/:tenantId" 
        element={
          <ProtectedRoute role="business_owner">
            <BusinessSettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/team-management/:tenantId" 
        element={
          <ProtectedRoute role="business_owner">
            <TeamManagement />
          </ProtectedRoute>
        } 
      />
      <Route path="/tenant-view/:tenantId" element={<TenantView />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'business_owner';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const userRole = AuthService.getCurrentUser()?.role;

  if (!isAuthenticated || (role === 'admin' && userRole !== 'admin') || (role === 'business_owner' && userRole !== 'business_owner')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default App;