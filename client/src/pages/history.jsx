import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import AlertBox from '../components/AlertBox';

function History() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    const fetchClosedTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/closed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log('Fetched closed tickets:', data);
        if (res.ok) setTickets(data.tickets);
        else console.error(data.error);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const searchTerm = searchId.trim().toLowerCase();
    return (
      ticket.employee?.name?.toLowerCase().includes(searchTerm) ||
      ticket.employee?.email?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Ticket History</h2>

        <input
          type="text"
          placeholder="Search by Employee Name or Email"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{
            marginBottom: '1.5rem',
            padding: '0.5rem 0.75rem',
            width: '300px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        {loading ? (
          <AlertBox type="info" message="Loading closed tickets..." />
        ) : filteredTickets.length === 0 ? (
          <AlertBox type="warning" message="No closed tickets found." />
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={thStyle}>Employee ID</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Created On</th>
                <th style={thStyle}>Resolved On</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                    transition: 'background-color 0.2s',
                    cursor: 'default'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb'}
                >
                  <td style={tdStyle}>{ticket.employeeId}</td>
                  <td style={tdStyle}>{ticket.employee?.name || 'N/A'}</td>
                  <td style={tdStyle}>{ticket.subject}</td>
                  <td style={tdStyle}>{ticket.description}</td>
                  <td style={tdStyle}>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    {ticket.resolvedAt
                      ? new Date(ticket.resolvedAt).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ✅ Styles
const thStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #e2e8f0',
  fontWeight: 'bold',
  fontSize: '15px',
  color: '#1e293b'
};

const tdStyle = {
  padding: '10px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: '14px',
  color: '#334155'
};

export default History;
