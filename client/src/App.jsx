
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import OrderConfirmation from "./pages/OrderConfirmation";
import Navbar from "./components/Navbar";
import PlaceOrder from "./pages/PlaceOrder";
import Home from "./pages/Home";
import login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TailorProfile from "./pages/TailorProfile";
import BookAppointment from "./pages/BookAppointment";
import CustomerDashboard from "./pages/CustomerDashboard";
import Orders from "./pages/Orders";
import TailorLogin from "./pages/TailorLogin";
import TailorRegister from "./pages/TailorRegister";
import TailorDashboard from "./pages/TailorDashboard";
import FindTailors from "./pages/FindTailors";
import DeliveryPartnerLogin from "./pages/DeliveryPartnerLogin";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import DeliveryPartnerRegister from "./pages/DeliveryPartnerRegister";

function AppContent() {
  const location = useLocation();

  // Hide navbar on login, registration and workspace pages
  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/signup",
    "/tailor-login",
    "/tailor-register",
    "/tailor-dashboard",
    "/delivery-login",
    "/delivery-register",
    "/delivery-dashboard",
    "/admin-login",
    "/admin-dashboard",
  ];

  const hideNavbar = hideNavbarRoutes.some(
    (route) =>
      location.pathname === route ||
      location.pathname.startsWith(route + "/")
  );

  // Automatically scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {/* Show navbar only on public/customer pages */}
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* ================= CUSTOMER / PUBLIC ================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/find-tailor"
          element={<FindTailors />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/customer-dashboard"
          element={<CustomerDashboard />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* ================= TAILOR PROFILE / CUSTOMER ORDER ================= */}

        <Route
          path="/tailor/:id"
          element={<TailorProfile />}
        />

        <Route
          path="/place-order/:id"
          element={<PlaceOrder />}
        />

        <Route
          path="/book/:id"
          element={<BookAppointment />}
        />

        <Route
          path="/order-confirmation"
          element={<OrderConfirmation />}
        />

        {/* ================= TAILOR AUTHENTICATION ================= */}

        <Route
          path="/tailor-login"
          element={<TailorLogin />}
        />

        <Route
          path="/tailor-register"
          element={<TailorRegister />}
        />

        {/* ================= TAILOR WORKSPACE ================= */}

        <Route
          path="/tailor-dashboard"
          element={<TailorDashboard />}
        />

        {/* ================= DELIVERY PARTNER ================= */}

        <Route
          path="/delivery-login"
          element={<DeliveryPartnerLogin />}
        />

        <Route
          path="/delivery-dashboard"
          element={<DeliveryDashboard />}
        />

        <Route
          path="/delivery-register"
          element={<DeliveryPartnerRegister />}
        />

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />
      </Routes>
    </>
  );
}

function App() {
  return <AppContent />;
}

export default App;
