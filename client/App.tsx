
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CRMPage } from './pages/CRMPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { LoginPage } from './pages/LoginPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Wrapper (redirects to dashboard if logged in)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
      return <Navigate to="/crm" replace />;
    }
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />
            <Route path="/crm" element={
                <ProtectedRoute>
                    <CRMPage />
                </ProtectedRoute>
            } />
            <Route path="/companies" element={
                <ProtectedRoute>
                    <CompaniesPage />
                </ProtectedRoute>
            } />
            {/* Redirect root to CRM for this demo */}
            <Route path="/" element={<Navigate to="/crm" replace />} />
            <Route path="*" element={<Navigate to="/crm" replace />} />
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
