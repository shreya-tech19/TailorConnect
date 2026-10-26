
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const API = "http://localhost:5000/api/admin";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [tailors, setTailors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const [assistantSaving, setAssistantSaving] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        statsResponse,
        tailorsResponse,
        customersResponse,
        ordersResponse,
        partnersResponse,
      ] = await Promise.all([
        axios.get(`${API}/dashboard`, config),
        axios.get(`${API}/tailors`, config),
        axios.get(`${API}/customers`, config),
        axios.get(`${API}/orders`, config),
        axios.get(`${API}/delivery-partners`, config),
      ]);

      setStats(statsResponse.data);
      setTailors(
        Array.isArray(tailorsResponse.data)
          ? tailorsResponse.data
          : []
      );
      setCustomers(
        Array.isArray(customersResponse.data)
          ? customersResponse.data
          : []
      );
      setOrders(
        Array.isArray(ordersResponse.data)
          ? ordersResponse.data
          : []
      );
      setPartners(
        Array.isArray(partnersResponse.data)
          ? partnersResponse.data
          : []
      );
    } catch (error) {
      console.error("ADMIN DASHBOARD ERROR:", error);

      if (error.response?.status === 401) {
        alert("Admin session expired. Please login again.");

        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");

        window.location.href = "/admin-login";
        return;
      }

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const verifyTailor = async (id) => {
    try {
      await axios.patch(
        `${API}/tailors/${id}/verify`,
        {},
        config
      );

      await loadDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to verify tailor."
      );
    }
  };

  const unverifyTailor = async (id) => {
    try {
      await axios.patch(
        `${API}/tailors/${id}/unverify`,
        {},
        config
      );

      await loadDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to remove verification."
      );
    }
  };

  const reviewAssistant = async (
    tailorId,
    assistantId,
    action
  ) => {
    try {
      setAssistantSaving(String(assistantId));

      await axios.patch(
        `${API}/tailors/${tailorId}/assistants/${assistantId}/${action}`,
        {},
        config
      );

      await loadDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update assistant approval."
      );
    } finally {
      setAssistantSaving("");
    }
  };

  const deleteCustomer = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${API}/customers/${id}`,
        config
      );

      alert("Customer deleted successfully.");
      setSelectedCustomer(null);

      await loadDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete customer."
      );
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.patch(
        `${API}/orders/${id}/status`,
        { status },
        config
      );

      alert("Order status updated successfully.");
      setSelectedOrder(null);

      await loadDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update order status."
      );
    }
  };

  const updatePartnerAvailability = async (
    id,
    isAvailable
  ) => {
    try {
      await axios.patch(
        `${API}/delivery-partners/${id}/availability`,
        { isAvailable },
        config
      );

      alert(
        isAvailable
          ? "Delivery partner is now available."
          : "Delivery partner is now unavailable."
      );

      setSelectedPartner(null);
      await loadDashboard();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update availability."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    window.location.href = "/admin-login";
  };

  const assistantRecords = tailors.flatMap((tailor) =>
    (tailor.homeVisitAssistants || []).map((assistant) => ({
      tailor,
      assistant,
    }))
  );

  const pendingAssistants = assistantRecords.filter(
    ({ assistant }) =>
      (assistant.approvalStatus || "Pending") === "Pending"
  ).length;

  const statCards = [
    {
      title: "Customers",
      value: stats?.totalCustomers ?? 0,
      link: "View Customers",
      section: "customers-section",
      icon: "👥",
    },
    {
      title: "Tailors",
      value: stats?.totalTailors ?? 0,
      link: "Manage Tailors",
      section: "tailors-section",
      icon: "✂️",
    },
    {
      title: "Verified Tailors",
      value: stats?.verifiedTailors ?? 0,
      link: "View Verified Tailors",
      section: "tailors-section",
      icon: "✅",
    },
    {
      title: "Pending Tailors",
      value: stats?.pendingTailors ?? 0,
      link: "Review Tailors",
      section: "tailors-section",
      icon: "⏳",
    },
    {
      title: "Delivery Partners",
      value: stats?.totalDeliveryPartners ?? 0,
      link: "Manage Partners",
      section: "delivery-section",
      icon: "🚚",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      link: "View Orders",
      section: "orders-section",
      icon: "📦",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      link: "View Pending Orders",
      section: "orders-section",
      icon: "🕒",
    },
    {
      title: "Completed Orders",
      value: stats?.completedOrders ?? 0,
      link: "View Completed Orders",
      section: "orders-section",
      icon: "🎉",
    },
  ];

  if (!stats) {
    return (
      <div className="admin-loading">
        <div style={{ textAlign: "center" }}>
          <h2>TailorConnect Admin</h2>
          <p>
            {errorMessage ||
              "Loading Admin Dashboard..."}
          </p>

          {errorMessage && (
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
            >
              {loading ? "Retrying..." : "Try Again"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* ============ SIDEBAR ============ */}

      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-icon">✂</div>

          <div>
            <h2>TailorConnect</h2>
            <span>ADMIN WORKSPACE</span>
          </div>
        </div>

        <p className="admin-sidebar-label">
          MAIN MENU
        </p>

        <nav className="admin-sidebar-nav">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <span>◈</span>
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection("tailors-section")
            }
          >
            <span>✂</span>
            Tailor Management
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection("assistant-approvals-section")
            }
          >
            <span>✓</span>
            Assistant Approvals
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection("customers-section")
            }
          >
            <span>♙</span>
            Customers
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection("orders-section")
            }
          >
            <span>▣</span>
            Orders
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection("delivery-section")
            }
          >
            <span>↗</span>
            Delivery Partners
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <span className="admin-online-dot"></span>
          Administrator
          <small>Admin Workspace</small>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}

      <main className="admin-main-content">

        {/* WELCOME BANNER */}

        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-tag">
              ✦ TAILORCONNECT ADMINISTRATION
            </div>

            <h1>
              Welcome to Your
              <br />
              <em>Admin Workspace</em>
            </h1>

            <p>
              Manage your tailoring community,
              review orders and keep your platform
              running beautifully.
            </p>

            <div className="admin-header-meta">
              <span>● Platform Overview</span>
              <span>✂ TailorConnect</span>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            Logout ↗
          </button>
        </header>

        {/* DASHBOARD STATS */}

        <section className="admin-stats">
          {statCards.map((card) => (
            <button
              type="button"
              key={card.title}
              className="stat-card stat-card-button"
              onClick={() =>
                scrollToSection(card.section)
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  gap: "10px",
                }}
              >
                <h3>{card.title}</h3>

                <span
                  style={{
                    fontSize: "24px",
                    lineHeight: 1,
                  }}
                >
                  {card.icon}
                </span>
              </div>

              <strong>{card.value}</strong>

              <span>{card.link} →</span>
            </button>
          ))}
        </section>

        {/* TAILOR MANAGEMENT */}

        <section
          id="tailors-section"
          className="admin-section"
        >
          <div className="section-heading">
            <h2>Tailor Management</h2>
            <span>{tailors.length} Tailors</span>
          </div>

          <div className="admin-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Owner</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Experience</th>
                  <th>Verification</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {tailors.map((tailor) => (
                  <tr key={tailor._id}>
                    <td>
                      <strong>
                        {tailor.shopName}
                      </strong>
                    </td>

                    <td>{tailor.ownerName}</td>
                    <td>{tailor.email}</td>
                    <td>{tailor.city || "-"}</td>

                    <td>
                      {tailor.experience || 0} years
                    </td>

                    <td>
                      <span
                        className={
                          tailor.isVerified
                            ? "admin-status-badge verified"
                            : "admin-status-badge pending"
                        }
                      >
                        {tailor.isVerified
                          ? " Verified"
                          : "Pending"}
                      </span>
                    </td>

                    <td className="action-buttons">
                      {tailor.isVerified ? (
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            unverifyTailor(tailor._id)
                          }
                        >
                          Remove Verification
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="success-button"
                          onClick={() =>
                            verifyTailor(tailor._id)
                          }
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {tailors.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      No tailors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* HOME VISIT ASSISTANTS */}

        <section
          id="assistant-approvals-section"
          className="admin-section"
        >
          <div className="section-heading">
            <h2>Home Visit Assistant Approvals</h2>
            <span>{pendingAssistants} Pending</span>
          </div>

          <div className="admin-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tailor</th>
                  <th>Assistant</th>
                  <th>Photo</th>
                  <th>Active</th>
                  <th>Approval</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {assistantRecords.map(
                  ({ tailor, assistant }) => (
                    <tr
                      key={`${tailor._id}-${assistant._id}`}
                    >
                      <td>{tailor.shopName}</td>

                      <td>
                        <strong>
                          {assistant.name}
                        </strong>
                      </td>

                      <td>
                        {assistant.photo ? (
                          <img
                            src={assistant.photo}
                            alt={assistant.name}
                            style={{
                              width: "55px",
                              height: "55px",
                              objectFit: "cover",
                              borderRadius: "10px",
                            }}
                          />
                        ) : (
                          "No photo"
                        )}
                      </td>

                      <td>
                        {assistant.isActive
                          ? "Yes"
                          : "No"}
                      </td>

                      <td>
                        <span
                          className={
                            "admin-status-badge " +
                            (
                              assistant.approvalStatus === "Approved"
                                ? "verified"
                                : "pending"
                            )
                          }
                        >
                          {assistant.approvalStatus ||
                            "Pending"}
                        </span>
                      </td>

                      <td className="action-buttons">
                        {(assistant.approvalStatus ||
                          "Pending") !== "Approved" && (
                          <button
                            type="button"
                            className="success-button"
                            disabled={
                              !!assistantSaving ||
                              !tailor.isVerified ||
                              !assistant.isActive
                            }
                            onClick={() =>
                              reviewAssistant(
                                tailor._id,
                                assistant._id,
                                "approve"
                              )
                            }
                          >
                            Approve
                          </button>
                        )}

                        {(assistant.approvalStatus ||
                          "Pending") !== "Rejected" && (
                          <button
                            type="button"
                            className="danger-button"
                            disabled={!!assistantSaving}
                            onClick={() =>
                              reviewAssistant(
                                tailor._id,
                                assistant._id,
                                "reject"
                              )
                            }
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                )}

                {assistantRecords.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      No home visit assistants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* CUSTOMERS */}

        <section
          id="customers-section"
          className="admin-section"
        >
          <div className="section-heading">
            <h2>Customer Management</h2>
            <span>{customers.length} Customers</span>
          </div>

          <div className="admin-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <strong>
                        {customer.fullName}
                      </strong>
                    </td>

                    <td>{customer.email}</td>
                    <td>{customer.phone || "-"}</td>
                    <td>{customer.city || "-"}</td>

                    <td className="action-buttons">
                      <button
                        type="button"
                        className="view-button"
                        onClick={() =>
                          setSelectedCustomer(customer)
                        }
                      >
                        View
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          deleteCustomer(customer._id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ORDERS */}

        <section
          id="orders-section"
          className="admin-section"
        >
          <div className="section-heading">
            <h2>Order Management</h2>
            <span>{orders.length} Orders</span>
          </div>

          <div className="admin-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Tailor</th>
                  <th>Garment</th>
                  <th>Price</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      {order.customer?.fullName ||
                        order.customerName ||
                        "-"}
                    </td>

                    <td>
                      {order.tailor?.shopName ||
                        order.tailorName ||
                        "-"}
                    </td>

                    <td>{order.garment || "-"}</td>

                    <td>
                      {order.stitchingPrice != null
                        ? `₹${order.stitchingPrice}`
                        : "-"}
                    </td>

                    <td>
                      {order.paymentStatus || "-"}
                    </td>

                    <td>
                      <span className="admin-status-badge pending">
                        {order.status || "-"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="view-button"
                        onClick={() =>
                          setSelectedOrder(order)
                        }
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* DELIVERY PARTNERS */}

        <section
          id="delivery-section"
          className="admin-section"
        >
          <div className="section-heading">
            <h2>Delivery Partner Management</h2>
            <span>{partners.length} Partners</span>
          </div>

          <div className="admin-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Available</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {partners.map((partner) => (
                  <tr key={partner._id}>
                    <td>
                      <strong>{partner.name}</strong>
                    </td>

                    <td>{partner.email}</td>
                    <td>{partner.phone}</td>
                    <td>{partner.city}</td>

                    <td>
                      <span
                        className={
                          partner.isAvailable
                            ? "admin-status-badge verified"
                            : "admin-status-badge pending"
                        }
                      >
                        {partner.isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="view-button"
                        onClick={() =>
                          setSelectedPartner(partner)
                        }
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}

                {partners.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      No delivery partners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* REFRESH */}

        <div className="admin-refresh">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading
              ? "Refreshing..."
              : "↻ Refresh Dashboard"}
          </button>
        </div>

      </main>

      {/* ============ CUSTOMER MODAL ============ */}

      {selectedCustomer && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>Customer Details</h2>

            <p>
              <strong>Name:</strong>{" "}
              {selectedCustomer.fullName}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {selectedCustomer.email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {selectedCustomer.phone || "-"}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {selectedCustomer.address || "-"}
            </p>

            <p>
              <strong>City:</strong>{" "}
              {selectedCustomer.city || "-"}
            </p>

            <p>
              <strong>Pincode:</strong>{" "}
              {selectedCustomer.pincode || "-"}
            </p>

            <button
              type="button"
              className="close-button"
              onClick={() =>
                setSelectedCustomer(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ============ ORDER MODAL ============ */}

      {selectedOrder && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>Order Management</h2>

            <p>
              <strong>Customer:</strong>{" "}
              {selectedOrder.customer?.fullName ||
                selectedOrder.customerName ||
                "-"}
            </p>

            <p>
              <strong>Tailor:</strong>{" "}
              {selectedOrder.tailor?.shopName ||
                selectedOrder.tailorName ||
                "-"}
            </p>

            <p>
              <strong>Garment:</strong>{" "}
              {selectedOrder.garment || "-"}
            </p>

            <p>
              <strong>Price:</strong>{" "}
              {selectedOrder.stitchingPrice != null
                ? `₹${selectedOrder.stitchingPrice}`
                : "-"}
            </p>

            <p>
              <strong>Payment:</strong>{" "}
              {selectedOrder.paymentStatus || "-"}
            </p>

            <p>
              <strong>Current Status:</strong>{" "}
              {selectedOrder.status || "-"}
            </p>

            <h3>Change Order Status</h3>

            <div className="status-buttons">
              {[
                "Confirmed",
                "In Progress",
                "Ready",
                "Out for Delivery",
                "Completed",
              ].map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() =>
                    updateOrderStatus(
                      selectedOrder._id,
                      status
                    )
                  }
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="close-button"
              onClick={() =>
                setSelectedOrder(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ============ DELIVERY MODAL ============ */}

      {selectedPartner && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>Delivery Partner</h2>

            <p>
              <strong>Name:</strong>{" "}
              {selectedPartner.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {selectedPartner.email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {selectedPartner.phone}
            </p>

            <p>
              <strong>City:</strong>{" "}
              {selectedPartner.city}
            </p>

            <p>
              <strong>Current Availability:</strong>{" "}
              {selectedPartner.isAvailable
                ? "Available"
                : "Unavailable"}
            </p>

            <div className="status-buttons">
              <button
                type="button"
                className="success-button"
                onClick={() =>
                  updatePartnerAvailability(
                    selectedPartner._id,
                    true
                  )
                }
              >
                Mark Available
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={() =>
                  updatePartnerAvailability(
                    selectedPartner._id,
                    false
                  )
                }
              >
                Mark Unavailable
              </button>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={() =>
                setSelectedPartner(null)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
