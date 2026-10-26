
const express = require("express");

const router = express.Router();

const {
  createOrder,
  getCustomerOrders,
  getTailorOrders,
  reviewOrder,
  requestClarification,
  confirmOrder,
  updateOrderStatus,
  getDeliveryOtp,
  updateMeasurementAppointment,
  confirmProposedMeasurement,
  completeMeasurementVisit,
  assignHomeVisitVisitor,
  generateHomeVisitOtp,
  verifyHomeVisitOtp,
} = require("../controllers/orderController");

const {
  protectCustomer,
  protectTailor,
} = require("../middleware/authMiddleware");

// ===============================
// CUSTOMER ORDERS
// ===============================

// Create new stitching order
router.post(
  "/",
  protectCustomer,
  createOrder
);

// Get orders of logged-in customer
router.get(
  "/",
  protectCustomer,
  getCustomerOrders
);

// ===============================
// TAILOR ORDERS
// ===============================

// Get orders belonging to logged-in tailor
router.get(
  "/tailor/:tailorId",
  protectTailor,
  getTailorOrders
);

// ===============================
// MEASUREMENT APPOINTMENT
// ===============================

// Tailor confirms visit or proposes another date/time
router.patch(
  "/:id/measurement-appointment",
  protectTailor,
  updateMeasurementAppointment
);

// Customer confirms tailor's proposed appointment
router.patch(
  "/:id/measurement-confirm",
  protectCustomer,
  confirmProposedMeasurement
);

// ===============================
// HOME VISIT VERIFICATION
// ===============================

// Tailor assigns themselves or a registered assistant
router.patch(
  "/:id/home-visit-visitor",
  protectTailor,
  assignHomeVisitVisitor
);

// Tailor generates a secure visitor verification OTP
router.post(
  "/:id/home-visit-otp",
  protectTailor,
  generateHomeVisitOtp
);

// Customer verifies the visitor's OTP
router.patch(
  "/:id/home-visit-verify",
  protectCustomer,
  verifyHomeVisitOtp
);

// ===============================
// MEASUREMENT COMPLETION
// ===============================

// Tailor records measurements and completes visit
router.patch(
  "/:id/measurement-complete",
  protectTailor,
  completeMeasurementVisit
);

// ===============================
// TAILOR REVIEW
// ===============================

// Send stitching price + completion date
router.patch(
  "/:id/review",
  protectTailor,
  reviewOrder
);

// Tailor asks customer for clarification
router.patch(
  "/:id/clarification",
  protectTailor,
  requestClarification
);

// ===============================
// CUSTOMER CONFIRMATION
// ===============================

// Customer confirms quotation through payment workflow
router.patch(
  "/:id/confirm",
  protectCustomer,
  confirmOrder
);

// ===============================
// ORDER STATUS
// ===============================

// Tailor updates order status
router.patch(
  "/:id/status",
  protectTailor,
  updateOrderStatus
);

// ===============================
// DELIVERY OTP
// ===============================

// Customer views OTP when delivery partner arrives
router.get(
  "/:id/delivery-otp",
  protectCustomer,
  getDeliveryOtp
);

module.exports = router;
