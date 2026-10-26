
import "./TailorDashboard.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PortfolioManager from "../components/PortfolioManager";
import API from "../services/api";

function TailorDashboard() {
  const navigate = useNavigate();

  const [tailor, setTailor] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
const [savingProfile, setSavingProfile] = useState(false);

const [profileForm, setProfileForm] = useState({
  shopName: "",
  ownerName: "",
  phone: "",
  city: "",
  address: "",
  specialization: "",
  experience: "",
  priceRange: "",
  description: "",
});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const profileImageInputRef = useRef(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
const [visitDate, setVisitDate] = useState("");
const [visitTime, setVisitTime] = useState("");
const [visitMeasurements, setVisitMeasurements] = useState({
  chest: "",
  waist: "",
  shoulder: "",
  length: "",
});
const [fabricCollected, setFabricCollected] = useState("");
const [fabricCollectionNote, setFabricCollectionNote] = useState("");
const [measurementSaving, setMeasurementSaving] = useState(false);
  const [assistants, setAssistants] = useState([]);
  const [assistantName, setAssistantName] = useState("");
  const [assistantPhoto, setAssistantPhoto] = useState("");
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [visitorType, setVisitorType] = useState("Tailor");
  const [visitorAssistantId, setVisitorAssistantId] = useState("");
  const [generatedVisitOtp, setGeneratedVisitOtp] = useState("");

  const [stitchingPrice, setStitchingPrice] = useState("");
  const [estimatedCompletionDate, setEstimatedCompletionDate] =
    useState("");

  const [clarificationMessage, setClarificationMessage] =
    useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* =====================================================
     LOAD TAILOR
  ===================================================== */

  useEffect(() => {
    const loadTailor = async () => {
      try {
        const savedTailor = localStorage.getItem("tailor");
  
        if (!savedTailor) {
          navigate("/tailor-login");
          return;
        }
  
        const parsedTailor = JSON.parse(savedTailor);
  
        const tailorId =
          parsedTailor._id || parsedTailor.id;
  
        if (!tailorId) {
          navigate("/tailor-login");
          return;
        }
  
        // Get the latest tailor data from MongoDB
        const response = await API.get(
          `/tailors/${tailorId}`
        );
  
        const latestTailor =
          response.data.tailor || response.data;
  
        // Keep the latest database data in state
        setTailor(latestTailor);
  
        // Also update localStorage
        localStorage.setItem(
          "tailor",
          JSON.stringify(latestTailor)
        );
  
        // Load orders
        fetchOrders(tailorId);
        fetchAssistants(tailorId);
  
      } catch (error) {
        console.error(
          "LOAD TAILOR ERROR:",
          error
        );
  
        // Fallback to saved tailor data
        const savedTailor =
          localStorage.getItem("tailor");
  
        if (savedTailor) {
          const parsedTailor =
            JSON.parse(savedTailor);
  
          setTailor(parsedTailor);
  
          fetchOrders(
            parsedTailor._id ||
            parsedTailor.id
          );
          fetchAssistants(parsedTailor._id || parsedTailor.id);
        } else {
          navigate("/tailor-login");
        }
      }
    };
  
    loadTailor();
  }, [navigate]);

  /* =====================================================
     FETCH ORDERS
  ===================================================== */

  const fetchOrders = async (tailorId) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await API.get(
        `/orders/tailor/${tailorId}`
      );

      setOrders(response.data || []);
    } catch (error) {
      console.error(
        "Error fetching tailor orders:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAssistants = async (tailorId) => {
    try {
      const response = await API.get(`/tailors/${tailorId}/home-visit-assistants`);
      setAssistants(Array.isArray(response.data) ? response.data : response.data.assistants || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to load home visit assistants.");
    }
  };

  const registerAssistant = async (e) => {
    e.preventDefault();
    const tailorId = tailor?._id || tailor?.id;
    if (!assistantName.trim() || !assistantPhoto.trim()) {
      setErrorMessage("Assistant name and photo URL are required.");
      return;
    }
    try {
      setAssistantBusy(true);
      setErrorMessage("");
      await API.post(`/tailors/${tailorId}/home-visit-assistants`, {
        name: assistantName.trim(), photo: assistantPhoto.trim()
      });
      setAssistantName("");
      setAssistantPhoto("");
      setMessage("Assistant submitted for admin approval.");
      await fetchAssistants(tailorId);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to register assistant.");
    } finally {
      setAssistantBusy(false);
    }
  };

  const deactivateAssistant = async (assistantId) => {
    const tailorId = tailor?._id || tailor?.id;
    try {
      setAssistantBusy(true);
      await API.patch(`/tailors/${tailorId}/home-visit-assistants/${assistantId}/deactivate`);
      await fetchAssistants(tailorId);
      setMessage("Assistant deactivated.");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to deactivate assistant.");
    } finally {
      setAssistantBusy(false);
    }
  };

  const assignVisitor = async () => {
    if (!selectedOrder) return;
    try {
      setMeasurementSaving(true);
      const response = await API.patch(`/orders/${selectedOrder._id}/home-visit-visitor`, {
        visitorType,
        ...(visitorType === "Assistant" ? { assistantId: visitorAssistantId } : {})
      });
      setSelectedOrder(response.data.order);
      setGeneratedVisitOtp("");
      setMessage(response.data.message || "Visitor assigned.");
      await fetchOrders(tailor._id || tailor.id);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to assign visitor.");
    } finally {
      setMeasurementSaving(false);
    }
  };

  const generateVisitorOtp = async () => {
    if (!selectedOrder) return;
    try {
      setMeasurementSaving(true);
      const response = await API.post(`/orders/${selectedOrder._id}/home-visit-otp`);
      setGeneratedVisitOtp(response.data.otp || "");
      setMessage("Visitor code generated. Valid for 5 minutes.");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Unable to generate visitor code.");
    } finally {
      setMeasurementSaving(false);
    }
  };

  /* =====================================================
     OPEN ORDER
  ===================================================== */

  const openOrder = (order) => {
    setSelectedOrder(order);
    setGeneratedVisitOtp("");
    setVisitorType(order.homeVisitVisitorType || "Tailor");
    setVisitorAssistantId(order.homeVisitAssistantId || "");
    
const appointmentDate =
order.confirmedMeasurementDate || order.measurementDate;

setVisitDate(
appointmentDate
  ? new Date(appointmentDate).toISOString().slice(0, 10)
  : ""
);

setVisitTime(
order.confirmedMeasurementTime ||
order.measurementTime ||
""
);

setVisitMeasurements({
chest: order.measurements?.chest || "",
waist: order.measurements?.waist || "",
shoulder: order.measurements?.shoulder || "",
length: order.measurements?.length || "",
});

setFabricCollected(
order.measurementVisitStatus === "Completed"
  ? String(order.fabricCollected)
  : ""
);

setFabricCollectionNote(order.fabricCollectionNote || "");


    setStitchingPrice(
      order.stitchingPrice !== null &&
        order.stitchingPrice !== undefined
        ? order.stitchingPrice
        : ""
    );

    setEstimatedCompletionDate(
      order.estimatedCompletionDate
        ? new Date(order.estimatedCompletionDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

  
    setClarificationMessage("");
    setMessage("");
    setErrorMessage("");
  };

  /* =====================================================
     CLOSE ORDER
  ===================================================== */

  const closeOrder = () => {
    setSelectedOrder(null);
    setGeneratedVisitOtp("");
    setStitchingPrice("");
    setEstimatedCompletionDate("");
    setClarificationMessage("");
    setMessage("");
    setErrorMessage("");
  };

  
const handleMeasurementAppointment = async (action) => {
  if (!selectedOrder) {
    alert("Please select an order.");
    return;
  }

  if (!visitDate || !visitTime.trim()) {
    alert("Please select an appointment date and time.");
    return;
  }

  try {
    setMeasurementSaving(true);
    setErrorMessage("");
    setMessage("");

    const response = await API.patch(
      `/orders/${selectedOrder._id}/measurement-appointment`,
      {
        action,
        date: visitDate,
        time: visitTime.trim(),
      }
    );

    setSelectedOrder(response.data.order);
    alert(response.data.message || "Appointment updated successfully.");

    const tailorId = tailor?._id || tailor?.id;
    if (tailorId) await fetchOrders(tailorId);
  } catch (error) {
    console.error("MEASUREMENT APPOINTMENT ERROR:", error);

    alert(
      error.response?.data?.message ||
      "Unable to update measurement appointment."
    );
  } finally {
    setMeasurementSaving(false);
  }
};

  const handleCompleteMeasurement = async () => {
    if (!selectedOrder) return;
  
    if (fabricCollected === "") {
      setErrorMessage("Select whether fabric was collected.");
      return;
    }
  
    const measurements = {};
  
    for (const [key, value] of Object.entries(visitMeasurements)) {
      if (value === "") continue;
  
      const number = Number(value);
  
      if (!Number.isFinite(number) || number <= 0 || number > 200) {
        setErrorMessage(`Enter a valid ${key} measurement.`);
        return;
      }
  
      measurements[key] = number;
    }
  
    if (Object.keys(measurements).length === 0) {
      setErrorMessage("Enter at least one measurement.");
      return;
    }
  
    try {
      setMeasurementSaving(true);
      setErrorMessage("");
      setMessage("");
  
      const response = await API.patch(
        `/orders/${selectedOrder._id}/measurement-complete`,
        {
          measurements,
          fabricCollected: fabricCollected === "true",
          fabricCollectionNote,
        }
      );
  
      setSelectedOrder(response.data.order);
      setMessage(response.data.message);
  
      const tailorId = tailor?._id || tailor?.id;
      if (tailorId) await fetchOrders(tailorId);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to complete measurement visit."
      );
    } finally {
      setMeasurementSaving(false);
    }
  };
  
  /* =====================================================
     SEND PRICE
  ===================================================== */

  const handleSendPrice = async () => {
    if (!selectedOrder) return;

    if (
      stitchingPrice === "" ||
      Number.isNaN(Number(stitchingPrice)) ||
      Number(stitchingPrice) < 0
    ) {
      setErrorMessage(
        "Please enter a valid stitching price."
      );
      return;
    }

    if (!estimatedCompletionDate) {
      setErrorMessage(
        "Please select an estimated completion date."
      );
      return;
    }

    try {
      setErrorMessage("");
      setMessage("");

      const response = await API.patch(
        `/orders/${selectedOrder._id}/review`,
        {
          stitchingPrice: Number(stitchingPrice),
          estimatedCompletionDate,
        }
      );

      setMessage(
        response.data?.message ||
          "Price sent to customer successfully."
      );

      const tailorId =
        tailor?._id || tailor?.id;

      if (tailorId) {
        await fetchOrders(tailorId);
      }

      setTimeout(() => {
        closeOrder();
      }, 1200);
    } catch (error) {
      console.error(
        "Error sending price:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to send price to customer."
      );
    }
  };

  /* =====================================================
     REQUEST CLARIFICATION
  ===================================================== */

  const handleRequestClarification = async () => {
    if (!selectedOrder) return;

    if (!clarificationMessage.trim()) {
      setErrorMessage(
        "Please explain what clarification is required."
      );
      return;
    }

    try {
      setErrorMessage("");
      setMessage("");

      const response = await API.patch(
        `/orders/${selectedOrder._id}/clarification`,
        {
          message: clarificationMessage.trim(),
        }
      );

      setMessage(
        response.data?.message ||
          "Clarification request sent to customer."
      );

      const tailorId =
        tailor?._id || tailor?.id;

      if (tailorId) {
        await fetchOrders(tailorId);
      }

      setTimeout(() => {
        closeOrder();
      }, 1200);
    } catch (error) {
      console.error(
        "Error requesting clarification:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to send clarification request."
      );
    }
  };


const handleProfileImageChange = async (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setErrorMessage("Please select a valid image file.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setErrorMessage("Image size must be less than 5MB.");
    return;
  }

  try {
    setUploadingProfileImage(true);
    setErrorMessage("");
    setMessage("");

    // STEP 1: Upload image to Cloudinary
    const formData = new FormData();
    formData.append("image", file);

    const uploadResponse = await API.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const imageUrl = uploadResponse.data.imageUrl;

    if (!imageUrl) {
      throw new Error("Cloudinary did not return an image URL.");
    }

    // STEP 2: Save Cloudinary URL in MongoDB
    const tailorId = tailor._id || tailor.id;

    const profileResponse = await API.patch(
      `/tailors/${tailorId}/profile-image`,
      {
        profileImage: imageUrl,
      }
    );

    // STEP 3: Update dashboard state
    const updatedTailor = {
      ...tailor,
      ...profileResponse.data.tailor,
      profileImage: imageUrl,
    };

    setTailor(updatedTailor);

    // STEP 4: Keep updated image after refresh/login
    localStorage.setItem("tailor", JSON.stringify(updatedTailor));

    setMessage("Profile photo updated successfully.");
  } catch (error) {
    console.error("PROFILE IMAGE UPLOAD ERROR:", error);

    setErrorMessage(
      error.response?.data?.message ||
        "Unable to upload profile photo. Please try again."
    );
  } finally {
    setUploadingProfileImage(false);

    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = "";
    }
  }
};

  /* =====================================================
     UPDATE ORDER STATUS
  ===================================================== */

  const updateOrderStatus = async (
    orderId,
    status
  ) => {
    try {
      setErrorMessage("");
      setMessage("");

      const response = await API.patch(
        `/orders/${orderId}/status`,
        {
          status,
        }
      );

      setMessage(
        response.data?.message ||
          "Order status updated."
      );

      const tailorId =
        tailor?._id || tailor?.id;

      if (tailorId) {
        await fetchOrders(tailorId);
      }

      /*
        Refresh the selected order inside the modal
        so its status changes immediately.
      */
      const updatedOrder =
        response.data?.order;

      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error(
        "Error updating order status:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to update order status."
      );
    }
  };
// ==========================================
// TAILOR PROFILE MANAGEMENT
// ==========================================

const handleEditProfile = () => {
  setProfileForm({
    shopName: tailor?.shopName || "",
    ownerName: tailor?.ownerName || "",
    phone: tailor?.phone || "",
    city: tailor?.city || "",
    address: tailor?.address || "",
    specialization: tailor?.specialization || "",
    experience: tailor?.experience ?? "",
    priceRange: tailor?.priceRange || "",
    description: tailor?.description || "",
  });

  setErrorMessage("");
  setMessage("");
  setIsEditingProfile(true);
};

const handleProfileInputChange = (e) => {
  const { name, value } = e.target;

  setProfileForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleCancelProfile = () => {
  setIsEditingProfile(false);
  setErrorMessage("");
};

const handleSaveProfile = async (e) => {
  e.preventDefault();

  const tailorId = tailor?._id || tailor?.id;

  if (!tailorId) {
    setErrorMessage("Tailor information not found.");
    return;
  }

  if (
    !profileForm.shopName.trim() ||
    !profileForm.ownerName.trim() ||
    !profileForm.phone.trim()
  ) {
    setErrorMessage("Shop name, owner name and phone are required.");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(profileForm.phone.trim())) {
    setErrorMessage("Enter a valid 10-digit phone number.");
    return;
  }

  try {
    setSavingProfile(true);
    setErrorMessage("");
    setMessage("");

    const response = await API.patch(
      `/tailors/${tailorId}/profile`,
      {
        shopName: profileForm.shopName.trim(),
        ownerName: profileForm.ownerName.trim(),
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
        address: profileForm.address.trim(),
        specialization: profileForm.specialization.trim(),
        experience: Number(profileForm.experience),
        priceRange: profileForm.priceRange.trim(),
        description: profileForm.description.trim(),
      }
    );

    const updatedTailor = {
      ...tailor,
      ...response.data.tailor,
    };

    setTailor(updatedTailor);

    localStorage.setItem(
      "tailor",
      JSON.stringify(updatedTailor)
    );

    setIsEditingProfile(false);

    setMessage(
      response.data.message ||
      "Profile updated successfully."
    );
  } catch (error) {
    setErrorMessage(
      error.response?.data?.message ||
      "Unable to update profile."
    );
  } finally {
    setSavingProfile(false);
  }
};
  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("tailor");
    localStorage.removeItem("tailorToken");

    navigate("/tailor-login");
  };

  /* =====================================================
     AVAILABILITY
  ===================================================== */

  const isTailorAvailable =
    tailor?.isAvailable !== undefined
      ? tailor.isAvailable
      : tailor?.availability
        ? tailor.availability.toLowerCase() ===
          "available"
        : true;

  /* =====================================================
     TOGGLE AVAILABILITY
  ===================================================== */

  const toggleAvailability = async () => {
    const tailorId =
      tailor?._id || tailor?.id;

    if (!tailorId) {
      setErrorMessage(
        "Tailor information not found. Please login again."
      );
      return;
    }

    const newAvailability =
      !isTailorAvailable;

    try {
      setErrorMessage("");
      setMessage("");

      const response = await API.patch(
        `/tailors/${tailorId}/availability`,
        {
          isAvailable: newAvailability,
        }
      );

      const updatedTailor = {
        ...tailor,

        isAvailable:
          response.data?.tailor?.isAvailable ??
          newAvailability,

        availabilityMessage:
          response.data?.tailor?.availabilityMessage ||
          (newAvailability
            ? "Available for new stitching orders"
            : "Currently not accepting new stitching orders"),
      };

      setTailor(updatedTailor);

      localStorage.setItem(
        "tailor",
        JSON.stringify(updatedTailor)
      );

      setMessage(
        response.data?.message ||
          "Availability updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE AVAILABILITY ERROR:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to update availability."
      );
    }
  };

  /* =====================================================
     ORDER COUNTS
  ===================================================== */

  const newOrders = orders.filter(
    (order) =>
      order.status ===
      "Awaiting Tailor Review"
  );

  const clarificationOrders = orders.filter(
    (order) =>
      order.status ===
      "Awaiting Customer Clarification"
  );

  const inProgressOrders = orders.filter(
    (order) =>
      [
        "Confirmed",
        "Pickup Scheduled",
        "Picked Up",
        "Received by Tailor",
        "Stitching in Progress",
        "Quality Check",
      ].includes(order.status)
  );

  const readyOrders = orders.filter(
    (order) =>
      [
        "Ready for Delivery",
        "Out for Delivery",
        "Reached Customer",
      ].includes(order.status)
  );

  const completedOrders = orders.filter(
    (order) =>
      [
        "Delivered",
        "Completed",
      ].includes(order.status)
  );

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="tailor-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading Tailor Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tailor-dashboard">

      {/* =================================================
          TOP NAVIGATION
      ================================================= */}

      <header className="tailor-topbar">

        <div className="tailor-brand">

          <div className="tailor-brand-mark">
            TC
          </div>

          <div>
            <h2>TailorConnect</h2>
            <span>Tailor Workspace</span>
          </div>

        </div>


        <nav className="tailor-navigation">

          <button
            type="button"
            className="tailor-nav-link active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            Dashboard
          </button>


          <button
            type="button"
            className="tailor-nav-link"
            onClick={() =>
              document
                .getElementById("orders-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Orders
          </button>


          <button
            type="button"
            className="tailor-nav-link"
            onClick={() =>
              document
                .getElementById("profile-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            My Profile
          </button>


          <button
            type="button"
            className="tailor-nav-link"
            onClick={() =>
              document
                .getElementById("portfolio-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Portfolio
          </button>


          <button
            type="button"
            className="tailor-nav-link"
            onClick={() =>
              document
                .getElementById("reviews-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Reviews
          </button>

        </nav>


        <div className="tailor-topbar-actions">

          {/* AVAILABILITY */}

          <div
            className={`availability-control ${
              isTailorAvailable
                ? "is-available"
                : "is-unavailable"
            }`}
          >

            <div className="availability-status">

              <span className="availability-indicator"></span>

              <div>

                <strong>
                  {isTailorAvailable
                    ? "Available"
                    : "Not Available"}
                </strong>

                <small>
                  {isTailorAvailable
                    ? "Accepting new orders"
                    : "Not accepting new orders"}
                </small>

              </div>

            </div>


            <button
              type="button"
              className="availability-toggle-button"
              onClick={toggleAvailability}
            >
              {isTailorAvailable
                ? "Mark Not Available"
                : "Mark Available"}
            </button>

          </div>


          {/* LOGOUT */}

          <button
            type="button"
            className="tailor-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="tailor-main">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="dashboard-hero">

          <div className="hero-copy">

            <p className="dashboard-eyebrow">
              TAILOR WORKSPACE
            </p>

            <h1>
              Welcome back
              {tailor?.ownerName
                ? `, ${tailor.ownerName}`
                : ""}
            </h1>

            <p className="dashboard-subtitle">
              Manage stitching requests, customer
              requirements and your active orders
              from one place.
            </p>

          </div>


          <div className="tailor-profile-summary">

        
        
<div className="profile-avatar profile-avatar-image">
  {tailor?.profileImage ? (
    <img
      src={tailor.profileImage}
      alt={tailor.ownerName || "Tailor"}
    />
  ) : (
    <span>
      {tailor?.shopName?.charAt(0)?.toUpperCase() || "T"}
    </span>
  )}

  <button
    type="button"
    className="change-photo-button"
    onClick={() => profileImageInputRef.current?.click()}
    disabled={uploadingProfileImage}
  >
    {uploadingProfileImage
      ? "Uploading..."
      : "Change Photo"}
  </button>

  <input
    ref={profileImageInputRef}
    type="file"
    accept="image/*"
    onChange={handleProfileImageChange}
    style={{ display: "none" }}
  />
</div>




            <div>

              <strong>
                {tailor?.shopName ||
                  "Tailoring Studio"}
              </strong>

              <span>
                {tailor?.city ||
                  "Location not provided"}
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            MESSAGES
        ================================================= */}

        {message && (
          <div className="dashboard-message success">

            <strong>Success</strong>

            <span>{message}</span>

          </div>
        )}


        {errorMessage && (
          <div className="dashboard-message error">

            <strong>Attention</strong>

            <span>{errorMessage}</span>

          </div>
        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="dashboard-stats">

          <div className="stat-card">

            <div className="stat-icon new-icon">
              +
            </div>

            <div>
              <span>New Requests</span>

              <strong>
                {newOrders.length}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon progress-icon">
              ◷
            </div>

            <div>
              <span>In Progress</span>

              <strong>
                {inProgressOrders.length}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon ready-icon">
              ✓
            </div>

            <div>
              <span>Ready</span>

              <strong>
                {readyOrders.length}
              </strong>
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon completed-icon">
              ★
            </div>

            <div>
              <span>Completed</span>

              <strong>
                {completedOrders.length}
              </strong>
            </div>

          </div>

        </section>


        {/* =================================================
            CUSTOMER REQUESTS
        ================================================= */}

        <section
          className="dashboard-section"
          id="orders-section"
        >

          <div className="section-heading">

            <div>

              <p className="section-kicker">
                CUSTOMER REQUESTS
              </p>

              <h2>
                Orders Awaiting Your Review
              </h2>

              <p>
                Review the customer's garment,
                design, measurements and requirements
                before providing your stitching quote.
              </p>

            </div>


            <span className="section-count">
              {newOrders.length} new
            </span>

          </div>


          {newOrders.length === 0 ? (

            <div className="empty-orders">

              <div className="empty-icon">
                ✓
              </div>

              <h3>
                No new stitching requests
              </h3>

              <p>
                New customer requests will appear
                here when they are submitted.
              </p>

            </div>

          ) : (

            <div className="orders-grid">

              {newOrders.map((order) => (

                <article
                  className="tailor-order-card"
                  key={order._id}
                >

                  <div className="order-card-top">

                    <div>

                      <span className="order-number">
                        ORDER #
                        {order._id
                          ?.slice(-6)
                          .toUpperCase()}
                      </span>

                      <h3>
                        {order.customerName ||
                          "Customer"}
                      </h3>

                    </div>


                    <span className="order-status new-status">
                      Awaiting Review
                    </span>

                  </div>


                  <div className="order-details-grid">

                    <div>

                      <span>Garment</span>

                      <strong>
                        {order.garment ||
                          order.service ||
                          "—"}
                      </strong>

                    </div>


                    <div>

                      <span>Pickup</span>

                      <strong>
                        {formatDate(
                          order.pickupDate
                        )}
                      </strong>

                    </div>

                  </div>


                  <div className="order-description">

                    <span>Requirements</span>

                    <p>
                      {order.specialRequirements ||
                        order.designDescription ||
                        "No special requirements provided."}
                    </p>

                  </div>


                  <button
                    type="button"
                    className="review-order-button"
                    onClick={() =>
                      openOrder(order)
                    }
                  >
                    Review Order

                    <span>→</span>
                  </button>

                </article>

              ))}

            </div>

          )}

        </section>


        {/* =================================================
            CLARIFICATION REQUESTS
        ================================================= */}

        {clarificationOrders.length > 0 && (

          <section className="dashboard-section">

            <div className="section-heading">

              <div>

                <p className="section-kicker">
                  FOLLOW UP
                </p>

                <h2>
                  Awaiting Customer Clarification
                </h2>

                <p>
                  Requests where additional information
                  has been requested from the customer.
                </p>

              </div>


              <span className="section-count">
                {clarificationOrders.length}
              </span>

            </div>


            <div className="orders-grid">

              {clarificationOrders.map(
                (order) => (

                  <article
                    className="tailor-order-card clarification-card"
                    key={order._id}
                  >

                    <div className="order-card-top">

                      <div>

                        <span className="order-number">
                          ORDER #
                          {order._id
                            ?.slice(-6)
                            .toUpperCase()}
                        </span>

                        <h3>
                          {order.customerName ||
                            "Customer"}
                        </h3>

                      </div>


                      <span className="order-status clarification-status">
                        Clarification
                      </span>

                    </div>


                    <div className="clarification-box">

                      <span>
                        Your request
                      </span>

                      <p>
                        {order.clarificationMessage ||
                          "Clarification requested."}
                      </p>

                    </div>

                  </article>

                )
              )}

            </div>

          </section>

        )}


        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>

              <p className="section-kicker">
                ORDER MANAGEMENT
              </p>

              <h2>
                Recent Orders
              </h2>

              <p>
                Track the progress of your current
                stitching work.
              </p>

            </div>

          </div>


          {orders.length === 0 ? (

            <div className="empty-orders">

              <div className="empty-icon subtle">
                —
              </div>

              <h3>
                No orders yet
              </h3>

              <p>
                Your customer orders will appear here.
              </p>

            </div>

          ) : (

            <div className="orders-table-wrapper">

              <table className="orders-table">

                <thead>

                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Garment</th>
                    <th>Status</th>
                    <th>Price</th>
                    <th>Date</th>
                    <th></th>
                  </tr>

                </thead>


                <tbody>

                  {orders.slice(0, 10).map(
                    (order) => (

                      <tr key={order._id}>

                        <td>
                          <strong>
                            #
                            {order._id
                              ?.slice(-6)
                              .toUpperCase()}
                          </strong>
                        </td>


                        <td>
                          {order.customerName ||
                            "Customer"}
                        </td>


                        <td>
                          {order.garment ||
                            order.service ||
                            "—"}
                        </td>


                        <td>
                          <span className="table-status">
                            {order.status}
                          </span>
                        </td>


                        <td>

                          {order.stitchingPrice !==
                            null &&
                          order.stitchingPrice !==
                            undefined
                            ? `₹${order.stitchingPrice}`
                            : "Pending"}

                        </td>


                        <td>
                          {formatDate(
                            order.createdAt
                          )}
                        </td>


                        <td>

                          <button
                            type="button"
                            className="table-view-button"
                            onClick={() =>
                              openOrder(order)
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>


        {/* =================================================
            PROFILE
        ================================================= */}

<section
  id="profile-section"
  className="dashboard-section tailor-edit-profile-section"
>
  <div className="section-heading">
    <div>
      <p className="section-kicker">MY PROFILE</p>
      <h2>Manage Your Tailor Profile</h2>
      <p>
        View and update your tailoring business information.
      </p>
    </div>

    {!isEditingProfile && (
      <button
        type="button"
        className="primary-modal-button"
        onClick={handleEditProfile}
        disabled={!tailor}
      >
        Edit Profile
      </button>
    )}
  </div>

  {!isEditingProfile ? (
    <div className="tailor-profile-details">
      {[
        ["Shop Name", tailor?.shopName],
        ["Owner Name", tailor?.ownerName],
        ["Email", tailor?.email],
        ["Phone Number", tailor?.phone],
        ["City", tailor?.city],
        ["Shop Address", tailor?.address],
        ["Specialization", tailor?.specialization],
        ["Experience", `${tailor?.experience ?? 0} years`],
        ["Price Range", tailor?.priceRange],
        ["Description", tailor?.description],
      ].map(([label, value]) => (
        <div className="tailor-profile-detail" key={label}>
          <span>{label}</span>
          <strong>{value || "Not provided"}</strong>
        </div>
      ))}

      <div className="tailor-profile-detail">
        <span>Verification Status</span>
        <strong>
          {tailor?.isVerified ? "Verified" : "Pending Verification"}
        </strong>
      </div>
    </div>
  ) : (
    <form
      className="tailor-profile-edit-form"
      onSubmit={handleSaveProfile}
    >
      <div className="tailor-profile-form-grid">
        {[
          ["Shop Name", "shopName", "text"],
          ["Owner Name", "ownerName", "text"],
          ["Phone Number", "phone", "tel"],
          ["City", "city", "text"],
          ["Shop Address", "address", "text"],
          ["Specialization", "specialization", "text"],
          ["Experience (Years)", "experience", "number"],
          ["Price Range", "priceRange", "text"],
        ].map(([label, name, type]) => (
          <div className="form-field" key={name}>
            <label htmlFor={`profile-${name}`}>
              {label}
            </label>

            <input
              id={`profile-${name}`}
              type={type}
              name={name}
              value={profileForm[name]}
              onChange={handleProfileInputChange}
              required
              maxLength={type === "number" ? undefined : 500}
              min={type === "number" ? "0" : undefined}
              max={type === "number" ? "80" : undefined}
              step={type === "number" ? "1" : undefined}
            />
          </div>
        ))}
      </div>

      <div className="form-field">
        <label htmlFor="profile-description">
          Shop Description
        </label>

        <textarea
          id="profile-description"
          name="description"
          value={profileForm.description}
          onChange={handleProfileInputChange}
          rows="4"
          maxLength={500}
          required
        />
      </div>

      <p className="tailor-profile-note">
        Email and verification status cannot be changed here.
        Profile photo can be updated using Change Photo above.
      </p>

      <div className="tailor-profile-actions">
        <button
          type="button"
          className="secondary-modal-button"
          onClick={handleCancelProfile}
          disabled={savingProfile}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="primary-modal-button"
          disabled={savingProfile}
        >
          {savingProfile ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )}
</section>


        {/* =================================================
            PORTFOLIO
        ================================================= */}

         {/* HOME VISIT ASSISTANTS */}
         {tailor?.isVerified && (
           <section className="dashboard-section" id="home-visit-assistants-section">
             <div className="section-heading"><div><h2>Home Visit Assistants</h2><p>Admin approval is required before an assistant can visit a customer.</p></div></div>
             <form onSubmit={registerAssistant} className="quote-fields">
               <div className="form-field"><label>Assistant Name</label><input value={assistantName} onChange={e => setAssistantName(e.target.value)} required /></div>
               <div className="form-field"><label>Assistant Photo URL</label><input type="url" value={assistantPhoto} onChange={e => setAssistantPhoto(e.target.value)} placeholder="https://..." required /></div>
               <button type="submit" disabled={assistantBusy}>Register Assistant for Approval</button>
             </form>
             {assistants.map(a => (
               <div key={a._id} className="modal-info-section">
                 {a.photo && <img src={a.photo} alt={a.name} style={{width: 64, height: 64, objectFit: "cover", borderRadius: 8}} />}
                 <strong>{a.name}</strong> — {a.approvalStatus || "Pending"} — {a.isActive ? "Active" : "Inactive"}
                 {a.isActive && <button type="button" disabled={assistantBusy} onClick={() => deactivateAssistant(a._id)}>Deactivate</button>}
               </div>
             ))}
           </section>
         )}

<PortfolioManager tailor={tailor} />


        {/* =================================================
            REVIEWS
        ================================================= */}

        <section
          id="reviews-section"
          className="future-section"
        >

          <span>REVIEWS</span>

          <h2>
            Customer feedback
          </h2>

          <p>
            Customer reviews will appear here after
            completed orders.
          </p>

        </section>


        {/* =================================================
            WORKFLOW
        ================================================= */}

        <section className="workflow-section">

          <div className="workflow-heading">

            <p className="section-kicker">
              YOUR WORKFLOW
            </p>

            <h2>
              From Request to Delivery
            </h2>

          </div>


          <div className="workflow-steps">

            <div className="workflow-step">

              <span>01</span>

              <strong>
                Review
              </strong>

              <p>
                Check customer requirements,
                design and measurements.
              </p>

            </div>


            <div className="workflow-step">

              <span>02</span>

              <strong>
                Quote
              </strong>

              <p>
                Send the stitching price and
                estimated completion date.
              </p>

            </div>


            <div className="workflow-step">

              <span>03</span>

              <strong>
                Stitch
              </strong>

              <p>
                Receive the garment and begin
                stitching after confirmation.
              </p>

            </div>


            <div className="workflow-step">

              <span>04</span>

              <strong>
                Deliver
              </strong>

              <p>
                Complete quality checking and
                hand the garment to logistics.
              </p>

            </div>

          </div>

        </section>

      </main>


      {/* =================================================
          ORDER REVIEW MODAL
      ================================================= */}

      {selectedOrder && (

        <div
          className="order-modal-overlay"
          onClick={closeOrder}
        >

          <div
            className="order-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="order-modal-header">

              <div>

                <span className="order-number">
                  ORDER #
                  {selectedOrder._id
                    ?.slice(-6)
                    .toUpperCase()}
                </span>

                <h2>
                  Stitching Request
                </h2>

                <p>
                  Review the customer's submitted
                  requirements.
                </p>

              </div>


              <button
                type="button"
                className="modal-close"
                onClick={closeOrder}
              >
                ×
              </button>

            </div>


            <div className="order-modal-body">

              {/* =================================================
                  CUSTOMER INFORMATION
              ================================================= */}

              <div className="modal-info-section">

                <h3>
                  Customer Information
                </h3>


                <div className="modal-info-grid">

                  <div>

                    <span>Name</span>

                    <strong>
                      {selectedOrder.customerName ||
                        "—"}
                    </strong>

                  </div>


                  <div>

                    <span>Phone</span>

                    <strong>
                      {selectedOrder.phone ||
                        "—"}
                    </strong>

                  </div>


                  <div>

                    <span>Pickup Date</span>

                    <strong>
                      {formatDate(
                        selectedOrder.pickupDate
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>Pickup Address</span>

                    <strong>
                      {selectedOrder.pickupAddress ||
                        "—"}
                    </strong>

                  </div>

                </div>

              </div>


              {/* =================================================
                  STITCHING REQUIREMENTS
              ================================================= */}

              <div className="modal-info-section">

                <h3>
                  Stitching Requirements
                </h3>


                <div className="modal-info-grid">

                  <div>

                    <span>Garment</span>

                    <strong>
                      {selectedOrder.garment ||
                        selectedOrder.service ||
                        "—"}
                    </strong>

                  </div>


                  <div>

                    <span>Measurement Method</span>

                    <strong>
                      {selectedOrder.measurementOption ===
                      "tailor_visit"
                        ? "Measurement Assistance"
                        : "Customer Provided"}
                    </strong>

                  </div>

                </div>


                <div className="modal-text-block">

                  <span>
                    Design / Reference
                  </span>

                  <p>
                    {selectedOrder.designDescription ||
                      "No design description provided."}
                  </p>

                </div>


                <div className="modal-text-block">

                  <span>
                    Special Requirements
                  </span>

                  <p>
                    {selectedOrder.specialRequirements ||
                      "No special requirements provided."}
                  </p>

                </div>

              </div>


              {/* =================================================
                  MEASUREMENTS
              ================================================= */}

              {selectedOrder.measurements &&
                Object.keys(
                  selectedOrder.measurements
                ).length > 0 && (

                  <div className="modal-info-section">

                    <h3>
                      Measurements
                    </h3>


                    <div className="measurements-grid">

                      {Object.entries(
                        selectedOrder.measurements
                      ).map(
                        ([key, value]) => (

                          <div
                            key={key}
                            className="measurement-item"
                          >

                            <span>
                              {key}
                            </span>

                            <strong>
                              {value}
                            </strong>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              
{selectedOrder.measurementOption === "tailor_visit" && (
  <div className="modal-info-section measurement-appointment-card">
    <h3>Home Measurement Appointment</h3>

    <p>
      <strong>Visit Status:</strong>{" "}
      {selectedOrder.measurementVisitStatus || "Pending"}
    </p>

    
<p className="measurement-requested-slot">
  <strong>Customer Requested</strong>
  <span>
    {formatDate(selectedOrder.measurementDate)}
    {"  |  "}
    {selectedOrder.measurementTime || "Not selected"}
  </span>
</p>


    {selectedOrder.confirmedMeasurementDate && (
      <p>
        <strong>
          {selectedOrder.measurementVisitStatus === "Proposed"
            ? "Proposed Appointment:"
            : "Appointment:"}
        </strong>{" "}
        {formatDate(selectedOrder.confirmedMeasurementDate)} —{" "}
        {selectedOrder.confirmedMeasurementTime}
      </p>
    )}

    {["Pending", "Proposed"].includes(
      selectedOrder.measurementVisitStatus || "Pending"
    ) &&
      selectedOrder.status === "Awaiting Tailor Review" &&
      tailor?.isVerified === true && (
<div className="quote-fields appointment-fields">          <div className="form-field">
            <label>Appointment Date</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
            />
          </div>

          <div className="form-field">
           
<label>Appointment Time</label>
<select
  value={visitTime}
  onChange={(e) => setVisitTime(e.target.value)}
>
  <option value="">Select Time Slot</option>
  <option value="10 AM - 12 PM">10 AM - 12 PM</option>
  <option value="12 PM - 2 PM">12 PM - 2 PM</option>
  <option value="2 PM - 4 PM">2 PM - 4 PM</option>
  <option value="4 PM - 6 PM">4 PM - 6 PM</option>
</select>

          </div>

          <div className="quote-actions appointment-actions">
            <button
              type="button"
              disabled={measurementSaving}
              onClick={() => handleMeasurementAppointment("confirm")}
            >
              Confirm Requested Slot
            </button>

            <button
              type="button"
              disabled={measurementSaving}
              onClick={() => handleMeasurementAppointment("propose")}
            >
              Propose New Slot
            </button>
          </div>
        </div>
      )}

    {selectedOrder.measurementVisitStatus === "Proposed" && (
      <p>Waiting for customer to confirm the proposed time.</p>
    )}

    {selectedOrder.measurementVisitStatus === "Confirmed" &&
      selectedOrder.status === "Awaiting Tailor Review" &&
      tailor?.isVerified === true && (
        <div className="modal-info-section">
          <h3>Assigned Home Visitor</h3>
          {selectedOrder.homeVisitVisitorName && (
            <div>
              {selectedOrder.homeVisitVisitorPhoto && <img src={selectedOrder.homeVisitVisitorPhoto} alt={selectedOrder.homeVisitVisitorName} style={{width: 72, height: 72, objectFit: "cover", borderRadius: 8}} />}
              <p>{selectedOrder.homeVisitVisitorName} ({selectedOrder.homeVisitVisitorType})</p>
            </div>
          )}
          {!selectedOrder.homeVisitVerified && (
            <>
              <div className="form-field">
                <label>Visitor Type</label>
                <select value={visitorType} onChange={e => setVisitorType(e.target.value)}>
                  <option value="Tailor">Tailor</option>
                  <option value="Assistant">Approved Assistant</option>
                </select>
              </div>
              {visitorType === "Assistant" && (
                <div className="form-field">
                  <label>Choose Approved Assistant</label>
                  <select value={visitorAssistantId} onChange={e => setVisitorAssistantId(e.target.value)}>
                    <option value="">Select assistant</option>
                    {assistants.filter(a => a.isActive && a.approvalStatus === "Approved").map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>
              )}
              <button type="button" disabled={measurementSaving || (visitorType === "Assistant" && !visitorAssistantId)} onClick={assignVisitor}>Assign Visitor</button>
              {selectedOrder.homeVisitVisitorName && <button type="button" disabled={measurementSaving} onClick={generateVisitorOtp}>Generate 6-digit Visit OTP</button>}
              {generatedVisitOtp && <p><strong>Visit OTP: {generatedVisitOtp}</strong> (expires in 5 minutes; share only with customer at the visit)</p>}
              <p>Customer must verify this code before the visit can be completed.</p>
            </>
          )}
          {selectedOrder.homeVisitVerified && <p>Customer has verified the visitor.</p>}
        </div>
      )}

    {selectedOrder.measurementVisitStatus === "Confirmed" &&
      selectedOrder.status === "Awaiting Tailor Review" &&
      tailor?.isVerified === true && (
        <div className="clarification-action">
          <h3>Complete Measurement Visit</h3>

          <p>Enter recorded measurements in inches.</p>

          <div className="quote-fields">
            {Object.entries(visitMeasurements).map(([key, value]) => (
              <div className="form-field" key={key}>
                <label>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="200"
                  step="0.1"
                  value={value}
                  onChange={(e) =>
                    setVisitMeasurements((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="form-field">
            <label>Fabric Collected?</label>
            <select
              value={fabricCollected}
              onChange={(e) => setFabricCollected(e.target.value)}
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="form-field">
            <label>Fabric Collection Note (Optional)</label>
            <textarea
              value={fabricCollectionNote}
              onChange={(e) =>
                setFabricCollectionNote(e.target.value)
              }
              placeholder="Fabric details or collection remarks"
              rows="2"
            />
          </div>

          <button
            type="button"
            className="primary-modal-button"
            disabled={measurementSaving || !selectedOrder.homeVisitVerified}
            onClick={handleCompleteMeasurement}
          >
            {measurementSaving
              ? "Saving..."
              : "Save Measurements & Complete Visit"}
          </button>
        </div>
      )}

    {selectedOrder.measurementVisitStatus === "Completed" && (
      <div>
        <p>Measurement visit completed successfully.</p>
        <p>
          <strong>Fabric Collected:</strong>{" "}
          {selectedOrder.fabricCollected ? "Yes" : "No"}
        </p>
        {selectedOrder.fabricCollectionNote && (
          <p>{selectedOrder.fabricCollectionNote}</p>
        )}
      </div>
    )}
  </div>
)}

              {/* =================================================
                  TAILOR RESPONSE
              ================================================= */}

              
{selectedOrder.status === "Awaiting Tailor Review" &&
  (selectedOrder.measurementOption !== "tailor_visit" ||
    selectedOrder.measurementVisitStatus === "Completed") && (


                <div className="modal-action-section">

                  <div className="quote-heading">

                    <span className="section-kicker">
                      YOUR RESPONSE
                    </span>

                    <h3>
                      Provide Stitching Quote
                    </h3>

                    <p>
                      The customer will receive this
                      price and completion estimate for
                      confirmation.
                    </p>

                  </div>


                  <div className="quote-fields">

                    <div className="form-field">

                      <label>
                        Stitching Price (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={stitchingPrice}
                        onChange={(e) =>
                          setStitchingPrice(
                            e.target.value
                          )
                        }
                        placeholder="e.g. 850"
                      />

                    </div>


                    <div className="form-field">

                      <label>
                        Estimated Completion Date
                      </label>

                      <input
  type="date"
  value={estimatedCompletionDate}
  min={new Date().toLocaleDateString("en-CA")}
  onChange={(e) => setEstimatedCompletionDate(e.target.value)}
  required
/>

                    </div>

                  </div>


                  {/* CLARIFICATION */}

                  <div className="clarification-action">

                    <label>
                      Need clarification instead?
                    </label>

                    <textarea
                      value={
                        clarificationMessage
                      }
                      onChange={(e) =>
                        setClarificationMessage(
                          e.target.value
                        )
                      }
                      placeholder="Explain what information you need from the customer..."
                      rows="3"
                    />


                    <button
                      type="button"
                      className="clarification-button"
                      onClick={
                        handleRequestClarification
                      }
                    >
                      Request Clarification
                    </button>

                  </div>


                  {/* QUOTE ACTIONS */}

                  <div className="quote-actions">

                    <button
                      type="button"
                      className="secondary-modal-button"
                      onClick={closeOrder}
                    >
                      Cancel
                    </button>


                    <button
                      type="button"
                      className="primary-modal-button"
                      onClick={handleSendPrice}
                    >
                      Send Price to Customer

                      <span>→</span>
                    </button>

                  </div>

                </div>

              )}


              {/* =================================================
                  WAITING FOR CUSTOMER
              ================================================= */}

              
{selectedOrder.status === "Awaiting Tailor Review" &&
  (selectedOrder.measurementOption !== "tailor_visit" ||
    selectedOrder.measurementVisitStatus === "Completed") && (


                <div className="waiting-customer-box">

                  <div className="waiting-icon">
                    ₹
                  </div>


                  <div>

                    <h3>
                      Waiting for Customer Confirmation
                    </h3>

                    <p>
                      Your stitching quote of{" "}
                      <strong>
                        ₹{selectedOrder.stitchingPrice}
                      </strong>{" "}
                      has been sent to the customer.
                    </p>

                  </div>

                </div>

              )}
   {/* =================================================
    STATUS CONTROLS
================================================= */}

{[
  "Confirmed",
  "Pickup Scheduled",
  "Picked Up",
  "Received by Tailor",
  "Stitching in Progress",
  "Quality Check",
  "Ready for Delivery",
  "Out for Delivery",
  "Reached Customer",
  "Delivered",
].includes(selectedOrder.status) && (
  <div className="status-action-section">

    <div>
      <span className="section-kicker">
        ORDER PROGRESS
      </span>

      <h3>
        Current Status
      </h3>

      <p>
        {selectedOrder.status}
      </p>
    </div>

    <div className="status-buttons">

      {/* CONFIRMED → PICKUP SCHEDULED */}

      {selectedOrder.status === "Confirmed" && (
        <button
          type="button"
          onClick={() =>
            updateOrderStatus(
              selectedOrder._id,
              "Pickup Scheduled"
            )
          }
        >
          Schedule Pickup
        </button>
      )}

      {/* PICKUP SCHEDULED → PICKED UP */}

      {selectedOrder.status === "Pickup Scheduled" && (
        <button
          type="button"
          onClick={() =>
            updateOrderStatus(
              selectedOrder._id,
              "Picked Up"
            )
          }
        >
          Mark Picked Up
        </button>
      )}

      {/* PICKED UP → RECEIVED BY TAILOR */}

      {selectedOrder.status === "Picked Up" && (
        <button
          type="button"
          onClick={() =>
            updateOrderStatus(
              selectedOrder._id,
              "Received by Tailor"
            )
          }
        >
          Mark Received
        </button>
      )}

      {/* RECEIVED → STITCHING */}

      {selectedOrder.status === "Received by Tailor" && (
        <button
          type="button"
          onClick={() =>
            updateOrderStatus(
              selectedOrder._id,
              "Stitching in Progress"
            )
          }
        >
          Start Stitching
        </button>
      )}

      {/* STITCHING → QUALITY CHECK */}

      {selectedOrder.status === "Stitching in Progress" && (
        <button
          type="button"
          onClick={() =>
            updateOrderStatus(
              selectedOrder._id,
              "Quality Check"
            )
          }
        >
          Start Quality Check
        </button>
      )}

      {/* QUALITY CHECK → READY */}

      {selectedOrder.status === "Quality Check" && (
        <button
          type="button"
          onClick={() =>
            updateOrderStatus(
              selectedOrder._id,
              "Ready for Delivery"
            )
          }
        >
          Mark Ready for Delivery
        </button>
      )}

      {/* READY → OUT FOR DELIVERY */}

      {selectedOrder.status === "Ready for Delivery" && (
        <button
          type="button"
          onClick={() =>
            updateOrderStatus(
              selectedOrder._id,
              "Out for Delivery"
            )
          }
        >
          Send for Delivery
        </button>
      )}

      {/* OUT FOR DELIVERY → REACHED CUSTOMER */}

      {selectedOrder.status === "Out for Delivery" && (
        <button
          type="button"
          onClick={() =>
            updateOrderStatus(
              selectedOrder._id,
              "Reached Customer"
            )
          }
        >
          Mark Reached Customer
        </button>
      )}

      {/* REACHED CUSTOMER → DELIVERED */}

      {selectedOrder.status === "Reached Customer" && (
        <button
          type="button"
          onClick={() =>
            updateOrderStatus(
              selectedOrder._id,
              "Delivered"
            )
          }
        >
          Mark Delivered
        </button>
      )}

    </div>
  </div>
)} 


             

                

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default TailorDashboard;
