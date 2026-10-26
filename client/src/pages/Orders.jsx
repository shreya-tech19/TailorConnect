import { useEffect, useState } from "react";
import API from "../services/api";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [message, setMessage] = useState("");
  const [deliveryOtps, setDeliveryOtps] = useState({});
  const [otpLoadingId, setOtpLoadingId] = useState(null);
  const [confirmingAppointmentId, setConfirmingAppointmentId] = useState(null);
  const [homeVisitOtps, setHomeVisitOtps] = useState({});
  const [verifyingHomeVisitId, setVerifyingHomeVisitId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // FETCH CUSTOMER ORDERS
  // ==========================================

  const fetchOrders = async () => {
    try {
      const response = await API.get("/orders");
      setOrders(response.data || []);
    } catch (error) {
      console.error("FETCH ORDERS ERROR:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  
const confirmMeasurementAppointment = async (orderId) => {
  try {
    setConfirmingAppointmentId(orderId);
    setMessage("");

    const response = await API.patch(
      `/orders/${orderId}/measurement-confirm`
    );

    setMessage(
      response.data?.message ||
        "Measurement appointment confirmed successfully."
    );

    await fetchOrders();
  } catch (error) {
    console.error("CONFIRM MEASUREMENT ERROR:", error);

    setMessage(
      error.response?.data?.message ||
        "Unable to confirm measurement appointment."
    );
  } finally {
    setConfirmingAppointmentId(null);
  }
};


  const verifyHomeVisitOtp = async (orderId) => {
    const otp = (homeVisitOtps[orderId] || "").trim();
    if (!/^\d{6}$/.test(otp)) {
      setMessage("Please enter a valid 6-digit home visit OTP.");
      return;
    }

    try {
      setVerifyingHomeVisitId(orderId);
      setMessage("");
      const response = await API.patch(
        `/orders/${orderId}/home-visit-verify`,
        { otp }
      );
      setMessage(response.data?.message || "Home visitor verified successfully.");
      setHomeVisitOtps((previous) => ({ ...previous, [orderId]: "" }));
      await fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to verify home visit OTP.");
    } finally {
      setVerifyingHomeVisitId(null);
    }
  };

  const fetchDeliveryOtp = async (orderId) => {
    try {
      setOtpLoadingId(orderId);
  
      const response = await API.get(
        `/orders/${orderId}/delivery-otp`
      );
  
      setDeliveryOtps((previous) => ({
        ...previous,
        [orderId]: response.data?.otp || "",
      }));
    } catch (error) {
      console.error(
        "FETCH DELIVERY OTP ERROR:",
        error
      );
  
      setMessage(
        error.response?.data?.message ||
          "Unable to load delivery OTP."
      );
    } finally {
      setOtpLoadingId(null);
    }
  };

  // ==========================================
  // LOAD RAZORPAY CHECKOUT
  // ==========================================

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => {
          resolve(true);
        });

        existingScript.addEventListener("error", () => {
          resolve(false);
        });

        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // ==========================================
  // START RAZORPAY PAYMENT
  // ==========================================

  const handlePayment = async (order) => {
    try {
      setPayingId(order._id);
      setMessage("");

      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        setMessage(
          "Unable to load Razorpay. Please check your internet connection and try again."
        );

        setPayingId(null);
        return;
      }

      const response = await API.post(
        `/payments/create-order/${order._id}`
      );

      const {
        key,
        amount,
        currency,
        razorpayOrderId,
        orderId,
      } = response.data;

      const options = {
        key: key,
        amount: amount,
        currency: currency,

        name: "TailorConnect",

        description: `Stitching Order #${orderId}`,

        order_id: razorpayOrderId,

        handler: async function (razorpayResponse) {
          try {
            setMessage("Verifying your payment...");

            const verifyResponse = await API.post(
              "/payments/verify",
              {
                razorpay_payment_id:
                  razorpayResponse.razorpay_payment_id,

                razorpay_order_id:
                  razorpayResponse.razorpay_order_id,

                razorpay_signature:
                  razorpayResponse.razorpay_signature,

                orderId: orderId,
              }
            );

            setMessage(
              verifyResponse.data?.message ||
                "Payment successful. Your order is confirmed."
            );

            await fetchOrders();
          } catch (error) {
            console.error(
              "PAYMENT VERIFICATION ERROR:",
              error
            );

            setMessage(
              error.response?.data?.message ||
                "Payment was received, but verification failed."
            );
          } finally {
            setPayingId(null);
          }
        },

        prefill: {
          name: order.customerName || "",
          contact: order.phone || "",
        },

        theme: {
          color: "#35272d",
        },

        modal: {
          ondismiss: async function () {
            try {
              await API.patch(
                `/payments/failed/${order._id}`
              );

              setMessage(
                "Payment was cancelled. You can try again whenever you're ready."
              );
            } catch (error) {
              console.error(
                "PAYMENT CANCEL ERROR:",
                error
              );

              setMessage("Payment was cancelled.");
            }

            setPayingId(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        async function (response) {
          console.error(
            "RAZORPAY PAYMENT FAILED:",
            response
          );

          try {
            await API.patch(
              `/payments/failed/${order._id}`
            );
          } catch (error) {
            console.error(
              "PAYMENT FAILED UPDATE ERROR:",
              error
            );
          }

          setMessage(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setPayingId(null);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "START PAYMENT ERROR:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to start payment. Please try again."
      );

      setPayingId(null);
    }
  };

  // ==========================================
  // ORDER TRACKING STEPS
  // ==========================================

  const trackingSteps = [
    "Order Placed",
    "Price Confirmed",
    "Pickup Scheduled",
    "Picked Up",
    "Received by Tailor",
    "Stitching in Progress",
    "Quality Check",
    "Ready for Delivery",
    "Out for Delivery",
    "Reached Customer",
    "Delivered",
    "Completed",
  ];

  // ==========================================
  // GET CURRENT TRACKING STEP
  // ==========================================

  const getTrackingStep = (order) => {
    if (!order) {
      return 0;
    }

    switch (order.status) {
      case "Awaiting Tailor Review":
        return 0;

      case "Awaiting Customer Clarification":
        return 0;

      case "Awaiting Customer Confirmation":
        return 1;

      case "Confirmed":
        return 1;

      case "Pickup Scheduled":
        return 2;

      case "Picked Up":
        return 3;

      case "Received by Tailor":
        return 4;

      case "Stitching in Progress":
        return 5;

      case "Quality Check":
        return 6;

      case "Ready for Delivery":
        return 7;

      case "Out for Delivery":
        return 8;

      case "Reached Customer":
        return 9;

      case "Delivered":
        return 10;

      case "Completed":
        return 11;

      default:
        return 0;
    }
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Awaiting Tailor Review":
      case "Awaiting Customer Clarification":
      case "Awaiting Customer Confirmation":
        return "status pending";

      case "Confirmed":
      case "Pickup Scheduled":
      case "Picked Up":
      case "Received by Tailor":
      case "Stitching in Progress":
      case "Quality Check":
      case "Ready for Delivery":
      case "Out for Delivery":
      case "Reached Customer":
        return "status progress";

      case "Delivered":
      case "Completed":
        return "status completed";

      case "Cancelled":
        return "status rejected";

      default:
        return "status progress";
    }
  };

  // ==========================================
  // STATUS MESSAGE
  // ==========================================

  const getStatusMessage = (order) => {
    switch (order.status) {
      case "Awaiting Tailor Review":
        return "⏳ Your stitching request has been sent to the tailor for review.";

      case "Awaiting Customer Clarification":
        return "💬 The tailor needs some clarification before proceeding.";

      case "Awaiting Customer Confirmation":
        return "💰 The tailor has provided the stitching price and estimated completion date. Complete the payment to confirm your order.";

      case "Confirmed":
        return "✅ Your order is confirmed. The pickup and stitching process can now begin.";

      case "Pickup Scheduled":
        return "📦 Your garment pickup has been scheduled.";

      case "Picked Up":
        return "🚚 Your garment has been picked up.";

      case "Received by Tailor":
        return "✂️ Your garment has reached the tailor.";

      case "Stitching in Progress":
        return "🧵 Your outfit is currently being stitched.";

      case "Quality Check":
        return "🔍 Your stitched garment is undergoing quality checking.";

      case "Ready for Delivery":
        return "📦 Your stitched garment is ready for delivery.";

      case "Out for Delivery":
        return "🚚 Your garment is out for delivery.";

      case "Reached Customer":
        return "📍 The delivery partner has reached your location.";

      case "Delivered":
        return "🎉 Your stitched garment has been delivered.";

      case "Completed":
        return "✅ Your stitching order has been completed.";

      case "Cancelled":
        return "This stitching order has been cancelled.";

      default:
        return "🧵 Your stitching order is currently being processed.";
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Not scheduled";
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "Not scheduled";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-header">
          <p className="orders-label">
            STITCHING ORDERS
          </p>

          <h1>My Orders</h1>

          <p>
            Loading your stitching orders...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="orders-page">
      <div className="orders-header">
        <p className="orders-label">
          STITCHING ORDERS
        </p>

        <h1>My Orders</h1>
        


        <p className="orders-subtitle">
          Track your stitching requests and order progress.
        </p>
      </div>

      {message && (
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto 20px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#f5eee9",
            color: "#654e53",
            fontSize: "13px",
          }}
        >
          {message}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">
            🧵
          </div>

          <h2>No Stitching Orders Yet</h2>

          <p>
            You haven't placed any stitching orders yet.
          </p>
        </div>
      ) : (
        <div className="orders-container">
          {orders.map((order) => {
            const isPaid =
              String(
                order.paymentStatus || ""
              ).toLowerCase() === "paid";

            const currentTrackingStep =
              getTrackingStep(order);

            const isTracking =
              trackingOrderId === order._id;

            return (
              <div
                className="order-card"
                key={order._id}
              >
                {/* ==================================
                    ORDER HEADER
                ================================== */}

                <div className="order-header">
                  <div className="order-title">
                    <p className="order-small-label">
                      STITCHING ORDER
                    </p>

                    <h2>
                      {order.garment ||
                        order.service ||
                        "Custom Stitching"}
                    </h2>
                  </div>

                  <span
                    className={getStatusClass(
                      order.status
                    )}
                  >
                    {order.status || "Processing"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                  <div style={{ color: "#65575c", fontSize: "13px" }}>
                    <strong>{order.tailor?.shopName || "Selected Tailor"}</strong>
                    <span style={{ margin: "0 8px" }}>·</span>
                    {order.paymentStatus || "Payment Pending"}
                    {order.stitchingPrice != null && (
                      <><span style={{ margin: "0 8px" }}>·</span>₹{Number(order.stitchingPrice).toLocaleString("en-IN")}</>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-expanded={Boolean(expandedOrderIds[order._id])}
                    onClick={() => setExpandedOrderIds((previous) => ({
                      ...previous,
                      [order._id]: !previous[order._id],
                    }))}
                    style={{ padding: "10px 16px", background: "#35272d", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
                  >
                    {expandedOrderIds[order._id] ? "Hide Details ▲" : "View Details ▼"}
                  </button>
                </div>

                {expandedOrderIds[order._id] && (
                  <>
                {/* ==================================
                    ORDER DETAILS
                ================================== */}

                <div className="order-details">
                  <div className="order-detail">
                    <span className="detail-label">
                      ✂️ Tailor
                    </span>

                    <strong>
                      {order.tailor?.shopName ||
                        "Selected Tailor"}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span className="detail-label">
                      👕 Garment
                    </span>

                    <strong>
                      {order.garment ||
                        order.service ||
                        "Custom Stitching"}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span className="detail-label">
                      🎨 Design
                    </span>

                    <strong>
                      {order.design?.title ||
                        order.designDescription ||
                        "Custom Design"}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span className="detail-label">
                      📏 Measurements
                    </span>

                    <strong>
                      {order.measurements &&
                      Object.keys(order.measurements).length > 0
                        ? `${Object.keys(
                            order.measurements
                          ).length} measurements provided`
                        : order.measurementOption ===
                          "tailor_visit"
                        ? "Measurement assistance requested"
                        : "Not provided"}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span className="detail-label">
                      📅 Pickup Date
                    </span>

                    <strong>
                      {formatDate(
                        order.pickupDate
                      )}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span className="detail-label">
                      💰 Stitching Price
                    </span>

                    <strong>
                      {order.stitchingPrice !== null &&
                      order.stitchingPrice !== undefined
                        ? `₹${Number(
                            order.stitchingPrice
                          ).toLocaleString("en-IN")}`
                        : "Waiting for tailor"}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span className="detail-label">
                      🗓 Completion
                    </span>

                    <strong>
                      {formatDate(
                        order.estimatedCompletionDate
                      )}
                    </strong>
                  </div>

                  <div className="order-detail">
                    <span className="detail-label">
                      💳 Payment
                    </span>

                    <strong>
                      {order.paymentStatus ||
                        "Pending"}
                    </strong>
                  </div>
                </div>

                {/* ==================================
                    STATUS MESSAGE
                ================================== */}

                <div className="order-status-message waiting-message">
                  {getStatusMessage(order)}
                </div>

                {/* ==================================
                    HOME MEASUREMENT UPDATES
                ================================== */}
                
                {order.measurementOption === "tailor_visit" && (
                  <div
                    className="order-address"
                    style={{
                      marginTop: "18px",
                      padding: "20px",
                      borderRadius: "12px",
                      background: "#faf7f5",
                      border: "1px solid #e7ded9",
                    }}
                  >
                    <h3 style={{ marginTop: 0, color: "#35272d" }}>
                      Home Measurement Assistance
                    </h3>
                
                    <p>
                      <strong>Appointment Status:</strong>{" "}
                      {order.measurementVisitStatus || "Pending"}
                    </p>
                
                    <p>
                      <strong>Your Requested Slot:</strong>{" "}
                      {formatDate(order.measurementDate)} —{" "}
                      {order.measurementTime || "Not selected"}
                    </p>
                
                    {order.measurementVisitStatus === "Pending" && (
                      <p>
                        Your request has been sent to the tailor.
                        Waiting for appointment confirmation.
                      </p>
                    )}
                
                    {order.measurementVisitStatus === "Proposed" && (
                      <div>
                        <p>
                          The tailor has proposed a new appointment:
                        </p>
                
                        <p>
                          <strong>
                            {formatDate(order.confirmedMeasurementDate)}
                            {" — "}
                            {order.confirmedMeasurementTime}
                          </strong>
                        </p>
                
                        <button
                          type="button"
                          disabled={confirmingAppointmentId === order._id}
                          onClick={() =>
                            confirmMeasurementAppointment(order._id)
                          }
                          style={{
                            background: "#35272d",
                            color: "#fff",
                            border: "none",
                            borderRadius: "9px",
                            padding: "11px 18px",
                            cursor: "pointer",
                          }}
                        >
                          {confirmingAppointmentId === order._id
                            ? "Confirming..."
                            : "Confirm Proposed Time"}
                        </button>
                      </div>
                    )}
                
                    {order.measurementVisitStatus === "Confirmed" && (
                      <div>
                        <p>
                          Your measurement appointment is confirmed.
                        </p>
                
                        <p>
                          <strong>Date:</strong>{" "}
                          {formatDate(order.confirmedMeasurementDate)}
                        </p>
                
                        <p>
                          <strong>Time:</strong>{" "}
                          {order.confirmedMeasurementTime}
                        </p>
                      </div>
                    )}
                
                    {order.measurementVisitStatus === "Confirmed" &&
                      order.homeVisitVisitorName && (
                      <div style={{ marginTop: "16px" }}>
                        <p>
                          <strong>Assigned Visitor:</strong>{" "}
                          {order.homeVisitVisitorName}
                        </p>

                        {order.homeVisitVerified ? (
                          <p style={{ color: "#047857", fontWeight: 600 }}>
                            ✓ Visitor verified
                          </p>
                        ) : (
                          <div>
                            <p>Enter the 6-digit OTP provided by your assigned visitor.</p>
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              aria-label="Home visit OTP"
                              placeholder="6-digit OTP"
                              value={homeVisitOtps[order._id] || ""}
                              onChange={(event) =>
                                setHomeVisitOtps((previous) => ({
                                  ...previous,
                                  [order._id]: event.target.value.replace(/\D/g, "").slice(0, 6),
                                }))
                              }
                              style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginRight: "10px" }}
                            />
                            <button
                              type="button"
                              disabled={verifyingHomeVisitId === order._id ||
                                (homeVisitOtps[order._id] || "").length !== 6}
                              onClick={() => verifyHomeVisitOtp(order._id)}
                              style={{ padding: "10px 16px", borderRadius: "8px", background: "#35272d", color: "#fff", border: "none" }}
                            >
                              {verifyingHomeVisitId === order._id ? "Verifying..." : "Verify OTP"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {order.measurementVisitStatus === "Completed" && (
                      <div>
                        <p>
                          Your home measurement visit has been completed.
                        </p>
                
                        <p>
                          <strong>Fabric Collected:</strong>{" "}
                          {order.fabricCollected ? "Yes" : "No"}
                        </p>
                
                        {order.fabricCollected ? (
                          <p>
                            Your fabric was collected during the visit.
                          </p>
                        ) : (
                          <p>
                            Your fabric still needs to be collected
                            separately.
                          </p>
                        )}
                
                        {order.fabricCollectionNote && (
                          <p>
                            <strong>Tailor's Note:</strong>{" "}
                            {order.fabricCollectionNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {order.status === "Reached Customer" &&
  !order.deliveryOtpVerified && (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        borderRadius: "12px",
        background: "#f8f3ef",
        border: "1px solid #e4d8d0",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          fontSize: "11px",
          fontWeight: "700",
          letterSpacing: "1px",
          color: "#7a6268",
        }}
      >
        DELIVERY OTP
      </p>

      <h3
        style={{
          margin: "0 0 8px",
          color: "#35272d",
        }}
      >
        Your delivery partner has arrived
      </h3>

      <p
        style={{
          margin: "0 0 16px",
          color: "#6d5c61",
          fontSize: "13px",
        }}
      >
        Show this OTP to the delivery partner to
        confirm delivery.
      </p>

      {deliveryOtps[order._id] ? (
        <div
          style={{
            display: "inline-block",
            padding: "12px 24px",
            borderRadius: "10px",
            background: "#35272d",
            color: "#fff",
            fontSize: "28px",
            fontWeight: "700",
            letterSpacing: "8px",
          }}
        >
          {deliveryOtps[order._id]}
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            fetchDeliveryOtp(order._id)
          }
          disabled={
            otpLoadingId === order._id
          }
          style={{
            border: "none",
            borderRadius: "9px",
            padding: "11px 18px",
            background: "#35272d",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: "12px",
            fontWeight: "600",
            cursor:
              otpLoadingId === order._id
                ? "wait"
                : "pointer",
          }}
        >
          {otpLoadingId === order._id
            ? "Loading OTP..."
            : "View Delivery OTP"}
        </button>
      )}
    </div>
  )}
                {/* ==================================
                    CLARIFICATION MESSAGE
                ================================== */}

                {order.clarificationMessage && (
                  <div className="order-address">
                    <span className="detail-label">
                      💬 Tailor's Message
                    </span>

                    <p>
                      {order.clarificationMessage}
                    </p>
                  </div>
                )}

                {/* ==================================
                    PICKUP ADDRESS
                ================================== */}

                {order.pickupAddress && (
                  <div className="order-address">
                    <span className="detail-label">
                      📍 Pickup Address
                    </span>

                    <p>
                      {order.pickupAddress}
                    </p>
                  </div>
                )}

                {/* ==================================
                    RAZORPAY PAYMENT BUTTON
                ================================== */}

                {order.status ===
                  "Awaiting Customer Confirmation" &&
                  !isPaid &&
                  order.stitchingPrice !== null &&
                  order.stitchingPrice !== undefined && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "20px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handlePayment(order)
                        }
                        disabled={
                          payingId === order._id
                        }
                        style={{
                          border: "none",
                          borderRadius: "9px",
                          padding: "12px 22px",
                          background: "#35272d",
                          color: "#fff",
                          fontFamily: "inherit",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor:
                            payingId === order._id
                              ? "wait"
                              : "pointer",
                        }}
                      >
                        {payingId === order._id
                          ? "Opening Payment..."
                          : `Pay ₹${Number(
                              order.stitchingPrice
                            ).toLocaleString("en-IN")}`}
                      </button>
                    </div>
                  )}

                {/* ==================================
                    PAYMENT COMPLETED
                ================================== */}

                {isPaid && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "13px 16px",
                      borderRadius: "9px",
                      background: "#ecfdf5",
                      color: "#047857",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>✓</span>
                    <span>
                      Payment completed
                    </span>
                  </div>
                )}

                {/* ==================================
                    TRACK ORDER BUTTON
                ================================== */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "18px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setTrackingOrderId(
                        isTracking
                          ? null
                          : order._id
                      )
                    }
                    style={{
                      border:
                        "1px solid #35272d",
                      borderRadius: "9px",
                      padding: "11px 20px",
                      background: isTracking
                        ? "#35272d"
                        : "#ffffff",
                      color: isTracking
                        ? "#ffffff"
                        : "#35272d",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {isTracking
                      ? "Hide Tracking"
                      : "Track Order"}
                  </button>
                </div>

                {/* ==================================
                    ORDER TRACKING
                ================================== */}

                {isTracking && (
                  <div
                    style={{
                      marginTop: "22px",
                      padding: "24px",
                      borderRadius: "14px",
                      background: "#faf8f7",
                      border:
                        "1px solid #eee7e3",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "22px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          letterSpacing:
                            "1.5px",
                          color: "#9a8d91",
                        }}
                      >
                        ORDER TRACKING
                      </span>

                      <h3
                        style={{
                          margin:
                            "6px 0 4px",
                          fontSize: "20px",
                          color: "#35272d",
                        }}
                      >
                        Track Your Stitching Order
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#766a6e",
                        }}
                      >
                        Current status:{" "}
                        <strong>
                          {order.status}
                        </strong>
                      </p>
                    </div>

                    <div
                      style={{
                        position: "relative",
                      }}
                    >
                      {trackingSteps.map(
                        (step, index) => {
                          const completed =
                            index <=
                            currentTrackingStep;

                          const current =
                            index ===
                            currentTrackingStep;

                          return (
                            <div
                              key={step}
                              style={{
                                display: "flex",
                                alignItems:
                                  "flex-start",
                                position:
                                  "relative",
                                minHeight:
                                  index ===
                                  trackingSteps.length -
                                    1
                                    ? "42px"
                                    : "58px",
                              }}
                            >
                              {index <
                                trackingSteps.length -
                                  1 && (
                                <div
                                  style={{
                                    position:
                                      "absolute",
                                    left: "10px",
                                    top: "22px",
                                    width: "2px",
                                    height: "36px",
                                    background:
                                      index <
                                      currentTrackingStep
                                        ? "#047857"
                                        : "#ddd6d2",
                                  }}
                                />
                              )}

                              <div
                                style={{
                                  width: "22px",
                                  height: "22px",
                                  borderRadius:
                                    "50%",
                                  background:
                                    completed
                                      ? "#047857"
                                      : "#ffffff",
                                  border:
                                    completed
                                      ? "2px solid #047857"
                                      : "2px solid #d6cfcb",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  flexShrink: 0,
                                  zIndex: 1,
                                  fontSize:
                                    "11px",
                                  color:
                                    "#ffffff",
                                  fontWeight:
                                    "700",
                                }}
                              >
                                {completed
                                  ? "✓"
                                  : ""}
                              </div>

                              <div
                                style={{
                                  marginLeft:
                                    "14px",
                                  paddingTop:
                                    "1px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize:
                                      "13px",
                                    fontWeight:
                                      current
                                        ? "700"
                                        : completed
                                        ? "600"
                                        : "500",
                                    color:
                                      current
                                        ? "#35272d"
                                        : completed
                                        ? "#374151"
                                        : "#9ca3af",
                                  }}
                                >
                                  {step}
                                </div>

                                {current && (
                                  <div
                                    style={{
                                      fontSize:
                                        "11px",
                                      color:
                                        "#047857",
                                      marginTop:
                                        "3px",
                                      fontWeight:
                                        "600",
                                    }}
                                  >
                                    Current stage
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
