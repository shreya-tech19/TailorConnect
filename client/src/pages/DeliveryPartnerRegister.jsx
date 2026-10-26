import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function DeliveryPartnerRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    city: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await API.post(
        "/delivery-partners/register",
        formData
      );

      setMessage(
        response.data.message ||
          "Registration successful."
      );

      setTimeout(() => {
        navigate("/delivery-login");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fa",
        padding: "30px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#ffffff",
          padding: "35px",
          borderRadius: "14px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Delivery Partner Registration
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            marginBottom: "28px",
          }}
        >
          Join TailorConnect as a delivery partner
        </p>

        {message && (
          <div
            style={{
              background: "#e8f7ee",
              color: "#1b7a43",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "18px",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#fdecec",
              color: "#c62828",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "18px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label>City</label>

            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter your city"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background: "#111827",
              color: "#ffffff",
              fontSize: "16px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "22px",
          }}
        >
          Already registered?{" "}
          <Link
            to="/delivery-login"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "7px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  boxSizing: "border-box",
};

export default DeliveryPartnerRegister;