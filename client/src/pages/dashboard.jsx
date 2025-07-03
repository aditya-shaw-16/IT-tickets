import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import AlertBox from '../components/AlertBox';
import axiosInstance from '../api/axiosInstance';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user?.role?.toLowerCase() || '';

  const [summary, setSummary] = useState({
    open: 0,
    resolved: 0,
    newTickets: 0,
    approachingDeadlines: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axiosInstance.get('/tickets/summary');
        setSummary(res.data);
      } catch (err) {
        console.error('Error fetching summary:', err);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      {(userRole === 'it' || userRole === 'admin') && <Sidebar />}
      <div style={{ flex: 1 }}>
        <div style={{ padding: '2rem' }}>
          <h2>{userRole.toUpperCase()} Dashboard</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            {summary.approachingDeadlines > 0 && (
              <AlertBox type="danger" message={`${summary.approachingDeadlines} ticket(s) approaching deadline!`} />
            )}
            {summary.newTickets > 0 && (
              <AlertBox type="info" message={`${summary.newTickets} new ticket(s) today.`} />
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={cardStyle('#e0f7fa')}>
              <h3>Open Tickets</h3>
              <p>{summary.open}</p>
            </div>
            <div style={cardStyle('#e8f5e9')}>
              <h3>Resolved</h3>
              <p>{summary.resolved}</p>
            </div>
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
  textAlign: 'center',
});

export default Dashboard;
