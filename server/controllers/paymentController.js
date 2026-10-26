const crypto = require("crypto");
const Razorpay = require("razorpay");

const Order = require("../models/Order");

// ===============================
// RAZORPAY INSTANCE
// ===============================

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ===============================
// CREATE RAZORPAY ORDER
// ===============================

const createPaymentOrder = async (req, res) => {
try {
const { id } = req.params;


const order = await Order.findById(id)
  .populate("customer")
  .populate("tailor");

if (!order) {
  return res.status(404).json({
    message: "Order not found.",
  });
}


// -------------------------------
// Customer ownership check
// -------------------------------

if (
  order.customer._id.toString() !==
  req.customer.id.toString()
) {
  return res.status(403).json({
    message:
      "You are not authorized to pay for this order.",
  });
}


// -------------------------------
// Order must be waiting for
// customer confirmation
// -------------------------------

if (
  order.status !==
  "Awaiting Customer Confirmation"
) {
  return res.status(400).json({
    message:
      "This order is not ready for payment.",
  });
}


// -------------------------------
// Check stitching price
// -------------------------------

if (
  order.stitchingPrice === null ||
  order.stitchingPrice === undefined ||
  Number(order.stitchingPrice) <= 0
) {
  return res.status(400).json({
    message:
      "A valid stitching price is required before payment.",
  });
}


// -------------------------------
// Prevent duplicate payment
// -------------------------------

if (order.paymentStatus === "Paid") {
  return res.status(400).json({
    message:
      "Payment has already been completed for this order.",
  });
}


// -------------------------------
// Convert rupees to paise
// -------------------------------

const amountInPaise =
  Math.round(
    Number(order.stitchingPrice) * 100
  );


// -------------------------------
// Create Razorpay order
// -------------------------------

const razorpayOrder =
  await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",

    receipt:
      `TC_${order._id.toString()}`,

    notes: {
      tailorConnectOrderId:
        order._id.toString(),

      customerId:
        order.customer._id.toString(),

      tailorId:
        order.tailor._id.toString(),
    },
  });


// -------------------------------
// Save Razorpay order information
// -------------------------------

order.razorpayOrderId =
  razorpayOrder.id;

order.paymentAmount =
  Number(order.stitchingPrice);

order.paymentStatus =
  "Processing";

await order.save();


// -------------------------------
// Send payment information
// to frontend
// -------------------------------

res.status(200).json({
  message:
    "Payment order created successfully.",

  key:
    process.env.RAZORPAY_KEY_ID,

  amount:
    razorpayOrder.amount,

  currency:
    razorpayOrder.currency,

  razorpayOrderId:
    razorpayOrder.id,

  orderId:
    order._id,
});


} catch (error) {


console.error(
  "CREATE PAYMENT ORDER ERROR:",
  error
);

res.status(500).json({
  message:
    "Unable to create payment order.",
});


}
};

// ===============================
// VERIFY RAZORPAY PAYMENT
// ===============================

const verifyPayment = async (req, res) => {
try {


const {
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature,
  orderId,
} = req.body;


// -------------------------------
// Validate payment response
// -------------------------------

if (
  !razorpay_payment_id ||
  !razorpay_order_id ||
  !razorpay_signature ||
  !orderId
) {
  return res.status(400).json({
    message:
      "Incomplete payment verification details.",
  });
}


// -------------------------------
// Find order
// -------------------------------

const order =
  await Order.findById(orderId);

if (!order) {
  return res.status(404).json({
    message: "Order not found.",
  });
}


// -------------------------------
// Customer ownership check
// -------------------------------

if (
  order.customer.toString() !==
  req.customer.id.toString()
) {
  return res.status(403).json({
    message:
      "You are not authorized to verify this payment.",
  });
}


// -------------------------------
// Verify Razorpay order ID
// -------------------------------

if (
  order.razorpayOrderId !==
  razorpay_order_id
) {
  return res.status(400).json({
    message:
      "Payment order mismatch.",
  });
}


// -------------------------------
// Generate signature
// -------------------------------

const generatedSignature =
  crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(
      `${order.razorpayOrderId}|${razorpay_payment_id}`
    )
    .digest("hex");


// -------------------------------
// Compare signatures
// -------------------------------

if (
  generatedSignature !==
  razorpay_signature
) {

  order.paymentStatus =
    "Failed";

  await order.save();

  return res.status(400).json({
    message:
      "Payment verification failed.",
  });
}


// -------------------------------
// PAYMENT SUCCESS
// -------------------------------

order.razorpayPaymentId =
  razorpay_payment_id;

order.razorpaySignature =
  razorpay_signature;

order.paymentStatus =
  "Paid";

order.paymentAmount =
  Number(order.stitchingPrice);

order.paidAt =
  new Date();

order.customerConfirmation =
  "Confirmed";

order.status =
  "Confirmed";


await order.save();


res.status(200).json({
  message:
    "Payment verified successfully.",

  paymentStatus:
    order.paymentStatus,

  orderStatus:
    order.status,

  order,
});


} catch (error) {


console.error(
  "VERIFY PAYMENT ERROR:",
  error
);

res.status(500).json({
  message:
    "Unable to verify payment.",
});


}
};

// ===============================
// PAYMENT FAILED
// ===============================

const paymentFailed = async (req, res) => {
try {


const { id } = req.params;

const order =
  await Order.findById(id);

if (!order) {
  return res.status(404).json({
    message: "Order not found.",
  });
}


// -------------------------------
// Customer ownership check
// -------------------------------

if (
  order.customer.toString() !==
  req.customer.id.toString()
) {
  return res.status(403).json({
    message:
      "You are not authorized to update this payment.",
  });
}


// -------------------------------
// Don't overwrite successful payment
// -------------------------------

if (
  order.paymentStatus ===
  "Paid"
) {
  return res.status(400).json({
    message:
      "This order has already been paid.",
  });
}


order.paymentStatus =
  "Failed";

await order.save();


res.status(200).json({
  message:
    "Payment marked as failed.",
});


} catch (error) {


console.error(
  "PAYMENT FAILED ERROR:",
  error
);

res.status(500).json({
  message:
    "Unable to update payment status.",
});


}
};

// ===============================
// EXPORTS
// ===============================

module.exports = {
createPaymentOrder,
verifyPayment,
paymentFailed,
};
