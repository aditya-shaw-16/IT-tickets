import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/login';
import Dashboard from './pages/dashboard';
import RaiseTicket from './pages/raiseticket';
import Tickets from './pages/tickets';
import EmployeeDashboard from './pages/employeeDashboard';
import EmployeeTickets from "./pages/employeeTickets";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/raiseTicket" element={<RaiseTicket />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/myDashboard" element={<EmployeeDashboard />} />
        <Route path="/myTickets" element={<EmployeeTickets />} />
      </Routes>

      {/* 👇 Required for toast messages to appear */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
      />
    </>
  );
}

export default App;
