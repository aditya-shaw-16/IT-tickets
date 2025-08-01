import { useState } from "react";
import { toast } from "react-toastify";

function NewUser() {
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Enter your email first");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent to your email!");
        setOtpSent(true);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.otp) {
      toast.error("Enter the OTP sent to your email");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          otp: formData.otp,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created successfully!");
        setFormData({
          employeeId: "",
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          otp: "",
        });
        setOtpSent(false);
      } else {
        toast.error(data.error || "Failed to create account");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: "1.5rem" }}>Create a New Account</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", width: "100%" }}>
        <input
          type="text"
          name="employeeId"
          placeholder="Employee ID"
          value={formData.employeeId}
          onChange={handleChange}
          required
          style={inputStyle}
        />
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
        <button
          type="button"
          onClick={handleSendOtp}
          style={{ ...buttonStyle, backgroundColor: "#3b82f6", marginBottom: "1rem" }}
        >
          {otpSent ? "Resend OTP" : "Send OTP"}
        </button>

        <input
          type="text"
          name="otp"
          placeholder="Enter OTP"
          value={formData.otp}
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Register</button>
      </form>

      <p style={{ marginTop: "1rem" }}>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  );
}

const containerStyle = {
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  marginBottom: "1rem",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "1rem",
};

const buttonStyle = {
  width: "100%",
  padding: "0.75rem",
  backgroundColor: "#16a34a",
  color: "#fff",
  fontWeight: "bold",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default NewUser;
