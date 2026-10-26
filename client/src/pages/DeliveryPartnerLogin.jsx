import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function DeliveryPartnerLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] =
    useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post(
        "/delivery-partners/login",
        formData
      );

      localStorage.setItem(
        "deliveryToken",
        response.data.token
      );

      localStorage.setItem(
        "deliveryPartner",
        JSON.stringify(
          response.data.deliveryPartner
        )
      );

      navigate("/delivery-dashboard");
    } catch (error) {
      console.error(
        "DELIVERY LOGIN ERROR:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Login failed."
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f5f3",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "35px",
          background: "#ffffff",
          borderRadius: "18px",
          boxShadow:
            "0 15px 40px rgba(53,39,45,0.08)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "1.5px",
            fontWeight: "700",
            color: "#9a8d91",
          }}
        >
          TAILORCONNECT DELIVERY
        </p>

        <h1
          style={{
            color: "#35272d",
            marginBottom: "8px",
          }}
        >
          Delivery Partner Login
        </h1>

        <p
          style={{
            color: "#766a6e",
            fontSize: "14px",
          }}
        >
          Manage garment pickups and deliveries.
        </p>

        {errorMessage && (
          <p
            style={{
              color: "#b42318",
              fontSize: "13px",
            }}
          >
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "16px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "9px",
              background: "#35272d",
              color: "#ffffff",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
            fontSize: "13px",
          }}
        >
          New delivery partner?{" "}
          <Link to="/delivery-register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default DeliveryPartnerLogin;