import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./DeliveryDashboard.css";

function DeliveryDashboard() {
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [otpValues, setOtpValues] = useState({});

  useEffect(() => {
    const storedPartner =
      localStorage.getItem("deliveryPartner");

    if (!storedPartner) {
      navigate("/delivery-login");
      return;
    }

    try {
      setPartner(JSON.parse(storedPartner));
      fetchOrders();
    } catch (error) {
      console.error("DELIVERY PARTNER DATA ERROR:", error);

      localStorage.removeItem("deliveryPartner");
      localStorage.removeItem("deliveryToken");

      navigate("/delivery-login");
    }
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await API.get("/delivery/orders");

      setOrders(response.data || []);
    } catch (error) {
      console.error("FETCH DELIVERY ORDERS ERROR:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load delivery orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (orderId, action, successMessage) => {
    try {
      setActionLoadingId(orderId);
      setMessage("");
      setErrorMessage("");

      await action();

      setMessage(successMessage);

      await fetchOrders();
    } catch (error) {
      console.error("DELIVERY ACTION ERROR:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to update delivery."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const acceptDelivery = (orderId) => {
    return runAction(
      orderId,
      () =>
        API.patch(
          `/delivery/orders/${orderId}/accept`
        ),
      "Delivery accepted successfully."
    );
  };

  const markReached = (orderId) => {
    return runAction(
      orderId,
      () =>
        API.patch(
          `/delivery/orders/${orderId}/reached`
        ),
      "Customer marked as reached."
    );
  };

  const verifyOtp = async (orderId) => {
    const otp = otpValues[orderId] || "";

    if (!/^\d{4}$/.test(otp)) {
      setErrorMessage(
        "Please enter the 4-digit delivery OTP."
      );
      return;
    }

    await runAction(
      orderId,
      () =>
        API.patch(
          `/delivery/orders/${orderId}/verify-otp`,
          {
            otp,
          }
        ),
      "OTP verified. Delivery marked as delivered."
    );

    setOtpValues((previous) => ({
      ...previous,
      [orderId]: "",
    }));
  };

  const completeDelivery = (orderId) => {
    return runAction(
      orderId,
      () =>
        API.patch(
          `/delivery/orders/${orderId}/complete`
        ),
      "Delivery completed successfully."
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("deliveryToken");
    localStorage.removeItem("deliveryPartner");

    navigate("/delivery-login");
  };

  const availableOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "Ready for Delivery"
      ),
    [orders]
  );

  const activeOrders = useMemo(
    () =>
      orders.filter((order) =>
        [
          "Out for Delivery",
          "Reached Customer",
        ].includes(order.status)
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter((order) =>
        [
          "Delivered",
          "Completed",
        ].includes(order.status)
      ),
    [orders]
  );

  const todayOrders = useMemo(() => {
    const today = new Date();

    return orders.filter((order) => {
      if (!order.updatedAt && !order.createdAt) {
        return false;
      }

      const date = new Date(
        order.updatedAt || order.createdAt
      );

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    });
  }, [orders]);

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Ready for Delivery":
        return "delivery-status ready";

      case "Out for Delivery":
        return "delivery-status active";

      case "Reached Customer":
        return "delivery-status reached";

      case "Delivered":
      case "Completed":
        return "delivery-status completed";

      default:
        return "delivery-status";
    }
  };

  const getProgressStep = (status) => {
    switch (status) {
      case "Ready for Delivery":
        return 1;

      case "Out for Delivery":
        return 2;

      case "Reached Customer":
        return 3;

      case "Delivered":
      case "Completed":
        return 4;

      default:
        return 1;
    }
  };

  const renderProgress = (status) => {
    const currentStep = getProgressStep(status);

    const steps = [
      "Ready",
      "Accepted",
      "Reached",
      "Delivered",
    ];

    return (
      <div className="delivery-progress">
        {steps.map((step, index) => {
          const stepNumber = index + 1;

          return (
            <div
              className="progress-item"
              key={step}
            >
              <div
                className={`progress-dot ${
                  stepNumber <= currentStep
                    ? "completed"
                    : ""
                }`}
              >
                {stepNumber <= currentStep
                  ? "✓"
                  : stepNumber}
              </div>

              <span>{step}</span>

              {index < steps.length - 1 && (
                <div
                  className={`progress-line ${
                    stepNumber < currentStep
                      ? "completed"
                      : ""
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDeliveryAction = (order) => {
    const busy =
      actionLoadingId === order._id;

    if (
      order.status === "Ready for Delivery"
    ) {
      return (
        <button
          className="delivery-primary-button"
          onClick={() =>
            acceptDelivery(order._id)
          }
          disabled={busy}
        >
          {busy
            ? "Accepting..."
            : "Accept Delivery"}
        </button>
      );
    }

    if (order.status === "Out for Delivery") {
      return (
        <button
          className="delivery-primary-button"
          onClick={() =>
            markReached(order._id)
          }
          disabled={busy}
        >
          {busy
            ? "Updating..."
            : "Mark Reached Customer"}
        </button>
      );
    }

    if (order.status === "Reached Customer") {
      return (
        <div className="otp-section">
          <div className="otp-heading">
            <span className="otp-icon">
              🔐
            </span>

            <div>
              <strong>
                Delivery OTP
              </strong>

              <p>
                Ask the customer for their
                4-digit OTP.
              </p>
            </div>
          </div>

          <div className="otp-controls">
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={
                otpValues[order._id] || ""
              }
              onChange={(event) => {
                const value =
                  event.target.value.replace(
                    /\D/g,
                    ""
                  );

                setOtpValues((previous) => ({
                  ...previous,
                  [order._id]: value,
                }));
              }}
            />

            <button
              className="delivery-primary-button"
              onClick={() =>
                verifyOtp(order._id)
              }
              disabled={busy}
            >
              {busy
                ? "Verifying..."
                : "Verify OTP"}
            </button>
          </div>
        </div>
      );
    }

    if (order.status === "Delivered") {
      return (
        <button
          className="delivery-primary-button"
          onClick={() =>
            completeDelivery(order._id)
          }
          disabled={busy}
        >
          {busy
            ? "Completing..."
            : "Complete Delivery"}
        </button>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="delivery-dashboard">
        <div className="delivery-loading">
          <div className="delivery-spinner" />

          <p>
            Loading Delivery Workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-dashboard">

      {/* ======================================
          TOP BAR
      ======================================= */}

      <header className="delivery-topbar">

        <div className="delivery-brand">

          <div className="delivery-brand-icon">
            ✂
          </div>

          <div>
            <h2>TailorConnect</h2>
            <span>
              Delivery Partner
            </span>
          </div>

        </div>

        <div className="delivery-topbar-right">

          <div className="delivery-user">

            <div className="delivery-avatar">
              {(
                partner?.name ||
                "D"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {partner?.name ||
                  "Delivery Partner"}
              </strong>

              <span>
                {partner?.city ||
                  "Delivery Operations"}
              </span>
            </div>

          </div>

          <button
            className="delivery-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* ======================================
          MAIN
      ======================================= */}

      <main className="delivery-main">

        <section className="delivery-welcome">

          <div>
            <p className="delivery-eyebrow">
              DELIVERY WORKSPACE
            </p>

            <h1>
              Good to see you,{" "}
              {partner?.name
                ?.split(" ")[0] ||
                "Partner"}
            </h1>

            <p>
              Manage your garment pickups,
              deliveries and customer
              handovers from one place.
            </p>
          </div>

          <div className="delivery-online">
            <span />
            Available for deliveries
          </div>

        </section>

        {/* ======================================
            MESSAGES
        ======================================= */}

        {message && (
          <div className="delivery-message success">
            ✓ {message}
          </div>
        )}

        {errorMessage && (
          <div className="delivery-message error">
            {errorMessage}
          </div>
        )}

        {/* ======================================
            STATISTICS
        ======================================= */}

        <section className="delivery-stats">

          <div className="delivery-stat-card">
            <div className="stat-icon new">
              +
            </div>

            <div>
              <span>
                New Deliveries
              </span>

              <strong>
                {availableOrders.length}
              </strong>
            </div>
          </div>

          <div className="delivery-stat-card">
            <div className="stat-icon active">
              🚚
            </div>

            <div>
              <span>
                Active Delivery
              </span>

              <strong>
                {activeOrders.length}
              </strong>
            </div>
          </div>

          <div className="delivery-stat-card">
            <div className="stat-icon completed">
              ✓
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {completedOrders.length}
              </strong>
            </div>
          </div>

          <div className="delivery-stat-card">
            <div className="stat-icon today">
              ★
            </div>

            <div>
              <span>
                Today's Activity
              </span>

              <strong>
                {todayOrders.length}
              </strong>
            </div>
          </div>

        </section>

        {/* ======================================
            ACTIVE DELIVERY
        ======================================= */}

        {activeOrders.length > 0 && (
          <section className="delivery-section">

            <div className="delivery-section-heading">

              <div>
                <p className="delivery-section-label">
                  CURRENT TASK
                </p>

                <h2>
                  Active Delivery
                </h2>

                <p>
                  Complete the current customer
                  handover before taking another
                  delivery.
                </p>
              </div>

              <span className="delivery-count active-count">
                {activeOrders.length}
              </span>

            </div>

            <div className="active-delivery-list">

              {activeOrders.map((order) => (
                <article
                  className="active-delivery-card"
                  key={order._id}
                >

                  <div className="active-delivery-top">

                    <div>

                      <span className="delivery-order-number">
                        ORDER #
                        {order._id
                          ?.slice(-6)
                          .toUpperCase()}
                      </span>

                      <h3>
                        {order.garment ||
                          order.service ||
                          "Custom Stitching"}
                      </h3>

                    </div>

                    <span
                      className={getStatusClass(
                        order.status
                      )}
                    >
                      {order.status}
                    </span>

                  </div>

                  <div className="customer-delivery-info">

  <div>
    <span>PICKUP FROM TAILOR</span>

    <strong>
      {order.tailor?.shopName ||
        "Tailor Shop"}
    </strong>

    <small>
      {order.tailor?.ownerName || ""}
    </small>

    <p>
      {order.tailor?.address ||
        "Tailor address not available"}

      {order.tailor?.city
        ? `, ${order.tailor.city}`
        : ""}
    </p>
  </div>

  <div>
    <span>CUSTOMER</span>

    <strong>
      {order.customer?.fullName ||
        order.customerName ||
        "Customer"}
    </strong>

    <small>
      {order.customer?.phone ||
        order.phone ||
        "Phone not available"}
    </small>
  </div>

  <div>
    <span>DELIVER TO CUSTOMER</span>

    <strong>
      {order.pickupAddress ||
        order.customer?.address ||
        "Customer address not available"}
    </strong>

    <p>
      {order.customer?.city || ""}
      {order.customer?.pincode
        ? ` - ${order.customer.pincode}`
        : ""}
    </p>
  </div>

</div>

                  {renderProgress(
                    order.status
                  )}

                  <div className="active-delivery-action">
                    {renderDeliveryAction(order)}
                  </div>

                </article>
              ))}

            </div>

          </section>
        )}

        {/* ======================================
            NEW DELIVERIES
        ======================================= */}

        <section className="delivery-section">

          <div className="delivery-section-heading">

            <div>
              <p className="delivery-section-label">
                AVAILABLE ORDERS
              </p>

              <h2>
                New Delivery Orders
              </h2>

              <p>
                Orders that are ready to be
                collected and delivered.
              </p>
            </div>

            <span className="delivery-count">
              {availableOrders.length}
            </span>

          </div>

          {availableOrders.length === 0 ? (

            <div className="delivery-empty">

              <div className="empty-icon">
                ✓
              </div>

              <h3>
                No new deliveries
              </h3>

              <p>
                New garment delivery orders
                will appear here when they are
                ready.
              </p>

            </div>

          ) : (

            <div className="delivery-orders-grid">

              {availableOrders.map((order) => (
                <article
                  className="delivery-order-card"
                  key={order._id}
                >

                  <div className="delivery-card-header">

                    <div>

                      <span className="delivery-order-number">
                        ORDER #
                        {order._id
                          ?.slice(-6)
                          .toUpperCase()}
                      </span>

                      <h3>
                        {order.garment ||
                          order.service ||
                          "Custom Stitching"}
                      </h3>

                    </div>

                    <span
                      className={getStatusClass(
                        order.status
                      )}
                    >
                      Ready
                    </span>

                  </div>

                  <div className="delivery-card-details">

                    <div>
                      <span>
                        CUSTOMER
                      </span>

                      <strong>
                        {order.customerName ||
                          order.customer?.fullName ||
                          "Customer"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        LOCATION
                      </span>

                      <strong>
                        {order.pickupAddress ||
                          "Address not available"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        ORDER DATE
                      </span>

                      <strong>
                        {formatDate(
                          order.createdAt
                        )}
                      </strong>
                    </div>

                  </div>

                  <div className="delivery-card-footer">

                    <span>
                      Garment ready for delivery
                    </span>

                    {renderDeliveryAction(
                      order
                    )}

                  </div>

                </article>
              ))}

            </div>

          )}

        </section>

        {/* ======================================
            COMPLETED
        ======================================= */}

        {completedOrders.length > 0 && (
          <section className="delivery-section completed-section">

            <div className="delivery-section-heading">

              <div>
                <p className="delivery-section-label">
                  DELIVERY HISTORY
                </p>

                <h2>
                  Recently Completed
                </h2>
              </div>

              <span className="delivery-count completed-count">
                {completedOrders.length}
              </span>

            </div>

            <div className="completed-list">

              {completedOrders
                .slice(0, 5)
                .map((order) => (
                  <div
                    className="completed-row"
                    key={order._id}
                  >

                    <div className="completed-check">
                      ✓
                    </div>

                    <div className="completed-info">

                      <strong>
                        {order.garment ||
                          order.service ||
                          "Custom Stitching"}
                      </strong>

                      <span>
                        {order.customerName ||
                          order.customer?.fullName ||
                          "Customer"}
                      </span>

                    </div>

                    <span className="completed-status">
                      {order.status}
                    </span>

                  </div>
                ))}

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default DeliveryDashboard;