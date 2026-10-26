
import "./TailorLogin.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function TailorLogin() {
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
        "/tailors/login",
        formData
      );

      localStorage.setItem(
        "tailorToken",
        response.data.token
      );

      localStorage.setItem(
        "tailor",
        JSON.stringify(response.data.tailor)
      );

      navigate("/tailor-dashboard");
    } catch (error) {
      console.error("TAILOR LOGIN ERROR:", error);

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

      const result = await API.post(
        "/tailors/google-login",
        {
          credential: response.credential,
        }
      );

      localStorage.setItem(
        "tailorToken",
        result.data.token
      );

      localStorage.setItem(
        "tailor",
        JSON.stringify(result.data.tailor)
      );

      navigate("/tailor-dashboard");
    } catch (error) {
      console.error("TAILOR GOOGLE LOGIN ERROR:", error);

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

    if (!clientId) {
      console.error(
        "VITE_GOOGLE_CLIENT_ID is missing."
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

    if (initializeGoogle()) {
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");

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
    <div className="tailor-login-page">

      <div className="tailor-login-card">

        {/* Header */}
        <div className="tailor-login-header">

          <div className="tailor-login-icon">
            ✂
          </div>

          <p className="tailor-login-eyebrow">
            TAILORCONNECT FOR TAILORS
          </p>

          <h1>
            Welcome <span>Back</span>
          </h1>

          <p className="tailor-login-subtitle">
            Sign in to manage your stitching orders,
            portfolio and tailor profile.
          </p>

        </div>

        {/* Google Login */}
        <div className="tailor-google-section">

          <div
            ref={googleButtonRef}
            className="tailor-google-button"
          />

          {googleLoading && (
            <p className="tailor-login-status">
              Connecting to Google...
            </p>
          )}

        </div>

        {/* Divider */}
        <div className="tailor-login-divider">
          <span>or continue with email</span>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="tailor-login-message">
            {errorMessage}
          </div>
        )}

        {/* Email Login */}
        <form
          className="tailor-login-form"
          onSubmit={handleSubmit}
        >

          <div className="tailor-form-group">
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
              required
            />
          </div>

          <div className="tailor-form-group">
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
              required
            />
          </div>

          <button
            type="submit"
            className="tailor-login-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Register */}
        <p className="tailor-login-register">
          Don't have a tailor account?
          <Link to="/tailor-register">
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default TailorLogin;
