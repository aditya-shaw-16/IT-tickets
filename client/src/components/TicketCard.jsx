function TicketCard({ ticket, userRole }) {
  const handleResolve = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${ticket.id}/resolve`, {
        method: 'PATCH',
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error resolving ticket:', err);
    }
  };

  const handleConfirm = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${ticket.id}/confirm`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const errorData = await res.json();
        console.error("confirm failed:", errorData);
      }
    } catch (err) {
      console.error('Error confirming ticket:', err);
    }
  };

  const handleDeny = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${ticket.id}/deny`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const errorData = await res.json();
        console.error("Deny failed:", errorData);
      }
    } catch (err) {
      console.error('Error denying ticket:', err);
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${ticket.id}/priority`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const errorData = await res.json();
        console.error("Priority update failed:", errorData);
      }
    } catch (err) {
      console.error("Priority update error:", err);
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

      {/* IT-specific priority dropdown */}
      {userRole === 'it' && ticket.status === 'open' && (
        <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
          <label style={{ marginRight: '10px' }}>Set Priority:</label>
          <select value={ticket.priority} onChange={handlePriorityChange}>
            <option value="P0">P0 (Same Day)</option>
            <option value="P1">P1 (Next Day)</option>
            <option value="P2">P2 (Next to Next Day)</option>
          </select>
        </div>
      )}

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
            <button onClick={handleDeny}>
              ❌ Deny
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default TicketCard;