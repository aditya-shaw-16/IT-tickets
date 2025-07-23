import { useState } from "react";
import { toast } from "react-toastify";

function DeleteUser() {
  const [email, setEmail] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:4000/api/admin/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("User deleted successfully!");
        setEmail("");
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Delete User</h2>
      <form onSubmit={handleDelete} style={{ maxWidth: "400px" }}>
        <input
          type="email"
          name="email"
          placeholder="Enter User's Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Delete User
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  marginBottom: "1rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const buttonStyle = {
  padding: "0.75rem 1.5rem",
  backgroundColor: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default DeleteUser;
