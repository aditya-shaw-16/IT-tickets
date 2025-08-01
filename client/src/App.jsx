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
import CreateUser from './pages/CreateUser';
import DeleteUser from './pages/DeleteUser';
import NewUser from './pages/NewUser';
import Archive from './pages/Archive';
import AdminEscalationConfig from './pages/AdminEscalationConfig';


function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/new-user" element={<NewUser />} /> {/* ✅ New route added */}
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Authenticated for All */}
        <Route element={<RequireAuth allowedRoles={['EMPLOYEE', 'IT', 'ADMIN']} />}>
          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/changePhone" element={<ChangePhone />} />
          <Route path="/raiseTicket" element={<RaiseTicket />} />
        </Route>

        {/* IT/Admin only */}
        <Route element={<RequireAuth allowedRoles={['IT', 'ADMIN']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/history" element={<History />} />
          <Route path="/raiseEmployeeTicket" element={<RaiseEmployeeTicket />} />
          <Route path="/archive" element={<Archive />} />
        </Route>

        {/* Employee only */}
        <Route element={<RequireAuth allowedRoles={['EMPLOYEE']} />}>
          <Route path="/myDashboard" element={<EmployeeDashboard />} />
          <Route path="/myTickets" element={<EmployeeTickets />} />
        </Route>


        <Route element={<RequireAuth allowedRoles={['ADMIN']} />}>
          <Route path="/admin/createUser" element={<CreateUser />} />
          <Route path="/admin/deleteUser" element={<DeleteUser />} />
          <Route path="/admin/setEscalationContacts" element={<AdminEscalationConfig />} />
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
