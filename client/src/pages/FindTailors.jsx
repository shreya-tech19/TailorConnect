import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "./FindTailors.css";

function FindTailors() {
  const [tailors, setTailors] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchTailors = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await API.get("/tailors");
        setTailors(response.data || []);
      } catch (error) {
        console.error("FETCH TAILORS ERROR:", error);

        setErrorMessage(
          error.response?.data?.message ||
            "Unable to load tailors. Please make sure the server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTailors();
  }, []);

  const filteredTailors = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) return tailors;

    return tailors.filter((tailor) => {
      const searchableText = [
        tailor.shopName,
        tailor.ownerName,
        tailor.city,
        tailor.address,
        tailor.specialization,
        tailor.speciality,
        tailor.description,
        tailor.priceRange,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [tailors, searchText]);

  const getAvailability = (tailor) => {
    if (tailor.isAvailable !== undefined) {
      return tailor.isAvailable;
    }

    if (tailor.availability !== undefined) {
      return String(tailor.availability).toLowerCase() === "available";
    }

    return true;
  };

  // Reset visible cards when search changes
  useEffect(() => {
    setVisibleCount(6);
  }, [searchText]);

  return (
    <div className="find-tailors-page">
      {/* =========================
          HEADER
      ========================== */}
      <section className="find-header">
        <p className="find-header-small">
          ✦ FIND YOUR PERFECT FIT
        </p>

        <h1>
          Find a tailor who
          <br />
          understands your style.
        </h1>

        <p className="find-header-description">
          Explore verified tailoring professionals across Maharashtra,
          discover their specialties, and choose the right tailor for
          your next stitching order.
        </p>
      </section>

      {/* =========================
          SEARCH
      ========================== */}
      <section className="search-section">
        <form
          className="single-search-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search by city, tailor, specialization..."
            aria-label="Search tailors"
          />

          <button type="submit">
            Search
          </button>
        </form>
      </section>

      {/* =========================
          RESULTS
      ========================== */}
      <section className="results-section">
        <div className="results-heading">
          <div>
            <p>TAILORCONNECT DIRECTORY</p>

            <h2>
              {loading
                ? "Finding Tailors..."
                : `${filteredTailors.length} Tailor${
                    filteredTailors.length !== 1 ? "s" : ""
                  } Found`}
            </h2>
          </div>

          {searchText && !loading && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearchText("")}
            >
              Clear Search
            </button>
          )}
        </div>

        {/* =========================
            LOADING
        ========================== */}
        {loading && (
          <div className="tailor-loading">
            <div className="loading-spinner"></div>

            <p>Loading verified tailors...</p>
          </div>
        )}

        {/* =========================
            ERROR
        ========================== */}
        {!loading && errorMessage && (
          <div className="no-results">
            <h2>Unable to Load Tailors</h2>

            <p>{errorMessage}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* =========================
            TAILOR GRID
        ========================== */}
        {!loading &&
          !errorMessage &&
          filteredTailors.length > 0 && (
            <>
              <div className="tailor-grid">
                {filteredTailors
                  .slice(0, visibleCount)
                  .map((tailor, index) => {
                    const isAvailable = getAvailability(tailor);

                    const tailorId = tailor._id || tailor.id;

                    const imageUrl = tailor.profileImage;

                    const specialization =
                      tailor.specialization ||
                      tailor.speciality ||
                      "Custom Stitching";

                    return (
                      <article
                        className="tailor-card"
                        key={tailorId}
                        style={{
                          "--card-delay": `${index * 0.08}s`,
                        }}
                      >
                        {/* =========================
                            IMAGE
                        ========================== */}
                        <div className="tailor-image-wrapper">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={
                                tailor.shopName ||
                                "Tailor"
                              }
                              className="tailor-card-image"
                            />
                          ) : (
                            <div className="tailor-image-placeholder">
                              <span>
                                {tailor.shopName
                                  ?.charAt(0)
                                  ?.toUpperCase() || "T"}
                              </span>
                            </div>
                          )}

                          <span
                            className={`availability-badge ${
                              isAvailable
                                ? "available"
                                : "busy"
                            }`}
                          >
                            {isAvailable
                              ? "Available"
                              : "Currently Unavailable"}
                          </span>
                        </div>

                        {/* =========================
                            CARD CONTENT
                        ========================== */}
                        <div className="tailor-card-content">
                          <div className="tailor-verified">
                            ✓ Verified Tailor
                          </div>

                          <h2>
                            {tailor.shopName ||
                              "Tailor Shop"}
                          </h2>

                          <h3>
                            {specialization}
                          </h3>

                          <p className="tailor-owner">
                            By{" "}
                            {tailor.ownerName ||
                              "Tailor"}
                          </p>

                          <div className="tailor-location">
                            📍{" "}
                            {tailor.city ||
                              "Maharashtra"}
                          </div>

                          <div className="tailor-details">
                            <span>
                              ✦{" "}
                              {tailor.experience || 0}{" "}
                              years experience
                            </span>

                            <span>
                              ₹{" "}
                              {tailor.priceRange ||
                                "Price on request"}
                            </span>
                          </div>

                          <p className="tailor-description">
                            {tailor.description ||
                              "Customized stitching based on your requirements."}
                          </p>

                          <div className="card-divider"></div>

                          <Link
                            to={`/tailor/${tailorId}`}
                            className="view-profile-button"
                          >
                            View Tailor Profile
                          </Link>
                        </div>
                      </article>
                    );
                  })}
              </div>

              {/* =========================
                  SHOW MORE / LESS
              ========================== */}
              {filteredTailors.length > 6 && (
                <div className="show-more-container">
                  {visibleCount < filteredTailors.length ? (
                    <button
                      type="button"
                      className="show-more-btn"
                      onClick={() =>
                        setVisibleCount(
                          (previousCount) =>
                            previousCount + 6
                        )
                      }
                    >
                      <span>＋</span>
                      Show More Tailors
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="show-more-btn show-less-btn"
                      onClick={() =>
                        setVisibleCount(6)
                      }
                    >
                      <span>−</span>
                      Show Less
                    </button>
                  )}
                </div>
              )}
            </>
          )}

        {/* =========================
            NO RESULTS
        ========================== */}
        {!loading &&
          !errorMessage &&
          filteredTailors.length === 0 && (
            <div className="no-results">
              <h2>No Tailors Found</h2>

              <p>
                We could not find a tailor matching
                your search. Try another city,
                specialization or tailor name.
              </p>

              <button
                type="button"
                onClick={() => setSearchText("")}
              >
                View All Tailors
              </button>
            </div>
          )}
      </section>
    </div>
  );
}

export default FindTailors;