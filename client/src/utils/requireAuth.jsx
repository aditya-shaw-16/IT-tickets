import { Navigate, Outlet, useLocation } from 'react-router-dom';

const roleRoutes = {
  all: [
    '/changePassword',
    '/forgotPassword',
    '/reset-password',
    '/raiseTicket',
  ],
  EMPLOYEE: ['/myDashboard', '/myTickets'],
  IT: ['/dashboard', '/history', '/tickets', '/raiseEmployeeTicket', '/archive'],
  ADMIN: [
    '/dashboard',
    '/history',
    '/tickets',
    '/raiseEmployeeTicket',
    '/admin/createUser',
    '/admin/deleteUser',
    '/admin/setEscalationContacts', 
    '/archive',
  ],
};

const RequireAuth = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role?.toUpperCase();  // Ensure uppercase for comparison
  const path = location.pathname;

  // Public routes (accessible without login)
  const publicRoutes = ['/', '/new-user', '/forgotPassword'];
  if (publicRoutes.includes(path) || path.startsWith('/reset-password')) {
    if (!token || !role) {
      return <Outlet />; // Allow access if not logged in
    }
    // Redirect logged-in users away from public routes
    return <Navigate to={role === 'EMPLOYEE' ? '/myDashboard' : '/dashboard'} replace />;
  }

  // If user not logged in, redirect to login
  if (!token || !role) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Routes accessible to all logged-in roles
  if (roleRoutes.all.some(route => path.startsWith(route))) {
    return <Outlet />;
  }

  // Role-based route checks
  if (roleRoutes[role]?.some(route => path.startsWith(route))) {
    return <Outlet />;
  }

  // If route doesn't match any allowed path
  return <Navigate to="/" replace />;
};

export default RequireAuth;
