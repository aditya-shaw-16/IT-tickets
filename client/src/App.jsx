import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import RequireAuth from './utils/requireAuth';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import RaiseTicket from './pages/raiseticket';
import Tickets from './pages/tickets';
import History from './pages/history';
import EmployeeDashboard from './pages/employeeDashboard';
import EmployeeTickets from './pages/employeeTickets';
import ChangePassword from './pages/changePassword';
import ChangePhone from './pages/changePhone';
import ResetPassword from './pages/resetPassword';
import ForgotPassword from './pages/forgotPassword';
import RaiseEmployeeTicket from './pages/raiseEmployeeTicket';
import CreateUser from './pages/createUser';
import DeleteUser from './pages/deleteUser';

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Authenticated for All */}
        <Route element={<RequireAuth allowedRoles={['employee', 'it', 'admin']} />}>
          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/changePhone" element={<ChangePhone />} />
          <Route path="/raiseTicket" element={<RaiseTicket />} />
        </Route>

        {/* IT/Admin only */}
        <Route element={<RequireAuth allowedRoles={['it', 'admin']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/history" element={<History />} />
          <Route path="/raiseEmployeeTicket" element={<RaiseEmployeeTicket />} />
        </Route>

        {/* Employee only */}
        <Route element={<RequireAuth allowedRoles={['employee']} />}>
          <Route path="/myDashboard" element={<EmployeeDashboard />} />
          <Route path="/myTickets" element={<EmployeeTickets />} />
        </Route>


        <Route element={<RequireAuth allowedRoles={['admin']} />}>
          <Route path="/admin/createUser" element={<createUser />} />
          <Route path="/admin/deleteUser" element={<deleteUser />} />
        </Route>


      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

export default App;
