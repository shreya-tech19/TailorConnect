const express = require("express");

const router = express.Router();

const {
  registerDeliveryPartner,
  loginDeliveryPartner,
} = require(
  "../controllers/deliveryPartnerController"
);

// Register
router.post(
  "/register",
  registerDeliveryPartner
);

// Login
router.post(
  "/login",
  loginDeliveryPartner
);

module.exports = router;