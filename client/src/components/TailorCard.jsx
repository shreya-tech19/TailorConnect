import "./TailorCard.css";
import { useNavigate } from "react-router-dom";

function TailorCard({ tailor }) {
  const navigate = useNavigate();

  const tailorId = tailor._id || tailor.id;

  const image =
    tailor.profileImage ||
    tailor.image ||
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80";

  const specialization =
    tailor.specialization ||
    tailor.speciality ||
    "Custom Stitching";

  const availability =
    tailor.availability ||
    (tailor.isAvailable === false
      ? "Not Available"
      : "Available");

  const isAvailable =
    availability.toLowerCase().includes("available") &&
    !availability.toLowerCase().includes("not");

  return (
    <div className="tailor-card">

      <div className="tailor-image-wrapper">

        <img
          className="tailor-image"
          src={image}
          alt={`${tailor.shopName || "Tailor"} profile`}
        />

        <span
          className={
            isAvailable
              ? "tailor-availability available"
              : "tailor-availability unavailable"
          }
        >
          <span className="availability-dot"></span>
          {isAvailable ? "Available" : "Not Available"}
        </span>

      </div>

      <div className="tailor-content">

        <div className="tailor-heading">

          <div>
            <h2>
              {tailor.shopName}
            </h2>

            <p className="tailor-owner">
              By {tailor.ownerName}
            </p>
          </div>

          {tailor.rating && (
            <div className="tailor-rating">
              ★ {tailor.rating}
            </div>
          )}

        </div>

        <div className="tailor-details">

          <p>
            <span>📍</span>
            {tailor.city}
          </p>

          <p>
            <span>✂</span>
            {specialization}
          </p>

          <p>
            <span>🏆</span>
            {tailor.experience || 0} Years Experience
          </p>

          <p>
            <span>₹</span>
            {tailor.priceRange || "Contact Tailor"}
          </p>

        </div>

        <button
          className="tailor-btn"
          onClick={() => navigate(`/tailor/${tailorId}`)}
        >
          View Profile
          <span>→</span>
        </button>

      </div>

    </div>
  );
}

export default TailorCard;