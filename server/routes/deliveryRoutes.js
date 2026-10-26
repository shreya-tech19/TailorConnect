const express = require("express");

const router = express.Router();

const {
  getDeliveryOrders,
  acceptDelivery,
  reachedCustomer,
  verifyDeliveryOtp,
  completeDelivery,
} = require("../controllers/deliveryController");

const {
  protectDeliveryPartner,
} = require(
  "../middleware/authMiddleware"
);

// Get available and assigned deliveries
router.get(
  "/orders",
  protectDeliveryPartner,
  getDeliveryOrders
);

// Accept a delivery
router.patch(
  "/orders/:id/accept",
  protectDeliveryPartner,
  acceptDelivery
);

// Mark customer reached
router.patch(
  "/orders/:id/reached",
  protectDeliveryPartner,
  reachedCustomer
);

// Verify customer OTP
router.patch(
  "/orders/:id/verify-otp",
  protectDeliveryPartner,
  verifyDeliveryOtp
);

// Complete delivery
router.patch(
  "/orders/:id/complete",
  protectDeliveryPartner,
  completeDelivery
);

module.exports = router;