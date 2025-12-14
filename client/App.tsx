
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LayoutProvider } from './context/LayoutContext';
import { CRMPage } from './pages/CRMPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { TasksPage } from './pages/TasksPage';
import { LoginPage } from './pages/LoginPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ClientTrackerPage } from './pages/ClientTrackerPage';
import { ClientDetailsPage } from './pages/ClientDetailsPage';
import { AdminPerformancePage } from './pages/AdminPerformancePage';
import { MeetingTrackerPage } from './pages/MeetingTrackerPage';
import { UniversalCalendarPage } from './pages/UniversalCalendarPage';
import { MyDashboardPage } from './pages/MyDashboardPage';
import { ClientPortalPage } from './pages/ClientPortalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// 1. Super Admin Only Route
const SuperAdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role !== 'ROLE_SUPER_ADMIN') {
        return <Navigate to="/unauthorized" replace />;
    }
    return children;
};

// 2. Admin Route (Super Admin + Admin) - For CRM
const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_SUPER_ADMIN' || user?.role === 'ROLE_ADMIN') {
        return children;
    }
    return <Navigate to="/unauthorized" replace />;
};

// 3. Operational Route (SA + Admin + Employee)
const OperationalRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_CLIENT') {
        return <Navigate to="/portal" replace />;
    }
    return children;
};

// 4. Client Route (Client Only)
const ClientRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role !== 'ROLE_CLIENT') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

// 5. Public Route
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (isAuthenticated) {
        if (user?.role === 'ROLE_CLIENT') return <Navigate to="/portal" replace />;
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

// 6. Root Redirect Logic
const RootRedirect: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_CLIENT') return <Navigate to="/portal" replace />;
    return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />
            
            {/* Client Portal */}
            <Route path="/portal" element={
                <ClientRoute>
                    <ClientPortalPage />
                </ClientRoute>
            } />
            
            {/* Internal Dashboard */}
            <Route path="/dashboard" element={
                <OperationalRoute>
                    <MyDashboardPage />
                </OperationalRoute>
            } />

            {/* CRM (Super Admin + Admin) */}
            <Route path="/crm" element={
                <AdminRoute>
                    <CRMPage />
                </AdminRoute>
            } />
            
            {/* Operational Apps (SA + Admin + Employee) */}
            <Route path="/companies" element={
                <OperationalRoute>
                    <CompaniesPage />
                </OperationalRoute>
            } />
            <Route path="/tasks" element={
                <OperationalRoute>
                    <TasksPage />
                </OperationalRoute>
            } />
            <Route path="/meetings" element={
                <OperationalRoute>
                    <MeetingTrackerPage />
                </OperationalRoute>
            } />
            <Route path="/calendar" element={
                <OperationalRoute>
                    <UniversalCalendarPage />
                </OperationalRoute>
            } />
            <Route path="/client-tracker" element={
                <OperationalRoute>
                    <ClientTrackerPage />
                </OperationalRoute>
            } />
            <Route path="/client-tracker/:id" element={
                <OperationalRoute>
                    <ClientDetailsPage />
                </OperationalRoute>
            } />
            
            {/* Analytics (Super Admin Only) */}
            <Route path="/reports" element={
                <SuperAdminRoute>
                    <AnalyticsPage title="Reports" />
                </SuperAdminRoute>
            } />
             <Route path="/admin/performance" element={
                <SuperAdminRoute>
                    <AdminPerformancePage />
                </SuperAdminRoute>
            } />

            {/* System Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Catch All */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
        <ToastProvider>
            <LayoutProvider>
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
            </LayoutProvider>
        </ToastProvider>
    </AuthProvider>
  );
};

export default App;
