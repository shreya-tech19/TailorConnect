import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const response = await axios.post(
        "http://localhost:5000/api/admin/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "adminToken",
        response.data.token
      );

      localStorage.setItem(
        "admin",
        JSON.stringify(response.data.admin)
      );

      navigate("/admin-dashboard");
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);
      console.error("ERROR RESPONSE:", error.response);
      console.error("ERROR MESSAGE:", error.message);
    
      setError(
        error.response?.data?.message ||
          error.message ||
          "Admin login failed."
      );
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">

        <h1>TailorConnect</h1>

        <h2>Admin Login</h2>

        {error && (
          <p className="admin-error">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

      </div>
    </div>
  );
}

export default AdminLogin;