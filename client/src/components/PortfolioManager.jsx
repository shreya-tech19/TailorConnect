import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function PortfolioManager({ tailor }) {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const imageInputRef = useRef(null);

  const tailorId = tailor?._id || tailor?.id;

  /* =====================================================
     FETCH DESIGNS
  ===================================================== */

  const fetchDesigns = async () => {
    if (!tailorId) return;

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await API.get(
        `/designs/tailor/${tailorId}`
      );

      setDesigns(response.data?.designs || []);
    } catch (error) {
      console.error("FETCH PORTFOLIO ERROR:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load portfolio."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [tailorId]);

  /* =====================================================
     RESET FORM
  ===================================================== */

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setPrice("");
    setDescription("");
    setImage("");
    setEditingDesign(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  /* =====================================================
     OPEN ADD FORM
  ===================================================== */

  const openAddForm = () => {
    resetForm();
    setMessage("");
    setErrorMessage("");
    setShowForm(true);
  };

  /* =====================================================
     OPEN EDIT FORM
  ===================================================== */

  const openEditForm = (design) => {
    setEditingDesign(design);

    setTitle(design.title || "");
    setCategory(design.category || "");
    setPrice(design.price ?? "");
    setDescription(design.description || "");
    setImage(design.image || "");

    setMessage("");
    setErrorMessage("");
    setShowForm(true);
  };

  /* =====================================================
     CLOSE FORM
  ===================================================== */

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  /* =====================================================
     IMAGE UPLOAD
  ===================================================== */

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be less than 5MB.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setMessage("");

      const formData = new FormData();
      formData.append("image", file);

      const response = await API.post(
        "/upload",
        formData
      );

      const imageUrl = response.data?.imageUrl;

      if (!imageUrl) {
        throw new Error(
          "Cloudinary did not return an image URL."
        );
      }

      setImage(imageUrl);
      setMessage("Design image uploaded successfully.");
    } catch (error) {
      console.error("DESIGN IMAGE UPLOAD ERROR:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to upload design image."
      );
    } finally {
      setSaving(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  /* =====================================================
     SAVE DESIGN
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Please enter a design title.");
      return;
    }

    if (!category.trim()) {
      setErrorMessage("Please enter a category.");
      return;
    }

    if (
      price === "" ||
      Number.isNaN(Number(price)) ||
      Number(price) < 0
    ) {
      setErrorMessage("Please enter a valid starting price.");
      return;
    }

    if (!image) {
      setErrorMessage("Please upload a design image.");
      return;
    }

    try {
      setSaving(true);

      const designData = {
        title: title.trim(),
        category: category.trim(),
        price: Number(price),
        description: description.trim(),
        image,
      };

      if (editingDesign) {
        const response = await API.patch(
          `/designs/${editingDesign._id}`,
          designData
        );

        setMessage(
          response.data?.message ||
            "Design updated successfully."
        );
      } else {
        const response = await API.post(
          "/designs",
          {
            tailor: tailorId,
            ...designData,
          }
        );

        setMessage(
          response.data?.message ||
            "Design added successfully."
        );
      }

      await fetchDesigns();

      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("SAVE DESIGN ERROR:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to save design."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     DELETE DESIGN
  ===================================================== */

  const handleDelete = async (designId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this design?"
    );

    if (!confirmed) return;

    try {
      setErrorMessage("");
      setMessage("");

      await API.delete(`/designs/${designId}`);

      setDesigns((current) =>
        current.filter(
          (design) => design._id !== designId
        )
      );

      setMessage("Design deleted successfully.");
    } catch (error) {
      console.error("DELETE DESIGN ERROR:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to delete design."
      );
    }
  };

  return (
    <section
      id="portfolio-section"
      className="portfolio-manager-section"
    >
      <div className="portfolio-manager-header">
        <div>
          <span className="portfolio-manager-kicker">
            PORTFOLIO
          </span>

          <h2>Showcase your tailoring work</h2>

          <p>
            Add your best stitching work so customers
            can see your designs before placing an order.
          </p>
        </div>

        <button
          type="button"
          className="portfolio-add-button"
          onClick={openAddForm}
        >
          + Add New Design
        </button>
      </div>

      {message && (
        <div className="portfolio-message portfolio-success">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="portfolio-message portfolio-error">
          {errorMessage}
        </div>
      )}

      {/* =================================================
          ADD / EDIT FORM
      ================================================= */}

      {showForm && (
        <div className="portfolio-form-card">
          <div className="portfolio-form-header">
            <div>
              <span>
                {editingDesign
                  ? "EDIT DESIGN"
                  : "NEW DESIGN"}
              </span>

              <h3>
                {editingDesign
                  ? "Update portfolio design"
                  : "Add a portfolio design"}
              </h3>
            </div>

            <button
              type="button"
              className="portfolio-close-button"
              onClick={closeForm}
              disabled={saving}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="portfolio-form-grid">
              {/* IMAGE */}

              <div className="portfolio-image-upload">
                <label>Design Photo</label>

                <div className="portfolio-image-preview">
                  {image ? (
                    <img
                      src={image}
                      alt="Design preview"
                    />
                  ) : (
                    <div className="portfolio-image-placeholder">
                      <span>＋</span>
                      <small>
                        Upload your design
                      </small>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="portfolio-upload-button"
                  onClick={() =>
                    imageInputRef.current?.click()
                  }
                  disabled={saving}
                >
                  {image
                    ? "Change Image"
                    : "Upload Image"}
                </button>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />

                <small className="portfolio-upload-note">
                  JPG, PNG or WEBP • Maximum 5MB
                </small>
              </div>

              {/* DETAILS */}

              <div className="portfolio-form-fields">
                <div className="portfolio-field">
                  <label>Design Title</label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="e.g. Wedding Sherwani"
                  />
                </div>

                <div className="portfolio-field">
                  <label>Garment Category</label>

                  <input
                    type="text"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    placeholder="e.g. Sherwani"
                  />
                </div>

                <div className="portfolio-field">
                  <label>Starting Price</label>

                  <div className="portfolio-price-input">
                    <span>₹</span>

                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value)
                      }
                      placeholder="2500"
                    />
                  </div>
                </div>

                <div className="portfolio-field">
                  <label>Description</label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Describe the stitching, fabric, embroidery or customization..."
                    rows="5"
                  />
                </div>
              </div>
            </div>

            <div className="portfolio-form-actions">
              <button
                type="button"
                className="portfolio-cancel-button"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="portfolio-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingDesign
                  ? "Update Design"
                  : "Add to Portfolio"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================
          DESIGN LIST
      ================================================= */}

      {loading ? (
        <div className="portfolio-empty-state">
          <p>Loading your portfolio...</p>
        </div>
      ) : designs.length === 0 ? (
        <div className="portfolio-empty-state">
          <div className="portfolio-empty-icon">
            ✂
          </div>

          <h3>Your portfolio is empty</h3>

          <p>
            Add your first design to show customers
            what you can create.
          </p>

          <button
            type="button"
            className="portfolio-empty-button"
            onClick={openAddForm}
          >
            + Add Your First Design
          </button>
        </div>
      ) : (
        <div className="portfolio-design-grid">
          {designs.map((design) => (
            <article
              className="portfolio-design-card"
              key={design._id}
            >
              <div className="portfolio-design-image">
                <img
                  src={design.image}
                  alt={design.title}
                />

                <div className="portfolio-design-actions">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(design)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(design._id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="portfolio-design-info">
                <span>{design.category}</span>

                <h3>{design.title}</h3>

                <strong>
                  Starting ₹{Number(design.price).toLocaleString("en-IN")}
                </strong>

                {design.description && (
                  <p>{design.description}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default PortfolioManager;