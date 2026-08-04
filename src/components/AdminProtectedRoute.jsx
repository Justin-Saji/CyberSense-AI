import { Navigate, useLocation } from 'react-router-dom';
import { adminAuthService } from '../services/adminService';

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAdmin = adminAuthService.isAuthenticated();
  const adminUser = adminAuthService.getCurrentAdmin();

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (adminUser?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
