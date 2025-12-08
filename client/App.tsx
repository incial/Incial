
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CRMPage } from './pages/CRMPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { TasksPage } from './pages/TasksPage';
import { LoginPage } from './pages/LoginPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ClientTrackerPage } from './pages/ClientTrackerPage';
import { ClientDetailsPage } from './pages/ClientDetailsPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

 //localStorage.clear();

// Admin Only Route Wrapper
const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (user?.role !== 'ROLE_ADMIN') {
        // Redirect employees to Tasks if they try to access admin pages
        return <Navigate to="/tasks" replace />;
    }
    return children;
};

// Public Route Wrapper (redirects to dashboard if logged in)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (isAuthenticated) {
      const redirectTo = user?.role === 'ROLE_ADMIN' ? '/crm' : '/tasks';
      return <Navigate to={redirectTo} replace />;
    }
    return children;
};

// Helper for root redirect based on role
const RootRedirect: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    const to = user?.role === 'ROLE_ADMIN' ? '/crm' : '/tasks';
    return <Navigate to={to} replace />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />
            
            {/* CRM is now Admin Only */}
            <Route path="/crm" element={
                <AdminRoute>
                    <CRMPage />
                </AdminRoute>
            } />
            
            <Route path="/companies" element={
                <ProtectedRoute>
                    <CompaniesPage />
                </ProtectedRoute>
            } />
            <Route path="/tasks" element={
                <ProtectedRoute>
                    <TasksPage />
                </ProtectedRoute>
            } />

            {/* Client Tracker Routes */}
            <Route path="/client-tracker" element={
                <ProtectedRoute>
                    <ClientTrackerPage />
                </ProtectedRoute>
            } />
            <Route path="/client-tracker/:id" element={
                <ProtectedRoute>
                    <ClientDetailsPage />
                </ProtectedRoute>
            } />
            
            {/* Admin Only Routes */}
            <Route path="/reports" element={
                <AdminRoute>
                    <AnalyticsPage title="Reports" />
                </AdminRoute>
            } />
            <Route path="/pipelines" element={
                <AdminRoute>
                    <AnalyticsPage title="Pipeline Analytics" />
                </AdminRoute>
            } />

            {/* Smart Redirects */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
        <HashRouter>
            <AppRoutes />
        </HashRouter>
    </AuthProvider>
  );
};

export default App;
