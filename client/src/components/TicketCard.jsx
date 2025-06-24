function TicketCard({ ticket, userRole }) {
  const handleResolve = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${ticket.id}/resolve`, {
      method: 'PATCH',
    });
    if (res.ok) {
      window.location.reload(); // or trigger local state update
    }
  } catch (err) {
    console.error('Error resolving ticket:', err);
  }
};

const handleConfirm = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${ticket.id}/confirm`, {
      method: 'PATCH',
    });
    if (res.ok) {
      window.location.reload();
    }
  } catch (err) {
    console.error('Error confirming ticket:', err);
  }
};

const handleReopen = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${ticket.id}/reopen`, {
      method: 'PATCH',
    });
    if (res.ok) {
      window.location.reload();
    }
  } catch (err) {
    console.error('Error reopening ticket:', err);
  }
};


  const formattedDate = new Date(ticket.createdAt).toLocaleDateString();

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      backgroundColor: ticket.status === 'resolved' ? '#e6ffed' : '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <h3>{ticket.subject}</h3>
      <p><strong>Description:</strong> {ticket.description}</p>
      <p><strong>Status:</strong> {ticket.status}</p>
      <p><strong>Priority:</strong> {ticket.priority || 'Not assigned'}</p>
      <p>
        <strong>Raised by:</strong>{' '}
        {ticket.employee?.name || 'Unknown'} ({ticket.employee?.email || 'N/A'})
      </p>
      <p><strong>Date:</strong> {formattedDate}</p>

      {/* Role-specific buttons */}
      <div style={{ marginTop: '1rem' }}>
        {userRole === 'it' && ticket.status === 'open' && (
          <button onClick={handleResolve} style={{ marginRight: '10px' }}>
            ✅ Resolve Ticket
          </button>
        )}

        {userRole === 'employee' && ticket.status === 'resolved' && (
          <>
            <button onClick={handleConfirm} style={{ marginRight: '10px' }}>
              ✅ Confirm Resolution
            </button>
            <button onClick={handleReopen}>
              ❌ Reopen Ticket
            </button>
          </>
        )}
      </div>

    </div>
  );
}

export default TicketCard;
