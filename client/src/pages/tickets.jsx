import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import AlertBox from '../components/AlertBox';
import TicketCard from '../components/TicketCard';

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets`);
        const data = await res.json();
        setTickets(data);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div>
      <Navbar userRole="it" />
      <div style={{ padding: '2rem' }}>
        <h2>All Tickets</h2>
        {loading ? (
          <AlertBox type="info" message="Loading tickets..." />
        ) : tickets.length === 0 ? (
          <AlertBox type="warning" message="No tickets found." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} userRole="it" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tickets;
