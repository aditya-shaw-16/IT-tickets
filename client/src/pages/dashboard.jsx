import Navbar from '../components/navbar';
import Sidebar from '../components/Sidebar';
import AlertBox from '../components/AlertBox';

function Dashboard() {
  const userRole = 'it'; // 🔁 change to 'it' to test IT view

  return (
    <div style={{ display: 'flex' }}>
      {/* Conditionally render Sidebar for IT/Admin */}
      {(userRole === 'it' || userRole === 'admin') && <Sidebar />}
      {(userRole === 'employee') && <Navbar />}

      <div style={{ flex: 1 }}>
        {/* Conditionally render Navbar for Employee */}
        {userRole === 'employee' && <Navbar userRole="employee" />}
        {/* {userRole !== 'employee' && <Navbar userRole={userRole} />} */}

        <div style={{ padding: '2rem' }}>
          <h2>{userRole.toUpperCase()} Dashboard</h2>

          {/* Alerts */}
          <div style={{ marginBottom: '1.5rem' }}>
            <AlertBox type="info" message="Welcome to your Dashboard!" />
            {userRole !== 'employee' && (
              <AlertBox type="warning" message="2 tickets are approaching deadline!" />
            )}
          </div>

          {/* Summary Cards (only for IT/Admin) */}
          {(userRole === 'it' || userRole === 'admin') && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={cardStyle('#e0f7fa')}>
                <h3>Open Tickets</h3>
                <p>12</p>
              </div>
              <div style={cardStyle('#e8f5e9')}>
                <h3>Resolved</h3>
                <p>8</p>
              </div>
              <div style={cardStyle('#fff3e0')}>
                <h3>Pending Confirmation</h3>
                <p>5</p>
              </div>
            </div>
          )}

          {/* Recent Activity for All */}
          <div>
            <h4>Recent Activity</h4>
            <ul style={{ paddingLeft: '1.2rem' }}>
              <li>Ticket created</li>
              <li>IT responded</li>
              <li>Employee confirmed resolution</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = (bgColor) => ({
  flex: 1,
  padding: '1.5rem',
  backgroundColor: bgColor,
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  textAlign: 'center'
});

export default Dashboard;
