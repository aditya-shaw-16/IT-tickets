import { useState } from "react";
import { toast } from "react-toastify";

function CreateUser() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "EMPLOYEE",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:4000/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("User created successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "EMPLOYEE",
        });
      } else {
        toast.error(data.error || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Create New User</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="EMPLOYEE">EMPLOYEE</option>
          <option value="IT">IT</option>
        </select>
        <button type="submit" style={buttonStyle}>
          Create User
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
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default CreateUser;
