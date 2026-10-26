import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrorMessage("");
  };

  // ===============================
  // EMAIL + PASSWORD LOGIN
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await API.post(
        "/customers/login",
        formData
      );

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "customer",
        JSON.stringify(response.data.customer)
      );

      navigate("/");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // GOOGLE LOGIN
  // ===============================
  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      setErrorMessage("Google login was not completed.");
      return;
    }

    try {
      setGoogleLoading(true);
      setErrorMessage("");

      // Send Google's ID token to our backend
      const result = await API.post(
        "/customers/google-login",
        {
          credential: response.credential,
        }
      );

      // Store JWT token
      localStorage.setItem(
        "token",
        result.data.token
      );

      // Store customer information
      localStorage.setItem(
        "customer",
        JSON.stringify(result.data.customer)
      );

      // Login successful
      navigate("/");

    } catch (error) {
      console.error("Google Login Error:", error);

      setErrorMessage(
        error.response?.data?.message ||
        "Google login failed. Please try again."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

// ===============================
// INITIALIZE GOOGLE BUTTON
// ===============================
useEffect(() => {
  const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID;
      console.log("GOOGLE CLIENT ID:", clientId);

  if (!clientId) {
      console.error(
          "VITE_GOOGLE_CLIENT_ID is missing from client .env"
      );

      setErrorMessage(
          "Google Login is not configured correctly."
      );

      return;
  }

  const initializeGoogle = () => {
      if (
          !window.google ||
          !window.google.accounts ||
          !googleButtonRef.current
      ) {
          return false;
      }

      // Clear previous Google button
      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
              type: "standard",
              theme: "outline",
              size: "large",
              text: "continue_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 330,
          }
      );

      return true;
  };


  // Google script already loaded
  if (initializeGoogle()) {
      return;
  }


  // Load Google Identity Services
  const existingScript =
      document.querySelector(
          'script[src="https://accounts.google.com/gsi/client"]'
      );

  if (!existingScript) {
      const script =
          document.createElement("script");

      script.src =
          "https://accounts.google.com/gsi/client";

      script.async = true;
      script.defer = true;

      script.onload = () => {
          initializeGoogle();
      };

      document.head.appendChild(script);
  } else {
      existingScript.addEventListener(
          "load",
          initializeGoogle
      );
  }

  // Small retry in case Google is already loading
  const interval = setInterval(() => {
      if (initializeGoogle()) {
          clearInterval(interval);
      }
  }, 200);

  return () => {
      clearInterval(interval);
  };

}, []);
  return (
    <div className="login-page">

      <div className="login-card">

        {/* Header */}
        <div className="login-header">

          <div className="login-icon">
            ✂
          </div>

          <p className="login-eyebrow">
            WELCOME TO TAILORCONNECT
          </p>

          <h1>
            Welcome <span>Back</span>
          </h1>

          <p className="login-subtitle">
            Sign in to manage your stitching orders and
            stay connected with your tailor.
          </p>

        </div>

        {/* Google Login */}
        <div className="google-section">

          <div
            ref={googleButtonRef}
            className="google-button-wrapper"
          />

          {googleLoading && (
            <p className="login-status">
              Connecting to Google...
            </p>
          )}

        </div>

        {/* Divider */}
        <div className="login-divider">
          <span>
            or continue with email
          </span>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="login-message">
            {errorMessage}
          </div>
        )}

        {/* Email Login */}
        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

        {/* Register */}
        <div className="login-register">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create an account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;