import "./TailorProfile.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import mockTailors from "../data/mockTailors";
import mockDesigns from "../data/mockDesigns";
import DesignCard from "../components/DesignCard";

function TailorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tailor, setTailor] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);

  useEffect(() => {
    fetchTailor();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDesigns();
    }
  }, [id]);

  const fetchTailor = async () => {
    try {
      const response = await API.get(`/tailors/${id}`);
      setTailor(response.data);
    } catch (error) {
      console.log("Using mock tailor data.");

      const mockTailor = mockTailors.find(
        (item) => String(item.id) === String(id)
      );

      setTailor(mockTailor || null);
    }
  };

  const fetchDesigns = async () => {
    try {
      setLoadingDesigns(true);

      const response = await API.get(
        `/designs/tailor/${id}`
      );

      const apiDesigns = response.data?.designs || [];

      setDesigns(apiDesigns);
    } catch (error) {
      console.log(
        "Unable to load database portfolio. Using mock designs."
      );

      const mockTailorDesigns = mockDesigns.filter(
        (design) =>
          String(design.tailorId) === String(id)
      );

      setDesigns(mockTailorDesigns);
    } finally {
      setLoadingDesigns(false);
    }
  };

  if (!tailor) {
    return (
      <div className="profile-loading">
        <h2>Tailor not found</h2>

        <button onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  const tailorId = tailor._id || tailor.id;

  const isAvailable =
    tailor.isAvailable !== undefined
      ? tailor.isAvailable
      : tailor.availability
        ? String(tailor.availability).toLowerCase() ===
          "available"
        : true;

  const handlePlaceOrder = (design = null) => {
    if (!isAvailable) {
      return;
    }

    if (!tailorId) {
      console.error("Tailor ID is missing.");
      return;
    }

    navigate(`/place-order/${tailorId}`, {
      state: {
        selectedDesign: design,
        tailor,
      },
    });
  };

  return (
    <div className="profile-container">

      {/* ================= PROFILE HEADER ================= */}

      <section className="profile-hero">

        <div className="profile-image-wrapper">
          <img
            src={
              tailor.profileImage ||
              tailor.image ||
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"
            }
            alt={tailor.shopName || "Tailor"}
            className="profile-image"
          />
        </div>

        <div className="profile-details">

          <div className="profile-title-row">

            <div>
              <h1>{tailor.shopName}</h1>

              <p className="owner-name">
                By {tailor.ownerName}
              </p>
            </div>

            {tailor.isVerified && (
              <span className="verified-badge">
                ✓ Verified
              </span>
            )}

          </div>

          <div className="profile-info-grid">

            <div>
              <span>📍</span>
              <p>
                <strong>Location</strong>
                <br />
                {tailor.city || "Not provided"}
              </p>
            </div>

            <div>
              <span>✂️</span>
              <p>
                <strong>Specialization</strong>
                <br />
                {tailor.specialization ||
                  tailor.speciality ||
                  "Custom Stitching"}
              </p>
            </div>

            <div>
              <span>⭐</span>
              <p>
                <strong>Rating</strong>
                <br />
                {tailor.rating || "New Tailor"}
              </p>
            </div>

            <div>
              <span>🏆</span>
              <p>
                <strong>Experience</strong>
                <br />
                {tailor.experience || 0} Years
              </p>
            </div>

          </div>

          <div
            className={
              isAvailable
                ? "availability available"
                : "availability unavailable"
            }
          >
            <span className="availability-dot"></span>

            {isAvailable
              ? tailor.availabilityMessage ||
                "Available for new stitching orders"
              : "Currently not accepting new orders"}
          </div>

        </div>

      </section>

      {/* ================= PORTFOLIO ================= */}

      <section className="designs-section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              TAILOR'S PORTFOLIO
            </p>

            <h2>
              Designs You Can Get Stitched
            </h2>

            <p>
              Explore this tailor's actual work and
              choose a design for your stitching order.
            </p>
          </div>

        </div>

        {loadingDesigns ? (
          <div className="no-designs">
            <h3>Loading portfolio...</h3>
            <p>
              Fetching the tailor's latest designs.
            </p>
          </div>
        ) : designs.length > 0 ? (
          <div className="design-grid">

            {designs.map((design) => (
              <DesignCard
                key={design._id || design.id}
                design={design}
                isAvailable={isAvailable}
                onSelect={handlePlaceOrder}
              />
            ))}

          </div>
        ) : (
          <div className="no-designs">

            <h3>No designs available yet</h3>

            <p>
              This tailor has not added portfolio
              designs yet.
            </p>

          </div>
        )}

      </section>

      {/* ================= ABOUT ================= */}

      <section className="about-section">

        <div className="about-card">

          <p className="section-label">
            ABOUT THE TAILOR
          </p>

          <h2>
            {tailor.shopName}
          </h2>

          <p>
            {tailor.description ||
              "This tailor provides customized stitching services based on customer requirements and measurements."}
          </p>

          <div className="about-details">

            <div>
              <strong>Address</strong>
              <span>
                {tailor.address || "Not provided"}
              </span>
            </div>

            <div>
              <strong>Price Range</strong>
              <span>
                {tailor.priceRange ||
                  "Contact tailor"}
              </span>
            </div>

            <div>
              <strong>Experience</strong>
              <span>
                {tailor.experience || 0} Years
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* ================= STICKY CTA ================= */}

      <div className="profile-cta">

        <div>
          <strong>
            {isAvailable
              ? "Ready to get your outfit stitched?"
              : "This tailor is currently unavailable"}
          </strong>

          <span>
            {isAvailable
              ? "Choose a portfolio design or create your own custom style."
              : "Please check back later or explore another tailor."}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handlePlaceOrder()}
          disabled={!isAvailable}
          className={
            isAvailable
              ? "place-order-btn"
              : "place-order-btn disabled"
          }
        >
          {isAvailable
            ? "Place Stitching Order →"
            : "Currently Unavailable"}
        </button>

      </div>

    </div>
  );
}

export default TailorProfile;
