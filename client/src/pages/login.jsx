import { useState } from "react";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Save token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ Redirect based on role
        if (data.user.role === "EMPLOYEE") {
          window.location.href = "/myDashboard";
        } else if (data.user.role === "IT") {
          window.location.href = "/dashboard";
        } else {
          toast.error("Unauthorized role");
        }
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An error occurred during login");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
          <p style={{ marginTop: '0.5rem' }}>
            <a href="/forgotPassword" style={{ color: '#007bff', textDecoration: 'none' }}>
              Forgot Password?
            </a>
          </p>

        </div>

        <button type="submit" style={{ padding: "8px 16px" }}>
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
