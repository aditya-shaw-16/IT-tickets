import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaTachometerAlt, FaList, FaArchive, FaSignOutAlt, FaHistory, FaTicketAlt, FaCog, FaUserPlus, FaUserTimes } from 'react-icons/fa';

function Sidebar() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleMenu = () => setShowMenu(!showMenu);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div style={{
      height: '90vh',
      width: '260px',
      backgroundColor: '#1e293b',
      color: '#ffffff',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '2px 0 6px rgba(0,0,0,0.1)'
    }}>
      <div>
        <h2 style={{ marginBottom: '0.5rem', color: '#38bdf8' }}>IT Tickets...</h2>
        {user && (
          <div style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>
            Welcome, <strong>{user.name}</strong>
          </div>
        )}

        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={navItemStyle}><FaTachometerAlt style={iconStyle} /><Link to="/dashboard" style={linkStyle}>Dashboard</Link></li>
          <li style={navItemStyle}><FaList style={iconStyle} /><Link to="/tickets" style={linkStyle}>All Tickets</Link></li>
          <li style={navItemStyle}><FaTicketAlt style={iconStyle} /><Link to="/raiseTicket" style={linkStyle}>Raise Ticket</Link></li>
          <li style={navItemStyle}><FaHistory style={iconStyle} /><Link to="/history" style={linkStyle}>History</Link></li>
          <li style={navItemStyle}><FaArchive style={iconStyle} /><Link to="/archive" style={linkStyle}>Archive</Link></li>

          {user?.role === "ADMIN" && (
            <>
              <li style={navItemStyle}>
                <FaUserPlus style={iconStyle} />
                <Link to="/admin/createUser" style={linkStyle}>Create User</Link>
              </li>
              <li style={navItemStyle}>
                <FaUserTimes style={iconStyle} />
                <Link to="/admin/deleteUser" style={linkStyle}>Delete User</Link>
              </li>
              <li style={navItemStyle}>
                <FaCog style={iconStyle} />
                <Link to="/admin/setEscalationContacts" style={linkStyle}>Escalation Contacts</Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <div style={bottomButtonContainerStyle}>
        <div style={{ position: 'relative', width: '100%' }}>
          <button onClick={toggleMenu} style={settingsButtonStyle}>
            <FaCog style={{ marginRight: '8px' }} />
            Settings
          </button>
          {showMenu && (
            <div style={dropdownContainerStyle}>
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

        <button onClick={handleLogout} style={logoutButtonStyle}>
          <FaSignOutAlt style={{ marginRight: '8px' }} />
          Logout
        </button>
      </div>
    </div>
  );
}

// 🔧 Styles
const navItemStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1rem',
};

const linkStyle = {
  marginLeft: '10px',
  color: '#ffffff',
  textDecoration: 'none',
  fontSize: '16px'
};

const iconStyle = {
  fontSize: '18px',
};

const logoutButtonStyle = {
  backgroundColor: 'rgba(248, 61, 61, 0.8)',
  color: '#fff',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
};

const dropdownContainerStyle = {
  position: 'absolute',
  bottom: '110%',
  left: 0,
  backgroundColor: '#ffffff',
  color: '#000000',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  borderRadius: '4px',
  overflow: 'hidden',
  zIndex: 10,
  width: '100%'
};

const dropdownItemStyle = {
  padding: '0.75rem 1.25rem',
  cursor: 'pointer',
  borderBottom: '1px solid #ccc',
  backgroundColor: '#fff',
  textAlign: 'left',
  fontSize: '14px'
};

const settingsButtonStyle = {
  backgroundColor: '#005599',
  color: '#fff',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
};

const bottomButtonContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

export default Sidebar;
