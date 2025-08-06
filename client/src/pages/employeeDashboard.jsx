import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TicketCard from "../components/TicketCard";
import Navbar from "../components/navbar";
import AlertBox from "../components/AlertBox";

function EmployeeDashboard() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setTickets(data.tickets);
      } else {
        toast.error(data.error || "Failed to fetch tickets");
      }
    } catch (err) {
      console.error("Fetch tickets error:", err);
      toast.error("Error fetching tickets");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const confirmTicket = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/${id}/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Ticket confirmed successfully");
        fetchTickets(); // refresh list
      } else {
        toast.error(data.error || "Failed to confirm ticket");
      }
    } catch (err) {
      console.error("Confirm error:", err);
      toast.error("Error confirming ticket");
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h2>Your Tickets</h2>
        <button
          onClick={() => navigate("/raiseTicket")}
          style={{ marginBottom: "1rem", padding: "8px 16px" }}
        >
          Raise New Ticket
        </button>

        {/* Optional alert for resolved tickets (keep or remove as needed) */}
        {tickets
          .filter((t) => t.status === "resolved")
          .map((t) => (
            <AlertBox
              key={t.id}
              type="info"
              message={
                <>
                  Ticket <strong>{t.subject}</strong> has been resolved.{" "}
                  <button onClick={() => confirmTicket(t.id)} style={{ marginLeft: "10px" }}>
                    Confirm
                  </button>
                </>
              }
            />
          ))}

        {tickets.filter(t => t.status === 'open' || t.status === 'resolved').length === 0 ? (
          <p>No Active Tickets.</p>
        ):(
          tickets
            .filter(t => t.status === 'open' || t.status === 'resolved')
            .map(t =>(
              <TicketCard key={t.id} ticket={t} userRole="employee" />
            ))
        )}
      </div>
    </>
  );
}

export default EmployeeDashboard;
