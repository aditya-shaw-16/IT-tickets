import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import AlertBox from '../components/AlertBox';
import TicketCard from '../components/TicketCard';

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All', 'Open', 'Resolved'

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setTickets(data.tickets ? data.tickets : data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = tickets
  .filter(ticket => ticket.status !== 'closed') // 👈 Exclude closed
  .filter(ticket => {
    if (filter === 'All') return true;
    return ticket.status === filter.toLowerCase();
  });


  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem' }}>
        <h2>Active Tickets</h2>

        {/* 🔘 Slider Toggle Filter */}
        <div style={{
          display: 'flex',
          borderRadius: '999px',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          width: 'fit-content',
          marginBottom: '1.5rem'
        }}>
          {['All', 'Open', 'Resolved'].map(option => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: filter === option ? '#38bdf8' : 'white',
                color: filter === option ? 'white' : '#1e293b',
                cursor: 'pointer',
                transition: '0.2s',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {option}
            </button>
          ))}
        </div>

        {loading ? (
          <AlertBox type="info" message="Loading tickets..." />
        ) : filteredTickets.length === 0 ? (
          <AlertBox type="warning" message="No tickets found." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} userRole="it" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tickets;
