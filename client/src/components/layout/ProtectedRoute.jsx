import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="loading-screen">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
