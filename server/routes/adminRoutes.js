
const express = require("express");

const router = express.Router();

const {
  loginAdmin,
  getDashboardStats,
  getAllCustomers,
  getAllTailors,
  verifyTailor,
  unverifyTailor,
  getAllDeliveryPartners,
  getAllOrders,
  updateOrderStatusByAdmin,
  approveHomeVisitAssistant,
  rejectHomeVisitAssistant,
} = require("../controllers/adminController");

const {
  protectAdmin,
} = require("../middleware/authMiddleware");

// ===============================
// ADMIN LOGIN
// ===============================

router.post(
  "/login",
  loginAdmin
);

// ===============================
// ADMIN DASHBOARD
// ===============================

router.get(
  "/dashboard",
  protectAdmin,
  getDashboardStats
);

// ===============================
// CUSTOMER MANAGEMENT
// ===============================

router.get(
  "/customers",
  protectAdmin,
  getAllCustomers
);

// ===============================
// TAILOR MANAGEMENT
// ===============================

router.get(
  "/tailors",
  protectAdmin,
  getAllTailors
);

// Verify tailor
router.patch(
  "/tailors/:id/verify",
  protectAdmin,
  verifyTailor
);

// Remove tailor verification
router.patch(
  "/tailors/:id/unverify",
  protectAdmin,
  unverifyTailor
);

// ===============================
// HOME VISIT ASSISTANT APPROVAL
// ===============================

// Admin approves a registered assistant
router.patch(
  "/tailors/:id/assistants/:assistantId/approve",
  protectAdmin,
  approveHomeVisitAssistant
);

// Admin rejects a registered assistant
router.patch(
  "/tailors/:id/assistants/:assistantId/reject",
  protectAdmin,
  rejectHomeVisitAssistant
);

// ===============================
// DELIVERY PARTNER MANAGEMENT
// ===============================

router.get(
  "/delivery-partners",
  protectAdmin,
  getAllDeliveryPartners
);

// ===============================
// ORDER MANAGEMENT
// ===============================

router.get(
  "/orders",
  protectAdmin,
  getAllOrders
);

router.patch(
  "/orders/:id/status",
  protectAdmin,
  updateOrderStatusByAdmin
);

module.exports = router;
