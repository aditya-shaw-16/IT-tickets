import { useEffect, useState } from "react";
import TicketCard from "../components/TicketCard";
import Navbar from "../components/navbar";
import { toast } from "react-toastify";

function EmployeeTickets() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
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

    fetchTickets();
  }, []);

  return (
    <>
      <Navbar />
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
        <h2>My Tickets</h2>
        {tickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} userRole="employee" />
          ))
        )}
      </div>
    </>
  );
}

export default EmployeeTickets;
