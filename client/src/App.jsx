import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';
import useAuthStore from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function AppInit({ children }) {
  const { fetchMe } = useAuthStore();
  useEffect(() => { fetchMe(); }, []);
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInit>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppInit>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1D2E',
              color: '#F1F5F9',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00D4AA', secondary: '#0B1F1A' } },
            error: { iconTheme: { primary: '#FF6B6B', secondary: '#2A1010' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
