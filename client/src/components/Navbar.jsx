import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#003366',
      padding: '1rem',
      color: 'white'
    }}>
      <div>
        <h2 style={{ margin: 0 }}>ITops</h2>
        {user && (
          <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
            👋 Welcome, <strong>{user.name}</strong>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/myDashboard" style={{ color: 'white', textDecoration: 'none' }}>My Dashboard</Link>
        <Link to="/myTickets" style={{ color: 'white', textDecoration: 'none' }}>My Tickets</Link>
        {user?.role === 'EMPLOYEE' && (
          <Link to="/raiseTicket" style={{ color: 'white', textDecoration: 'none' }}>Raise Ticket</Link>
        )}
        <button onClick={handleLogout} style={{
          backgroundColor: '#005599',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
