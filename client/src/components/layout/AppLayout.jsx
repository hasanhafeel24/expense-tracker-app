import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <Outlet />
      </main>
    </div>
  );
}
