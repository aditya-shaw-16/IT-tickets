import { useState } from "react";
import { toast } from "react-toastify";

function DeleteUser() {
  const [formData, setFormData] = useState({
    id: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: formData.id,
          email: formData.email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ User deleted successfully");
        setFormData({ id: "", email: "" });
      } else {
        toast.error(data.error || "❌ Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Something went wrong");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>🗑️ Delete User</h2>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <label style={labelStyle}>Employee ID</label>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            placeholder="Enter Employee ID"
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email"
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>Delete User</button>
        </form>
      </div>
    </div>
  );
}

// 💄 Styles
const pageStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  paddingTop: "2rem",
  paddingBottom: "2rem",
  backgroundColor: "#f9fafb",
};


const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "2rem",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  width: "100%",
  maxWidth: "450px",
};

const titleStyle = {
  fontSize: "1.75rem",
  marginBottom: "1.5rem",
  textAlign: "center",
  color: "#dc2626",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.5rem",
  fontWeight: "bold",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  marginBottom: "1.25rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "1rem",
};

const buttonStyle = {
  width: "100%",
  padding: "0.75rem",
  backgroundColor: "#dc2626",
  color: "#ffffff",
  fontWeight: "bold",
  fontSize: "1rem",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "background 0.2s ease-in-out",
};

export default DeleteUser;
