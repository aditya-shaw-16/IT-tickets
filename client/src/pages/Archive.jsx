import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import AlertBox from "../components/AlertBox";

function Archive() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchArchivedTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tickets/archive`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) setTickets(data.tickets);
        else console.error(data.error);
      } catch (err) {
        console.error("Error fetching archived tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArchivedTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const term = searchTerm.toLowerCase();
    return (
      ticket.employeeId?.toString().includes(term) ||
      ticket.employeeName?.toLowerCase().includes(term) ||
      ticket.employeeEmail?.toLowerCase().includes(term)
    );
  });


  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Archived Tickets</h2>

        <input
          type="text"
          placeholder="Search by Name/Email/employee code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            marginBottom: "1.5rem",
            padding: "0.5rem 0.75rem",
            width: "300px",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        />

        {loading ? (
          <AlertBox type="info" message="Loading archived tickets..." />
        ) : filteredTickets.length === 0 ? (
          <AlertBox type="warning" message="No archived tickets found." />
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "Arial, sans-serif",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th style={thStyle}>Employee Code</th>
                <th style={thStyle}>Employee Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Archived On</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    transition: "background-color 0.2s",
                    cursor: "default",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e0f2fe")
                  }
                  onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? "#ffffff" : "#f9fafb")
                  }
                >
                  <td style={tdStyle}>{ticket.employeeId || "N/A"}</td>
                  <td style={tdStyle}>{ticket.employeeName || "N/A"}</td>
                  <td style={tdStyle}>{ticket.employeeEmail || "N/A"}</td>
                  <td style={tdStyle}>{ticket.subject}</td>
                  <td style={tdStyle}>{ticket.description}</td>
                  <td style={tdStyle}>
                    {ticket.archivedAt
                      ? new Date(ticket.archivedAt).toLocaleDateString()
                      : "N/A"}
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

const thStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "2px solid #e2e8f0",
  fontWeight: "bold",
  fontSize: "15px",
  color: "#1e293b",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "14px",
  color: "#334155",
};

export default Archive;
