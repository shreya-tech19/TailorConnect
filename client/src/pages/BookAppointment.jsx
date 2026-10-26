import "./BookAppointment.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tailor, setTailor] = useState(null);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",

    gender: "",
    garment: "",

    designDescription: "",
    specialRequirements: "",

    measurementOption: "already_have",

    measurements: {},

    measurementDate: "",
    measurementTime: "",

    pickupAddress: "",
    pickupDate: "",
  });

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {

        alert(
            "Please login to place a stitching order."
        );

        navigate("/login", {
            state: {
                from: `/book/${id}`,
            },
        });

        return;
    }

}, [id, navigate]);

  // =============================
  // FETCH TAILOR
  // =============================

  useEffect(() => {
    fetchTailor();
  }, [id]);

  const fetchTailor = async () => {
    try {
      const res = await API.get(`/tailors/${id}`);
      setTailor(res.data);
    } catch (err) {
      console.log("TAILOR ERROR:", err);
    }
  };

  // =============================
  // GARMENT CATEGORIES
  // =============================

  const garmentCategories = {
    Women: [
      "Blouse",
      "Kurti",
      "Salwar Suit",
      "Lehenga",
      "Dress",
      "Other",
    ],

    Men: [
      "Shirt",
      "Trouser",
      "Kurta",
      "Sherwani",
      "Other",
    ],

    Kids: [
      "Frock",
      "Shirt",
      "Trouser",
      "Kurta",
      "Dress",
      "Other",
    ],
  };

  // =============================
  // GARMENT MEASUREMENT FIELDS
  // =============================

  const measurementFields = {
    // ---------- WOMEN ----------

    Blouse: [
      ["bust", "Bust", "e.g. 36"],
      ["underBust", "Under Bust", "e.g. 32"],
      ["waist", "Waist", "e.g. 30"],
      ["shoulder", "Shoulder", "e.g. 14"],
      ["armhole", "Armhole", "e.g. 16"],
      ["sleeveLength", "Sleeve Length", "e.g. 10"],
      ["blouseLength", "Blouse Length", "e.g. 15"],
    ],

    Kurti: [
      ["bust", "Bust", "e.g. 36"],
      ["waist", "Waist", "e.g. 30"],
      ["hip", "Hip", "e.g. 38"],
      ["shoulder", "Shoulder", "e.g. 14"],
      ["armhole", "Armhole", "e.g. 16"],
      ["sleeveLength", "Sleeve Length", "e.g. 22"],
      ["kurtiLength", "Kurti Length", "e.g. 42"],
    ],

    "Salwar Suit": [
      ["bust", "Bust", "e.g. 36"],
      ["waist", "Waist", "e.g. 30"],
      ["hip", "Hip", "e.g. 38"],
      ["shoulder", "Shoulder", "e.g. 14"],
      ["armhole", "Armhole", "e.g. 16"],
      ["sleeveLength", "Sleeve Length", "e.g. 22"],
      ["kurtaLength", "Kurta Length", "e.g. 42"],
      ["salwarLength", "Salwar Length", "e.g. 38"],
    ],

    Lehenga: [
      ["bust", "Bust", "e.g. 36"],
      ["underBust", "Under Bust", "e.g. 32"],
      ["waist", "Waist", "e.g. 30"],
      ["hip", "Hip", "e.g. 38"],
      ["shoulder", "Shoulder", "e.g. 14"],
      ["blouseLength", "Blouse Length", "e.g. 15"],
      ["lehengaLength", "Lehenga Length", "e.g. 42"],
      ["flare", "Lehenga Flare", "e.g. 80"],
    ],

    Dress: [
      ["bust", "Bust", "e.g. 36"],
      ["waist", "Waist", "e.g. 30"],
      ["hip", "Hip", "e.g. 38"],
      ["shoulder", "Shoulder", "e.g. 14"],
      ["armhole", "Armhole", "e.g. 16"],
      ["sleeveLength", "Sleeve Length", "e.g. 22"],
      ["dressLength", "Dress Length", "e.g. 45"],
    ],

    // ---------- MEN ----------

    Shirt: [
      ["chest", "Chest", "e.g. 40"],
      ["waist", "Waist", "e.g. 36"],
      ["shoulder", "Shoulder", "e.g. 17"],
      ["neck", "Neck", "e.g. 15"],
      ["armhole", "Armhole", "e.g. 18"],
      ["sleeveLength", "Sleeve Length", "e.g. 24"],
      ["shirtLength", "Shirt Length", "e.g. 29"],
    ],

    Trouser: [
      ["waist", "Waist", "e.g. 32"],
      ["hip", "Hip", "e.g. 38"],
      ["thigh", "Thigh", "e.g. 22"],
      ["knee", "Knee", "e.g. 16"],
      ["ankle", "Ankle", "e.g. 14"],
      ["trouserLength", "Trouser Length", "e.g. 40"],
    ],

    Kurta: [
      ["chest", "Chest", "e.g. 40"],
      ["waist", "Waist", "e.g. 36"],
      ["shoulder", "Shoulder", "e.g. 17"],
      ["sleeveLength", "Sleeve Length", "e.g. 24"],
      ["kurtaLength", "Kurta Length", "e.g. 40"],
    ],

    Sherwani: [
      ["chest", "Chest", "e.g. 40"],
      ["waist", "Waist", "e.g. 36"],
      ["shoulder", "Shoulder", "e.g. 17"],
      ["sleeveLength", "Sleeve Length", "e.g. 24"],
      ["sherwaniLength", "Sherwani Length", "e.g. 42"],
    ],

    // ---------- KIDS ----------

    Frock: [
      ["chest", "Chest", "e.g. 28"],
      ["waist", "Waist", "e.g. 26"],
      ["shoulder", "Shoulder", "e.g. 12"],
      ["sleeveLength", "Sleeve Length", "e.g. 18"],
      ["frockLength", "Frock Length", "e.g. 30"],
    ],

    // ---------- OTHER ----------

    Other: [
      ["bust", "Bust / Chest", "e.g. 36"],
      ["waist", "Waist", "e.g. 30"],
      ["hip", "Hip", "e.g. 38"],
      ["shoulder", "Shoulder", "e.g. 14"],
      ["sleeveLength", "Sleeve Length", "e.g. 22"],
      ["garmentLength", "Garment Length", "e.g. 40"],
    ],
  };

  // =============================
  // HANDLE NORMAL INPUT
  // =============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =============================
  // HANDLE GENDER CHANGE
  // =============================

  const handleGenderChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      gender: e.target.value,
      garment: "",
      measurements: {},
    }));
  };

  // =============================
  // HANDLE MEASUREMENT CHANGE
  // =============================

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [name]: value,
      },
    }));
  };

  // =============================
  // HANDLE GARMENT CHANGE
  // =============================

  const handleGarmentChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      garment: e.target.value,
      measurements: {},
    }));
  };

  // =============================
  // SUBMIT ORDER
  // =============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -----------------------------
    // CHECK CUSTOMER LOGIN
    // -----------------------------

    const customer = localStorage.getItem("customer");
    const token = localStorage.getItem("token");

    if (!customer || !token) {
      alert(
        "Please login or create a customer account before placing a stitching order."
      );

      navigate("/login", {
        state: {
          from: `/tailor/${id}/book`,
        },
      });

      return;
    }

    // -----------------------------
    // CHECK TAILOR AVAILABILITY
    // -----------------------------

    if (tailor && tailor.isAvailable === false) {
      alert(
        tailor.availabilityMessage ||
          "This tailor is currently not available for new orders."
      );

      return;
    }

    try {
      const orderData = {
        customerName: formData.customerName,
        phone: formData.phone,

        tailor: id,

        gender: formData.gender,
        garment: formData.garment,

        // Keep service because your current backend expects it.
        service: formData.garment,

        designDescription: formData.designDescription,

        specialRequirements:
          formData.specialRequirements,

        measurementOption:
          formData.measurementOption,

        measurements:
          formData.measurementOption === "already_have"
            ? formData.measurements
            : {},

        measurementDate:
          formData.measurementOption === "tailor_visit"
            ? formData.measurementDate
            : null,

        measurementTime:
          formData.measurementOption === "tailor_visit"
            ? formData.measurementTime
            : null,

        pickupAddress: formData.pickupAddress,

        pickupDate: formData.pickupDate,
      };

      console.log("ORDER DATA:", orderData);

      const response = await API.post(
        "/orders",
        orderData
      );

      alert(
        response.data.message ||
          "Your stitching order has been placed successfully!"
      );

      // -----------------------------
      // RESET FORM
      // -----------------------------

      setFormData({
        customerName: "",
        phone: "",
        gender: "",
        garment: "",
        designDescription: "",
        specialRequirements: "",
        measurementOption: "already_have",
        measurements: {},
        measurementDate: "",
        measurementTime: "",
        pickupAddress: "",
        pickupDate: "",
      });

      // Later we will create this page.
      // navigate("/my-orders");

    } catch (err) {
      console.log("ORDER ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Order could not be placed. Please try again."
      );
    }
  };

  // =============================
  // LOADING
  // =============================

  if (!tailor) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "100px",
        }}
      >
        <h2>Loading tailor details...</h2>
      </div>
    );
  }

  // =============================
  // CURRENT MEASUREMENT FIELDS
  // =============================

  const currentMeasurementFields =
    measurementFields[formData.garment] || [];

  // =============================
  // PAGE
  // =============================

  return (
    <div className="booking-page">

      {/* =================================
          LEFT SIDE - ORDER FORM
      ================================= */}

      <div className="booking-form">

        <h1 className="order-title">
          Place Your Stitching Order
        </h1>

        <p className="order-subtitle">
          Select who the garment is for, choose the
          garment, provide your design requirements,
          and add your measurements.
        </p>

        <form onSubmit={handleSubmit}>

          {/* =================================
              1. CUSTOMER DETAILS
          ================================= */}

          <h2>1. Customer Details</h2>

          <label>👤 Customer Name</label>

          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />

          <label>📞 Phone Number</label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            required
          />

          {/* =================================
              2. CATEGORY
          ================================= */}

          <h2>2. Who is the garment for?</h2>

          <label>👤 Select Category</label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleGenderChange}
            required
          >
            <option value="">
              Select Category
            </option>

            <option value="Women">
              Women
            </option>

            <option value="Men">
              Men
            </option>

            <option value="Kids">
              Kids
            </option>
          </select>

          {/* =================================
              3. GARMENT
          ================================= */}

          <h2>3. Garment Details</h2>

          <label>👗 Select Garment</label>

          <select
            name="garment"
            value={formData.garment}
            onChange={handleGarmentChange}
            required
            disabled={!formData.gender}
          >
            <option value="">
              Select Garment
            </option>

            {formData.gender &&
              garmentCategories[
                formData.gender
              ].map((garment) => (
                <option
                  key={garment}
                  value={garment}
                >
                  {garment}
                </option>
              ))}
          </select>

          {/* =================================
              4. DESIGN & STYLE
          ================================= */}

          <h2>4. Design & Style</h2>

          <label>
            🎨 Design / Style Description
          </label>

          <textarea
            name="designDescription"
            value={formData.designDescription}
            onChange={handleChange}
            placeholder="Describe the design you want..."
            rows="5"
            required
          />

          <label>
            📝 Special Requirements
          </label>

          <textarea
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleChange}
            placeholder="Sleeves, neckline, fitting preference, embroidery, etc."
            rows="4"
          />

          {/* =================================
              5. MEASUREMENTS
          ================================= */}

          <h2>5. Measurements</h2>

          <p className="measurement-info">
            If you already know your measurements,
            enter them below. If you are unsure,
            you can request measurement assistance
            from the selected tailor or their trained
            helper.
          </p>

          <div className="measurement-options">

            <label className="radio-option">

              <input
                type="radio"
                name="measurementOption"
                value="already_have"
                checked={
                  formData.measurementOption ===
                  "already_have"
                }
                onChange={handleChange}
              />

              I already have my measurements

            </label>

            <label className="radio-option">

              <input
                type="radio"
                name="measurementOption"
                value="tailor_visit"
                checked={
                  formData.measurementOption ===
                  "tailor_visit"
                }
                onChange={handleChange}
              />

              I need measurement assistance

            </label>

          </div>

          {/* =================================
              CUSTOMER MEASUREMENTS
          ================================= */}

          {formData.measurementOption ===
            "already_have" &&
            formData.garment && (

              <div className="measurement-box">

                <h3>
                  {formData.garment} Measurements
                </h3>

                <p className="measurement-unit">
                  Enter measurements in inches.
                </p>

                <div className="measurement-grid">

                  {currentMeasurementFields.map(
                    ([
                      fieldName,
                      label,
                      placeholder,
                    ]) => (

                      <div key={fieldName}>

                        <label>
                          {label}
                        </label>

                        <input
                          type="number"
                          step="0.1"
                          name={fieldName}
                          value={
                            formData
                              .measurements[
                              fieldName
                            ] || ""
                          }
                          onChange={
                            handleMeasurementChange
                          }
                          placeholder={
                            placeholder
                          }
                          required
                        />

                      </div>

                    )
                  )}

                </div>

              </div>
            )}

          {/* =================================
              MEASUREMENT ASSISTANCE
          ================================= */}

          {formData.measurementOption ===
            "tailor_visit" && (

              <div className="measurement-assistance">

                <h3>
                  📏 Measurement Assistance
                </h3>

                <p>
                  You don't need to measure
                  yourself. The selected tailor
                  or their trained helper can visit
                  your provided address and take
                  the required measurements.
                </p>

                <label>
                  Preferred Date
                </label>

                <input
                  type="date"
                  name="measurementDate"
                  value={
                    formData.measurementDate
                  }
                  onChange={handleChange}
                  required
                />

                <label>
                  Preferred Time
                </label>

                <select
                  name="measurementTime"
                  value={
                    formData.measurementTime
                  }
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select preferred time
                  </option>

                  <option value="9 AM - 11 AM">
                    9 AM - 11 AM
                  </option>

                  <option value="11 AM - 1 PM">
                    11 AM - 1 PM
                  </option>

                  <option value="2 PM - 4 PM">
                    2 PM - 4 PM
                  </option>

                  <option value="4 PM - 6 PM">
                    4 PM - 6 PM
                  </option>

                  <option value="6 PM - 8 PM">
                    6 PM - 8 PM
                  </option>
                </select>

              </div>
            )}

          {/* =================================
              6. PICKUP DETAILS
          ================================= */}

          <h2>6. Pickup Details</h2>

          <p className="pickup-info">
            Your fabric or garment can be
            collected from the provided address.
          </p>

          <label>
            📍 Pickup Address
          </label>

          <textarea
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleChange}
            placeholder="Enter your complete pickup address"
            rows="4"
            required
          />

          <label>
            📅 Preferred Pickup Date
          </label>

          <input
            type="date"
            name="pickupDate"
            value={formData.pickupDate}
            onChange={handleChange}
            required
          />

          {/* =================================
              PLACE ORDER
          ================================= */}

          <button
            type="submit"
            className="place-order-btn"
          >
            Place Stitching Order →
          </button>

          <p className="order-note">
            Your requirements will be sent directly
            to the selected tailor.
          </p>

        </form>

      </div>

      {/* =================================
          RIGHT SIDE - TAILOR SUMMARY
      ================================= */}

      <div className="booking-summary">

        <img
          src={
            tailor.image ||
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"
          }
          alt={tailor.shopName}
        />

        <h2>
          {tailor.shopName}
        </h2>

        <p>
          📍 {tailor.city || "Location not added"}
        </p>

        <p>
          ✂️{" "}
          {tailor.specialization ||
            tailor.speciality ||
            "Tailoring Services"}
        </p>

        <p>
          ⭐{" "}
          {tailor.experience || 0} Years
          Experience
        </p>

        <p>
          💰{" "}
          {tailor.priceRange ||
            "Contact Tailor"}
        </p>

        <div className="verified">
          {tailor.isVerified
            ? "✅ Verified Tailor"
            : "Tailor Profile"}
        </div>

        {/* =================================
            AVAILABILITY
        ================================= */}

        <div className="availability">

          {tailor.isAvailable === false ? (
            <p>
              🔴{" "}
              {tailor.availabilityMessage ||
                "Currently not available"}
            </p>
          ) : (
            <p>
              🟢 Available for new orders
            </p>
          )}

        </div>

      </div>

    </div>
  );
}

export default BookAppointment;
