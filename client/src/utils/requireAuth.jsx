import { Navigate, Outlet, useLocation } from 'react-router-dom';

const roleRoutes = {
  all: [
    '/changePassword',
    '/changePhone',
    '/forgotPassword',
    '/reset-password',
    '/raiseTicket',
  ],
  EMPLOYEE: ['/myDashboard', '/myTickets'],
  IT: ['/dashboard', '/history', '/tickets', '/raiseEmployeeTicket'],
  ADMIN: ['/dashboard', '/history', '/tickets', '/raiseEmployeeTicket', '/admin/CreateUser', '/admin/DeleteUser'],
};

const RequireAuth = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role.toUpperCase();
  const path = location.pathname;

  if (!token || !role) {
    if (path === '/' || path === '/forgotPassword' || path.startsWith('/reset-password')) {
      return <Outlet />;
    }
    return <Navigate to="/" replace />;
  }

  if (path === '/' || path === '/forgotPassword' || path.startsWith('/reset-password')) {
    return <Navigate to={role === 'employee' ? '/myDashboard' : '/dashboard'} replace />;
  }

  if (roleRoutes.all.some(route => path.startsWith(route))) {
    return <Outlet />;
  }

  if (roleRoutes[role]?.some(route => path.startsWith(route))) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

export default RequireAuth;
