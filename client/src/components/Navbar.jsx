import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [tailor, setTailor] = useState(null);

  const updateAuthState = () => {
    const storedCustomer = localStorage.getItem("customer");
    const storedTailor = localStorage.getItem("tailor");

    setCustomer(
      storedCustomer ? JSON.parse(storedCustomer) : null
    );

    setTailor(
      storedTailor ? JSON.parse(storedTailor) : null
    );
  };

  useEffect(() => {
    updateAuthState();
  }, [location]);

  const handleLogout = () => {
    if (customer) {
      localStorage.removeItem("customer");
      localStorage.removeItem("token");
      setCustomer(null);
    }

    if (tailor) {
      localStorage.removeItem("tailor");
      localStorage.removeItem("tailorToken");
      setTailor(null);
    }

    navigate("/");
  };

  const loggedInUser = customer || tailor;

  const userName = loggedInUser
    ? loggedInUser.fullName ||
      loggedInUser.name ||
      loggedInUser.ownerName ||
      "Account"
    : "";

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        <span className="logo-icon">✂</span>
        TailorConnect
      </Link>

      <div className="nav-links">
        <Link
          to="/"
          className={location.pathname === "/" ? "active" : ""}
        >
          Home
        </Link>

        <Link
          to="/find-tailor"
          className={
            location.pathname === "/find-tailor"
              ? "active"
              : ""
          }
        >
          Find Tailor
        </Link>

        <Link
          to="/orders"
          className={
            location.pathname === "/orders"
              ? "active"
              : ""
          }
        >
          My Orders
        </Link>

        <Link to="/about">About Us</Link>
      </div>

      <div className="nav-actions">

        {loggedInUser ? (
          <>
            <span className="nav-user-name">
              {userName}
            </span>

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        )}

      </div>

    </nav>
  );
}

export default Navbar;