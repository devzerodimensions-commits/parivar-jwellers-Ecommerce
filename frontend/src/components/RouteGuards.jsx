import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { isAdminRole } from '../config/roles.js';
import Spinner from './ui/Spinner.jsx';

// Require any logged-in user.
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
};

// Require an admin user. Unauthenticated or non-admin visitors are sent to the
// standalone admin login screen.
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user || !isAdminRole(user.role)) return <Navigate to="/admin/login" replace />;
  return children;
};
