const express = require("express");

const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  paymentFailed,
} = require("../controllers/paymentController");

const {
  protectCustomer,
} = require("../middleware/authMiddleware");


// Create Razorpay order
router.post(
  "/create-order/:id",
  protectCustomer,
  createPaymentOrder
);


// Verify successful Razorpay payment
router.post(
  "/verify",
  protectCustomer,
  verifyPayment
);


// Handle failed/cancelled payment
router.patch(
  "/failed/:id",
  protectCustomer,
  paymentFailed
);


module.exports = router;