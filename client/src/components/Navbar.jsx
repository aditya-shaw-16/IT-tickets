import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Navbar() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
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
    navigate('/');
  };

  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#003366',
      padding: '1rem',
      color: 'white',
      position: 'relative'
    }}>
      <div>
        <h2 style={{ margin: 0 }}>IT Tickets...</h2>
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

        {/* ⚙️ Settings Button */}
        <div style={{ position: 'relative' }}>
          <button onClick={toggleMenu} style={{
            backgroundColor: '#005599',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}>
            ⚙️ Settings
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              backgroundColor: '#ffffff',
              color: '#000000',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              borderRadius: '4px',
              overflow: 'hidden',
              zIndex: 10
            }}>
              <div
                onClick={() => {
                  setShowMenu(false);
                  navigate('/changePassword');
                }}
                style={dropdownItemStyle}
              >
                Change Password
              </div>
            </div>
          )}
        </div>

        <button onClick={handleLogout} style={{
          backgroundColor: 'rgba(248, 61, 61, 0.8)',
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

const dropdownItemStyle = {
  padding: '0.75rem 1.25rem',
  cursor: 'pointer',
  borderBottom: '1px solid #ccc',
  backgroundColor: '#fff',
  textAlign: 'left'
};

export default Navbar;
