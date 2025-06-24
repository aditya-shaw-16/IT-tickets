import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/navbar";
import AlertBox from "../components/AlertBox";

function EmployeeDashboard() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/mine`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tickets/${id}/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Ticket confirmed successfully");
        fetchTickets();
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
          onClick={() => navigate("/employee/raise-ticket")}
          style={{ marginBottom: "1rem", padding: "8px 16px" }}
        >
          Raise New Ticket
        </button>

        {tickets
          .filter((t) => t.status === "RESOLVED")
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

        {tickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Subject</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{ticket.subject}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{ticket.status}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {new Date(ticket.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default EmployeeDashboard;
