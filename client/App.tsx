import React, { useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { LayoutProvider } from './context/LayoutContext';
import { CRMPage } from './pages/CRMPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { TasksPage } from './pages/TasksPage';
import { LoginPage } from './pages/LoginPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ClientTrackerPage } from './pages/ClientTrackerPage';
import { ClientDetailsPage } from './pages/ClientDetailsPage';
import { AdminPerformancePage } from './pages/AdminPerformancePage';
import { AdminUserManagementPage } from './pages/AdminUserManagementPage';
import { MeetingTrackerPage } from './pages/MeetingTrackerPage';
import { UniversalCalendarPage } from './pages/UniversalCalendarPage';
import { MyDashboardPage } from './pages/MyDashboardPage';
import { ClientPortalPage } from './pages/ClientPortalPage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SettingsPage } from './pages/SettingsPage';

// --- Session Monitor Component ---
const SessionMonitor: React.FC = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout } = useAuth();
    const timerRef = useRef<number | null>(null);
    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) {
            hasTriggeredRef.current = false;
            return;
        }

        // Focus Break Prompt (15 mins)
        timerRef.current = window.setTimeout(() => {
            if (location.pathname !== '/break' && !hasTriggeredRef.current) {
                hasTriggeredRef.current = true;
                showToast(
                    "You've been active for a while. How about a quick focus break?", 
                    "info", 
                    {
                        label: "Play Game",
                        onClick: () => navigate('/break')
                    }
                );
            }
        }, 15 * 60 * 1000); 

        // Auto Logout Check (3 hours)
        const checkSession = () => {
            const loginTimeStr = localStorage.getItem('loginTimestamp');
            if (loginTimeStr) {
                const loginTime = parseInt(loginTimeStr, 10);
                const now = Date.now();
                const sessionLimit = 3 * 60 * 60 * 1000; // 3 hours
                
                if (now - loginTime > sessionLimit) {
                    logout();
                    // Toast notification removed as requested
                }
            } else {
                // If missing (legacy login), set it to now to start timer
                localStorage.setItem('loginTimestamp', String(Date.now()));
            }
        };

        const interval = setInterval(checkSession, 60 * 1000); // Check every minute
        checkSession(); // Initial check

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            clearInterval(interval);
        };
    }, [isAuthenticated, showToast, navigate, location.pathname, logout]);

    return null;
};

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

// 5. Public Route (Redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    if (isAuthenticated) {
        if (user?.role === 'ROLE_CLIENT') return <Navigate to="/portal" replace />;
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

// 6. Generic Private Route (Any Authenticated User)
const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

// 7. Root Redirect Logic
const RootRedirect: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    
    if (user?.role === 'ROLE_CLIENT') return <Navigate to="/portal" replace />;
    return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
    return (
        <>
            <SessionMonitor />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                } />

                <Route path="/forgot-password" element={
                    <PublicRoute>
                        <ForgotPasswordPage />
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

                {/* Profile (Accessible by all logged in users) */}
                <Route path="/profile" element={
                    <PrivateRoute>
                        <ProfilePage />
                    </PrivateRoute>
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
                <Route path="/settings" element={
                    <OperationalRoute>
                        <SettingsPage />
                    </OperationalRoute>
                } />
                
                {/* Focus Break Game */}
                <Route path="/break" element={
                    <OperationalRoute>
                        <GamePage />
                    </OperationalRoute>
                } />
                
                {/* Analytics & User Management (Super Admin Only) */}
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
                <Route path="/admin/users" element={
                    <SuperAdminRoute>
                        <AdminUserManagementPage />
                    </SuperAdminRoute>
                } />

                {/* System Routes */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Catch All - Order Matters */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
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