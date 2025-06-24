import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaList, FaCheckCircle, FaArchive, FaUserCheck, FaFilter } from 'react-icons/fa';

function Sidebar() {
  return (
    <div style={{
      height: '100vh',
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
        <h2 style={{ marginBottom: '2rem', color: '#38bdf8' }}>ITops</h2>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={navItemStyle}><FaTachometerAlt style={iconStyle} /><Link to="/dashboard" style={linkStyle}>Dashboard</Link></li>
          <li style={navItemStyle}><FaList style={iconStyle} /><Link to="/tickets" style={linkStyle}>All Tickets</Link></li>
          <li style={navItemStyle}><FaUserCheck style={iconStyle} /><Link to="/tickets/assigned" style={linkStyle}>Assigned to Me</Link></li>
          <li style={navItemStyle}><FaCheckCircle style={iconStyle} /><Link to="/tickets/resolved" style={linkStyle}>Resolved</Link></li>
          <li style={navItemStyle}><FaArchive style={iconStyle} /><Link to="/archive" style={linkStyle}>Archive</Link></li>
        </ul>
      </div>

      {/* 🔍 Filter section */}
      <div>
        <p style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '0.5rem' }}><FaFilter style={{ marginRight: '6px' }} />Filters</p>

        <div style={filterGroup}>
          <label style={labelStyle}>Priority:</label>
          <select style={selectStyle}>
            <option value="">All</option>
            <option value="P0">P0 (Urgent)</option>
            <option value="P1">P1 (Next Day)</option>
            <option value="P2">P2 (2 Days)</option>
          </select>
        </div>

        <div style={filterGroup}>
          <label style={labelStyle}>Status:</label>
          <select style={selectStyle}>
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending Confirmation</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div style={filterGroup}>
          <label style={labelStyle}>Category:</label>
          <select style={selectStyle}>
            <option value="">All</option>
            <option value="email">Email</option>
            <option value="hardware">Hardware</option>
            <option value="access">Access Issues</option>
            <option value="other">Other</option>
          </select>
        </div>
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

const filterGroup = {
  marginBottom: '1rem'
};

const labelStyle = {
  display: 'block',
  marginBottom: '4px',
  color: '#cbd5e1'
};

const selectStyle = {
  width: '100%',
  padding: '6px',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

export default Sidebar;
