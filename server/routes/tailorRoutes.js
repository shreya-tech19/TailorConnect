
const express = require("express");
const router = express.Router();

const {
  registerTailor,
  loginTailor,
  googleLoginTailor,
  getAllTailors,
  getTailorById,
  updateAvailability,
  updateProfileImage,
  updateTailorProfile,
  registerHomeVisitAssistant,
  getHomeVisitAssistants,
  deactivateHomeVisitAssistant,
} = require("../controllers/tailorController");

const {
  protectTailor,
} = require("../middleware/authMiddleware");

// ==========================================
// TAILOR AUTHENTICATION
// ==========================================

router.post("/register", registerTailor);

router.post("/login", loginTailor);

router.post("/google-login", googleLoginTailor);

// ==========================================
// GET TAILORS
// ==========================================

router.get("/", getAllTailors);

router.get("/:id", getTailorById);

// ==========================================
// TAILOR PROFILE MANAGEMENT
// ==========================================

router.patch(
  "/:id/availability",
  protectTailor,
  updateAvailability
);

router.patch(
  "/:id/profile-image",
  protectTailor,
  updateProfileImage
);

// ==========================================
// HOME VISIT ASSISTANT MANAGEMENT
// ==========================================

// Register assistant - admin approval required
router.post(
  "/:id/home-visit-assistants",
  protectTailor,
  registerHomeVisitAssistant
);

// View registered assistants
router.get(
  "/:id/home-visit-assistants",
  protectTailor,
  getHomeVisitAssistants
);

// Deactivate assistant
router.patch(
  "/:id/home-visit-assistants/:assistantId/deactivate",
  protectTailor,
  deactivateHomeVisitAssistant
);
router.patch(
  "/:id/profile",
  protectTailor,
  updateTailorProfile
);
module.exports = router;
