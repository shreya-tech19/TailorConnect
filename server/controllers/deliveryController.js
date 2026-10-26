const crypto = require("crypto");

const Order = require("../models/Order");

// ==========================================
// GET DELIVERY ORDERS
// ==========================================

const getDeliveryOrders = async (req, res) => {
  try {
    const partnerId = req.deliveryPartner.id;

    const orders = await Order.find({
      $or: [
        {
          status: "Ready for Delivery",
          deliveryPartner: null,
        },
        {
          deliveryPartner: partnerId,
          status: {
            $in: [
              "Out for Delivery",
              "Reached Customer",
              "Delivered",
              "Completed",
            ],
          },
        },
      ],
    })
      .populate(
        "tailor",
        "shopName ownerName phone address city pincode profileImage"
      )
      .populate(
        "customer",
        "fullName phone address city pincode"
      )
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error(
      "GET DELIVERY ORDERS ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};
// ==========================================
// ACCEPT DELIVERY
// READY → OUT FOR DELIVERY
// ==========================================

const acceptDelivery = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const partnerId =
      req.deliveryPartner.id;

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      order.status !==
      "Ready for Delivery"
    ) {
      return res.status(400).json({
        message:
          "This order is not ready for delivery.",
      });
    }

    if (order.deliveryPartner) {
      return res.status(400).json({
        message:
          "This order has already been assigned to a delivery partner.",
      });
    }

    order.deliveryPartner =
      partnerId;

    order.status =
      "Out for Delivery";

    // Generate a secure 4-digit OTP
    const otp = crypto
      .randomInt(1000, 10000)
      .toString();

    order.deliveryOtp = otp;
    order.deliveryOtpVerified = false;

    await order.save();

    res.status(200).json({
      message:
        "Delivery accepted successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "ACCEPT DELIVERY ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// REACHED CUSTOMER
// OUT FOR DELIVERY → REACHED CUSTOMER
// ==========================================

const reachedCustomer = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      !order.deliveryPartner ||
      order.deliveryPartner.toString() !==
        req.deliveryPartner.id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not assigned to this delivery.",
      });
    }

    if (
      order.status !==
      "Out for Delivery"
    ) {
      return res.status(400).json({
        message:
          "This order is not currently out for delivery.",
      });
    }

    order.status =
      "Reached Customer";

    await order.save();

    res.status(200).json({
      message:
        "Customer reached successfully. Ask the customer for the delivery OTP.",
      order,
    });
  } catch (error) {
    console.error(
      "REACHED CUSTOMER ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// VERIFY DELIVERY OTP
// ==========================================

const verifyDeliveryOtp = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        message:
          "Please enter the delivery OTP.",
      });
    }

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      !order.deliveryPartner ||
      order.deliveryPartner.toString() !==
        req.deliveryPartner.id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not assigned to this delivery.",
      });
    }

    if (
      order.status !==
      "Reached Customer"
    ) {
      return res.status(400).json({
        message:
          "OTP can only be verified after reaching the customer.",
      });
    }

    if (
      order.deliveryOtp !==
      otp.toString().trim()
    ) {
      return res.status(400).json({
        message:
          "Invalid delivery OTP.",
      });
    }

    order.deliveryOtpVerified = true;
    order.status = "Delivered";

    await order.save();

    res.status(200).json({
      message:
        "OTP verified. Order marked as delivered.",
      order,
    });
  } catch (error) {
    console.error(
      "VERIFY DELIVERY OTP ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// COMPLETE DELIVERY
// DELIVERED → COMPLETED
// ==========================================

const completeDelivery = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const order =
      await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      !order.deliveryPartner ||
      order.deliveryPartner.toString() !==
        req.deliveryPartner.id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not assigned to this delivery.",
      });
    }

    if (
      order.status !== "Delivered"
    ) {
      return res.status(400).json({
        message:
          "Order must be delivered before completion.",
      });
    }

    if (!order.deliveryOtpVerified) {
      return res.status(400).json({
        message:
          "Delivery OTP must be verified first.",
      });
    }

    order.status = "Completed";

    await order.save();

    res.status(200).json({
      message:
        "Delivery completed successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "COMPLETE DELIVERY ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getDeliveryOrders,
  acceptDelivery,
  reachedCustomer,
  verifyDeliveryOtp,
  completeDelivery,
};