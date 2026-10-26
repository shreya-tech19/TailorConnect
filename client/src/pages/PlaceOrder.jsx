import "./PlaceOrder.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import mockTailors from "../data/mockTailors";

function PlaceOrder() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedDesign = location.state?.selectedDesign || null;

  const [tailor, setTailor] = useState(
    location.state?.tailor || null
  );

  const [step, setStep] = useState(
    selectedDesign ? 2 : 1
  );
  const [formData, setFormData] = useState({
    gender: selectedDesign?.gender || "",
    garment: selectedDesign?.category || "",

    designDescription:
    selectedDesign?.title ||
    selectedDesign?.name ||
    "",
        specialRequirements: "",

    measurementOption: "already_have",
    measurements: {},

    measurementDate: "",
    measurementTime: "",

    pickupAddress: "",
    pickupDate: "",
  });

  // ==========================================
  // LOGIN CHECK
  // ==========================================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          from: `/place-order/${id}`,
        },
      });
    }
  }, [id, navigate]);

  // ==========================================
  // FETCH TAILOR
  // ==========================================

  useEffect(() => {
    if (!tailor) {
      fetchTailor();
    }
  }, [id]);

  const fetchTailor = async () => {
    try {
      const response = await API.get(`/tailors/${id}`);
      setTailor(response.data);
    } catch (error) {
      const mockTailor = mockTailors.find(
        (item) => item.id === id
      );

      setTailor(mockTailor || null);
    }
  };

  // ==========================================
  // GARMENT CATEGORIES
  // ==========================================

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

  // ==========================================
  // MEASUREMENT FIELDS
  // ==========================================

  const measurementFields = {
    Blouse: [
      ["bust", "Bust"],
      ["underBust", "Under Bust"],
      ["waist", "Waist"],
      ["shoulder", "Shoulder"],
      ["armhole", "Armhole"],
      ["sleeveLength", "Sleeve Length"],
      ["blouseLength", "Blouse Length"],
    ],

    Kurti: [
      ["bust", "Bust"],
      ["waist", "Waist"],
      ["hip", "Hip"],
      ["shoulder", "Shoulder"],
      ["armhole", "Armhole"],
      ["sleeveLength", "Sleeve Length"],
      ["kurtiLength", "Kurti Length"],
    ],

    "Salwar Suit": [
      ["bust", "Bust"],
      ["waist", "Waist"],
      ["hip", "Hip"],
      ["shoulder", "Shoulder"],
      ["armhole", "Armhole"],
      ["sleeveLength", "Sleeve Length"],
      ["kurtaLength", "Kurta Length"],
      ["salwarLength", "Salwar Length"],
    ],

    Lehenga: [
      ["bust", "Bust"],
      ["underBust", "Under Bust"],
      ["waist", "Waist"],
      ["hip", "Hip"],
      ["shoulder", "Shoulder"],
      ["blouseLength", "Blouse Length"],
      ["lehengaLength", "Lehenga Length"],
      ["flare", "Lehenga Flare"],
    ],

    Dress: [
      ["bust", "Bust"],
      ["waist", "Waist"],
      ["hip", "Hip"],
      ["shoulder", "Shoulder"],
      ["armhole", "Armhole"],
      ["sleeveLength", "Sleeve Length"],
      ["dressLength", "Dress Length"],
    ],

    Shirt: [
      ["chest", "Chest"],
      ["waist", "Waist"],
      ["shoulder", "Shoulder"],
      ["neck", "Neck"],
      ["armhole", "Armhole"],
      ["sleeveLength", "Sleeve Length"],
      ["shirtLength", "Shirt Length"],
    ],

    Trouser: [
      ["waist", "Waist"],
      ["hip", "Hip"],
      ["thigh", "Thigh"],
      ["knee", "Knee"],
      ["ankle", "Ankle"],
      ["trouserLength", "Trouser Length"],
    ],

    Kurta: [
      ["chest", "Chest"],
      ["waist", "Waist"],
      ["shoulder", "Shoulder"],
      ["sleeveLength", "Sleeve Length"],
      ["kurtaLength", "Kurta Length"],
    ],

    Sherwani: [
      ["chest", "Chest"],
      ["waist", "Waist"],
      ["shoulder", "Shoulder"],
      ["sleeveLength", "Sleeve Length"],
      ["sherwaniLength", "Sherwani Length"],
    ],

    Frock: [
      ["chest", "Chest"],
      ["waist", "Waist"],
      ["shoulder", "Shoulder"],
      ["sleeveLength", "Sleeve Length"],
      ["frockLength", "Frock Length"],
    ],

    Other: [
      ["bust", "Bust / Chest"],
      ["waist", "Waist"],
      ["hip", "Hip"],
      ["shoulder", "Shoulder"],
      ["sleeveLength", "Sleeve Length"],
      ["garmentLength", "Garment Length"],
    ],
  };

  // ==========================================
  // INPUT HANDLERS
  // ==========================================

  
const handleChange = (event) => {
  const { name, value } = event.target;

  const textOnlyFields = [
    "designDescription",
    "specialRequirements"
  ];

  if (textOnlyFields.includes(name)) {
    // Allow letters, spaces, and normal punctuation.
    // Reject numbers and other symbols.
    const textPattern = /^[\p{L}\s.,'()\-]*$/u;

    if (!textPattern.test(value)) {
      return;
    }
  }

  setFormData((previous) => ({
    ...previous,
    [name]: value,
  }));
};


  const handleGenderChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      gender: event.target.value,
      garment: "",
      measurements: {},
    }));
  };

  const handleGarmentChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      garment: event.target.value,
      measurements: {},
    }));
  };

  const handleMeasurementChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      measurements: {
        ...previous.measurements,
        [name]: value,
      },
    }));
  };

  const getTodayDate = () => {
    const today = new Date();
  
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  };
  
  // ==========================================
  // STEP VALIDATION
  // ==========================================

  const validateCurrentStep = () => {
    // STEP 1
    if (step === 1) {
      if (!formData.gender) {
        alert("Please select who the garment is for.");
        return false;
      }

      if (!formData.garment) {
        alert("Please select a garment.");
        return false;
      }
    }

    
    
    // STEP 2
    if (step === 2) {
      const design = formData.designDescription.trim();
      const requirements =
        formData.specialRequirements.trim();

      const textPattern = /^[\p{L}\s.,'()\-]*$/u;

      if (!design) {
        alert("Please enter the design or style details.");
        return false;
      }

      if (!textPattern.test(design)) {
        alert("Design / Style must contain only letters.");
        return false;
      }

      if (
        requirements &&
        !textPattern.test(requirements)
      ) {
        alert("Special Requirements must contain only letters.");
        return false;
      }
    }


    // STEP 3
    if (step === 3) {
      if (formData.measurementOption === "already_have") {
        const fields = measurementFields[formData.garment] || [];

        const missingFields = fields.filter(
          ([field]) =>
            !formData.measurements[field] ||
            String(formData.measurements[field]).trim() === ""
        );

        if (missingFields.length > 0) {
          alert(
            "Please enter all required measurements before continuing."
          );
          return false;
        }
      }

      if (formData.measurementOption === "tailor_visit") {
        if (!formData.measurementDate) {
          alert("Please select a preferred measurement date.");
          return false;
        }

        if (!formData.measurementTime) {
          alert("Please select a preferred measurement time.");
          return false;
        }
      }
    }

    // STEP 4
    if (step === 4) {
      if (!formData.pickupAddress.trim()) {
        alert("Please enter your complete pickup address.");
        return false;
      }

      
if (!formData.pickupDate) {
  alert("Please select a preferred pickup date.");
  return false;
}

if (formData.pickupDate < getTodayDate()) {
  alert("Pickup date cannot be in the past.");
  return false;
}

    }

    return true;
  };

  // ==========================================
  // NEXT / PREVIOUS
  // ==========================================

  const nextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setStep((previous) => Math.min(previous + 1, 5));
  };

  const previousStep = () => {
    setStep((previous) => Math.max(previous - 1, 1));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async () => {
    const customer = JSON.parse(
      localStorage.getItem("customer") || "{}"
    );

    const token = localStorage.getItem("token");

    if (!customer || !token) {
      navigate("/login", {
        state: {
          from: `/place-order/${id}`,
        },
      });

      return;
    }

    const orderData = {
      customerName: customer.fullName || "",
      phone: customer.phone || "",

      tailor: tailor._id || tailor.id,

      gender: formData.gender,
      garment: formData.garment,

      service: formData.garment,
      design:
  selectedDesign?._id ||
  selectedDesign?.id ||
  null,
      designDescription: formData.designDescription,

      specialRequirements: formData.specialRequirements,

      measurementOption: formData.measurementOption,

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

    try {
      await API.post("/orders", orderData);

      navigate("/order-confirmation");
    } catch (error) {
      console.log("ORDER ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Unable to submit the stitching request."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (!tailor) {
    return (
      <div className="order-loading">
        <h2>Loading tailor details...</h2>
      </div>
    );
  }

  // ==========================================
  // AVAILABILITY
  // ==========================================

  const availability =
    tailor.availability ||
    (tailor.isAvailable === false
      ? "Not Available"
      : "Available");

  const isAvailable = availability === "Available";

  if (!isAvailable) {
    return (
      <div className="order-unavailable">
        <div className="unavailable-card">
          <span className="unavailable-icon">✕</span>

          <h2>Tailor Currently Unavailable</h2>

          <p>
            {tailor.availabilityMessage ||
              "This tailor is currently not accepting new stitching orders."}
          </p>

          <button
            onClick={() =>
              navigate(`/tailor/${id}`)
            }
          >
            Back to Tailor Profile
          </button>
        </div>
      </div>
    );
  }

  const currentMeasurementFields =
    measurementFields[formData.garment] || [];

  const customer = JSON.parse(
    localStorage.getItem("customer") || "{}"
  );

  const providedMeasurementCount =
    currentMeasurementFields.filter(
      ([field]) => formData.measurements[field]
    ).length;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="place-order-page">

      {/* HEADER */}

      <div className="order-page-header">

        <div>
          <p className="order-label">
            STITCHING ORDER
          </p>

          <h1>
            Get Your Outfit Stitched
          </h1>

          <p>
            With {tailor.shopName}
          </p>
        </div>

        <div className="order-availability">
          🟢 Available
        </div>

      </div>

      {/* STEPPER */}

      <div className="order-stepper">

        {[
          "Design & Garment",
          "Style Details",
          "Measurements",
          "Pickup & Delivery",
          "Review",
        ].map((title, index) => {

          const number = index + 1;

          return (
            <div
              className={`step ${
                step >= number ? "active" : ""
              }`}
              key={title}
            >
              <div className="step-number">
                {number}
              </div>

              <span>{title}</span>
            </div>
          );
        })}

      </div>

      <div className="order-layout">

        {/* MAIN FORM */}

        <div className="order-form-card">

          {/* STEP 1 */}

          {step === 1 && (
            <div className="order-step-content">

              <h2>Choose Your Garment</h2>

              <p className="step-description">
                Tell us who the outfit is for and
                what you would like stitched.
              </p>

              <label>
                Who is the garment for?
              </label>

              <div className="choice-grid">

                {["Women", "Men", "Kids"].map(
                  (category) => (
                    <button
                      type="button"
                      className={
                        formData.gender === category
                          ? "choice selected"
                          : "choice"
                      }
                      onClick={() =>
                        handleGenderChange({
                          target: {
                            value: category,
                          },
                        })
                      }
                      key={category}
                    >
                      {category}
                    </button>
                  )
                )}

              </div>

              {formData.gender && (
                <>
                  <label>
                    Select Garment
                  </label>

                  <div className="garment-grid">

                    {garmentCategories[
                      formData.gender
                    ].map((garment) => (
                      <button
                        type="button"
                        className={
                          formData.garment === garment
                            ? "garment selected"
                            : "garment"
                        }
                        onClick={() =>
                          handleGarmentChange({
                            target: {
                              value: garment,
                            },
                          })
                        }
                        key={garment}
                      >
                        {garment}
                      </button>
                    ))}

                  </div>
                </>
              )}

              {selectedDesign && (
                <div className="selected-design">

                  <img
                    src={selectedDesign.image}
                    alt={
                      selectedDesign.title ||
                      selectedDesign.name ||
                      "Selected Design"
                    }
                  />

                  <div>
                    <small>
                      SELECTED DESIGN
                    </small>

                    <h3>
  {selectedDesign.title ||
    selectedDesign.name}
</h3>

                    <p>
                      {selectedDesign.category}
                    </p>
                  </div>

                </div>
              )}

              <div className="step-actions">

                <button
                  className="next-btn"
                  disabled={
                    !formData.gender ||
                    !formData.garment
                  }
                  onClick={nextStep}
                >
                  Continue →
                </button>

              </div>

            </div>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <div className="order-step-content">

              <h2>Style & Design Details</h2>

              <p className="step-description">
                Tell the tailor exactly how you
                want your outfit to look.
              </p>

              {selectedDesign ? (
  <div className="selected-design">
    <img
      src={selectedDesign.image}
      alt={selectedDesign.name}
    />

    <div>
      <small>SELECTED DESIGN</small>

      <h3>{selectedDesign.name}</h3>

      <p>
        {selectedDesign.gender} •{" "}
        {selectedDesign.category}
      </p>
    </div>
  </div>
) : (
  <>
    <label>
      Design / Style
    </label>

    <textarea
      name="designDescription"
      value={formData.designDescription}
      onChange={handleChange}
      placeholder="Describe the design, neckline, sleeves, pattern, embroidery, etc."
      rows="5"
      required
    />
  </>
)}

              <label>
                Special Requirements
              </label>

              <textarea
                name="specialRequirements"
                value={
                  formData.specialRequirements
                }
                onChange={handleChange}
                placeholder="Any special fitting or stitching requirements?"
                rows="4"
              />

              <div className="step-actions">

                <button
                  className="back-btn"
                  onClick={previousStep}
                >
                  ← Back
                </button>

                <button
                  className="next-btn"
                  onClick={nextStep}
                >
                  Continue →
                </button>

              </div>

            </div>
          )}

          {/* STEP 3 */}

          {step === 3 && (
            <div className="order-step-content">

              <h2>Measurements</h2>

              <p className="step-description">
                Choose how you want to provide
                your measurements.
              </p>

              <div className="measurement-choice">

                <label
                  className={
                    formData.measurementOption ===
                    "already_have"
                      ? "measurement-option selected"
                      : "measurement-option"
                  }
                >
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

                  <div>
                    <strong>
                      I have my measurements
                    </strong>

                    <span>
                      Enter your measurements
                      yourself.
                    </span>
                  </div>
                </label>

                <label
                  className={
                    formData.measurementOption ===
                    "tailor_visit"
                      ? "measurement-option selected"
                      : "measurement-option"
                  }
                >
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

                  <div>
                    <strong>
                      I need measurement assistance
                    </strong>

                    <span>
                      Request a measurement visit
                      from the tailor.
                    </span>
                  </div>
                </label>

              </div>

              {formData.measurementOption ===
                "already_have" &&
                formData.garment && (
                  <div className="measurement-box">

                    <h3>
                      {formData.garment} Measurements
                    </h3>

                    <p>
                      Enter measurements in inches.
                    </p>

                    <div className="measurement-grid">

                      {currentMeasurementFields.map(
                        ([field, label]) => (
                          <div key={field}>

                            <label>
                              {label}
                            </label>

                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              name={field}
                              value={
                                formData.measurements[
                                  field
                                ] || ""
                              }
                              onChange={
                                handleMeasurementChange
                              }
                              placeholder="0"
                            />

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

              {formData.measurementOption ===
                "tailor_visit" && (
                  <div className="measurement-assistance">

                    <h3>
                      📏 Measurement Assistance
                    </h3>

                    <p>
                      Select a preferred date and
                      time. The measurement visit
                      will be handled by the tailor
                      or an authorized measurement
                      professional.
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
                      min={getTodayDate()}
                      onChange={handleChange}
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
                    >
                      <option value="">
                        Select time
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

              <div className="step-actions">

                <button
                  className="back-btn"
                  onClick={previousStep}
                >
                  ← Back
                </button>

                <button
                  className="next-btn"
                  onClick={nextStep}
                >
                  Continue →
                </button>

              </div>

            </div>
          )}

          {/* STEP 4 */}

          {step === 4 && (
            <div className="order-step-content">

              <h2>Pickup & Delivery</h2>

              <p className="step-description">
                Tell us where your garment or fabric
                should be collected from.
              </p>

              <label>
                Pickup Address
              </label>

              <textarea
                name="pickupAddress"
                value={
                  formData.pickupAddress
                }
                onChange={handleChange}
                placeholder="Enter your complete pickup address"
                rows="5"
              />

              <label>
                Preferred Pickup Date
              </label>

              <input
                type="date"
                name="pickupDate"
                value={
                  formData.pickupDate
                }
                min={getTodayDate()}
                onChange={handleChange}
              />

              <div className="info-box">
                🚚 A logistics partner will handle
                the pickup and delivery of your
                garment.
              </div>

              <div className="step-actions">

                <button
                  className="back-btn"
                  onClick={previousStep}
                >
                  ← Back
                </button>

                <button
                  className="next-btn"
                  onClick={nextStep}
                >
                  Review Order →
                </button>

              </div>

            </div>
          )}

          
{step === 5 && (
  <div className="order-step-content">
    <h2>Review Your Stitching Request</h2>

    <p className="step-description">
      Please check your details before submitting.
    </p>

    <div className="review-section">
      <h3>Customer & Garment Details</h3>

      <div className="review-row">
        <span>Tailor</span>
        <strong>{tailor.shopName}</strong>
      </div>

      <div className="review-row">
        <span>Customer</span>
        <strong>
          {customer.fullName || "Logged-in Customer"}
        </strong>
      </div>

      <div className="review-row">
        <span>Garment</span>
        <strong>{formData.garment}</strong>
      </div>

      <div className="review-row">
        <span>Category</span>
        <strong>{formData.gender}</strong>
      </div>

      <div className="review-row">
        <span>Design / Style</span>
        <strong>{formData.designDescription}</strong>
      </div>

      {formData.specialRequirements && (
        <div className="review-row">
          <span>Special Requirements</span>
          <strong>{formData.specialRequirements}</strong>
        </div>
      )}
    </div>

    <div className="review-section">
      <h3>Measurement Details</h3>

      {formData.measurementOption === "tailor_visit" ? (
        <>
          <div className="review-row">
            <span>Measurement Type</span>
            <strong>Home Measurement Assistance</strong>
          </div>

          <div className="review-row">
            <span>Preferred Date</span>
            <strong>{formData.measurementDate}</strong>
          </div>

          <div className="review-row">
            <span>Preferred Time</span>
            <strong>{formData.measurementTime}</strong>
          </div>

          <div className="info-box">
            📏 Your measurement visit is a request,
            not a confirmed appointment. The tailor
            will coordinate the visit with you.
          </div>
        </>
      ) : (
        <>
          <div className="review-row">
            <span>Measurement Type</span>
            <strong>Measurements Provided</strong>
          </div>

          {currentMeasurementFields.map(([field, label]) => (
            <div className="review-row" key={field}>
              <span>{label}</span>
              <strong>
                {formData.measurements[field] || "—"} inches
              </strong>
            </div>
          ))}
        </>
      )}
    </div>

    <div className="review-section">
      <h3>Pickup Details</h3>

      <div className="review-row">
        <span>Preferred Pickup Date</span>
        <strong>{formData.pickupDate}</strong>
      </div>

      <div className="review-row">
        <span>Pickup Address</span>
        <strong>{formData.pickupAddress}</strong>
      </div>
    </div>

    {selectedDesign && (
      <div className="review-design">
        <img
          src={selectedDesign.image}
          alt={selectedDesign.name || selectedDesign.title}
        />

        <div>
          <small>SELECTED DESIGN</small>
          <h3>
            {selectedDesign.name || selectedDesign.title}
          </h3>
        </div>
      </div>
    )}

    <div className="info-box">
      Your tailor will review your stitching request
      and send a price quotation. Payment will be
      requested only after you confirm the quotation.
    </div>

    <div className="step-actions">
      <button
        type="button"
        className="back-btn"
        onClick={previousStep}
      >
        ← Back
      </button>

      <button
        type="button"
        className="submit-btn"
        onClick={handleSubmit}
      >
        Submit Stitching Request →
      </button>
    </div>
  </div>
)}

        </div>

        {/* RIGHT SUMMARY */}

        <aside className="order-summary">

          <p className="summary-label">
            YOUR TAILOR
          </p>

          <img
            src={
              tailor.profileImage ||
              tailor.image ||
              "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"
            }
            alt={tailor.shopName}
          />

          <h2>{tailor.shopName}</h2>

          <p>📍 {tailor.city}</p>

          <p>
            ✂️{" "}
            {tailor.specialization ||
              "Custom Stitching"}
          </p>

          <div className="summary-available">
            🟢 Available for new orders
          </div>

          {selectedDesign && (
            <div className="summary-design">

              <small>SELECTED DESIGN</small>

              <img
                src={selectedDesign.image}
                alt={selectedDesign.name}
              />

              <strong>
                {selectedDesign.name}
              </strong>

            </div>
          )}

          <div className="summary-note">
            🔒 Your account details are used
            automatically. You don't need to
            enter your name and phone number
            again.
          </div>

        </aside>

      </div>

    </div>
  );
}

export default PlaceOrder;
