import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SNListPage from './pages/SNListPage';
import MachineDataPage from './pages/MachineDataPage';
import UserManagementPage from './pages/UserManagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, requireSuperAdmin = false }: { children: React.ReactNode; requireSuperAdmin?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && user.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route 
          path="/" 
          element={
            user.role === 'super_admin' ? (
              <ProtectedRoute requireSuperAdmin>
                <SNListPage />
              </ProtectedRoute>
            ) : (
              <ProtectedRoute>
                <MachineDataPage />
              </ProtectedRoute>
            )
          } 
        />
        <Route 
          path="/sn-management" 
          element={
            <ProtectedRoute requireSuperAdmin>
              <SNListPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/machine-data" 
          element={
            <ProtectedRoute>
              <MachineDataPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requireSuperAdmin>
              <UserManagementPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
