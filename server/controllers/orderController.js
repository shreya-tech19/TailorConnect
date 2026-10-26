
const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Tailor = require("../models/Tailor");

const HOME_VISIT_OTP_LIFETIME_MS = 5 * 60 * 1000;
const HOME_VISIT_MAX_ATTEMPTS = 5;

const hashHomeVisitOtp = (orderId, otp) => {
  const secret =
    process.env.HOME_VISIT_OTP_SECRET ||
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "HOME_VISIT_OTP_SECRET or JWT_SECRET must be configured."
    );
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}:${otp}`)
    .digest("hex");
};

const clearHomeVisitOtp = (order) => {
  order.homeVisitOtpHash = "";
  order.homeVisitOtpExpiresAt = null;
  order.homeVisitOtpAttempts = 0;
  order.homeVisitOtpIssuedAt = null;
  order.homeVisitVerified = false;
  order.homeVisitVerifiedAt = null;
};

const homeVisitIsConfirmed = (order) =>
  order.measurementOption === "tailor_visit" &&
  order.measurementVisitStatus === "Confirmed" &&
  order.status === "Awaiting Tailor Review";

const checkVerifiedTailorForVisit = async (tailorId) => {
  const tailor = await Tailor.findById(tailorId)
    .select(
      "isVerified ownerName profileImage homeVisitAssistants"
    );

  return tailor?.isVerified ? tailor : null;
};

// ==========================================
// CREATE ORDER
// ==========================================

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      tailor,
      garment,
      service,
      designDescription,
      specialRequirements,
      measurementOption,
      measurements,
      measurementDate,
      measurementTime,
      pickupAddress,
      pickupDate,
      design,
    } = req.body;

    if (!customerName || !phone || !tailor) {
      return res.status(400).json({
        message:
          "Customer name, phone and tailor are required.",
      });
    }

    if (!garment) {
      return res.status(400).json({
        message: "Please select a garment.",
      });
    }

    if (!measurementOption) {
      return res.status(400).json({
        message: "Please select a measurement option.",
      });
    }

    if (measurementOption === "tailor_visit") {
      const selectedTailor = await Tailor.findById(
        tailor
      ).select("isVerified");

      if (!selectedTailor) {
        return res.status(404).json({
          message: "Selected tailor not found.",
        });
      }

      if (selectedTailor.isVerified !== true) {
        return res.status(403).json({
          message:
            "Measurement assistance is available only from verified tailors.",
        });
      }

      if (!measurementDate || !measurementTime) {
        return res.status(400).json({
          message:
            "Please select a measurement date and time.",
        });
      }
    }

    if (!pickupAddress || !pickupDate) {
      return res.status(400).json({
        message:
          "Pickup address and pickup date are required.",
      });
    }

    const order = new Order({
      customer: req.customer.id,
      customerName,
      phone,
      tailor,
      design: design || null,

      garment,
      service: service || garment,

      designDescription:
        designDescription || "",

      specialRequirements:
        specialRequirements || "",

      measurementOption,

      measurements:
        measurementOption === "already_have"
          ? measurements || {}
          : {},

      measurementDate:
        measurementOption === "tailor_visit"
          ? measurementDate || null
          : null,

      measurementTime:
        measurementOption === "tailor_visit"
          ? measurementTime || ""
          : "",

      pickupAddress,
      pickupDate,

      tailorReview: "Pending",
      clarificationMessage: "",

      stitchingPrice: null,
      estimatedCompletionDate: null,

      customerConfirmation: "Pending",
      paymentStatus: "Pending",

      status: "Awaiting Tailor Review",

      deliveryOtp: "",
      deliveryOtpVerified: false,
    });

    await order.save();

    return res.status(201).json({
      message:
        "Stitching request submitted successfully. The tailor will review your requirements and provide the stitching price.",
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET CUSTOMER ORDERS
// ==========================================

const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.customer.id,
    })
      .populate("tailor")
      .populate("design")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error(
      "GET CUSTOMER ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET TAILOR ORDERS
// ==========================================

const getTailorOrders = async (req, res) => {
  try {
    const { tailorId } = req.params;

    if (
      String(tailorId) !== String(req.tailor.id)
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view these orders.",
      });
    }

    const orders = await Order.find({
      tailor: tailorId,
    })
      .populate("customer")
      .populate("tailor")
      .populate("design")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error(
      "GET TAILOR ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// TAILOR REVIEWS ORDER
// ==========================================

const reviewOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      stitchingPrice,
      estimatedCompletionDate,
    } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.tailor) !==
      String(req.tailor.id)
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to manage this order.",
      });
    }

    if (
      order.measurementOption === "tailor_visit" &&
      order.measurementVisitStatus !== "Completed"
    ) {
      return res.status(400).json({
        message:
          "Complete the measurement visit before sending the quotation.",
      });
    }

    if (
      order.status !== "Awaiting Tailor Review"
    ) {
      return res.status(400).json({
        message:
          "This order is not waiting for tailor review.",
      });
    }

    if (
      stitchingPrice === undefined ||
      stitchingPrice === null ||
      stitchingPrice === ""
    ) {
      return res.status(400).json({
        message:
          "Please enter the stitching price.",
      });
    }

    if (
      !Number.isFinite(Number(stitchingPrice)) ||
      Number(stitchingPrice) <= 0
    ) {
      return res.status(400).json({
        message:
          "Please enter a valid stitching price greater than zero.",
      });
    }

    if (!estimatedCompletionDate) {
      return res.status(400).json({
        message:
          "Please provide an estimated completion date.",
      });
    }

    order.stitchingPrice =
      Number(stitchingPrice);

    order.estimatedCompletionDate =
      estimatedCompletionDate;

    order.tailorReview = "Reviewed";
    order.clarificationMessage = "";

    order.customerConfirmation = "Pending";
    order.paymentStatus = "Pending";

    order.status =
      "Awaiting Customer Confirmation";

    await order.save();

    return res.status(200).json({
      message:
        "Price and estimated completion date sent to customer.",
      order,
    });
  } catch (error) {
    console.error("REVIEW ORDER ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// REQUEST CUSTOMER CLARIFICATION
// ==========================================

const requestClarification = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        message:
          "Please enter a clarification message.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.tailor) !==
      String(req.tailor.id)
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to manage this order.",
      });
    }

    if (
      order.status !== "Awaiting Tailor Review"
    ) {
      return res.status(400).json({
        message:
          "Clarification cannot be requested for this order at its current stage.",
      });
    }

    order.tailorReview =
      "Clarification Requested";

    order.clarificationMessage =
      message.trim();

    order.status =
      "Awaiting Customer Clarification";

    await order.save();

    return res.status(200).json({
      message:
        "Clarification request sent to customer.",
      order,
    });
  } catch (error) {
    console.error(
      "REQUEST CLARIFICATION ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE ORDER STATUS
// ==========================================

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Confirmed",
      "Pickup Scheduled",
      "Picked Up",
      "Received by Tailor",
      "Stitching in Progress",
      "Quality Check",
      "Ready for Delivery",
      "Out for Delivery",
      "Reached Customer",
      "Delivered",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.tailor) !==
      String(req.tailor.id)
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to manage this order.",
      });
    }

    if (status === "Confirmed") {
      if (
        order.stitchingPrice === null ||
        order.stitchingPrice === undefined ||
        Number(order.stitchingPrice) <= 0
      ) {
        return res.status(400).json({
          message:
            "A valid stitching price is required before confirmation.",
        });
      }

      if (order.paymentStatus !== "Paid") {
        return res.status(400).json({
          message:
            "Customer payment must be completed before the order can be confirmed.",
        });
      }

      if (
        order.customerConfirmation !== "Confirmed"
      ) {
        return res.status(400).json({
          message:
            "Customer confirmation is required before proceeding.",
        });
      }
    }

    if (
      order.status ===
      "Awaiting Customer Confirmation"
    ) {
      return res.status(400).json({
        message:
          "Customer must complete payment before the order can move to the next stage.",
      });
    }

    order.status = status;

    await order.save();

    return res.status(200).json({
      message:
        "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// CUSTOMER CONFIRMS PRICE
// ==========================================

const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.customer) !==
      String(req.customer.id)
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to confirm this order.",
      });
    }

    if (
      order.status !==
      "Awaiting Customer Confirmation"
    ) {
      return res.status(400).json({
        message:
          "This order is not waiting for customer confirmation.",
      });
    }

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

    return res.status(400).json({
      message:
        "Please complete the Razorpay payment to confirm this order.",
      requiresPayment: true,
      orderId: order._id,
      amount: order.stitchingPrice,
    });
  } catch (error) {
    console.error(
      "CONFIRM ORDER ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// CUSTOMER GETS DELIVERY OTP
// ==========================================

const getDeliveryOtp = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.customer) !==
      String(req.customer.id)
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view this delivery OTP.",
      });
    }

    if (order.status !== "Reached Customer") {
      return res.status(400).json({
        message:
          "Delivery OTP is available when the delivery partner reaches you.",
      });
    }

    if (!order.deliveryOtp) {
      return res.status(404).json({
        message:
          "Delivery OTP is not available yet.",
      });
    }

    if (order.deliveryOtpVerified) {
      return res.status(400).json({
        message:
          "Delivery OTP has already been used.",
      });
    }

    return res.status(200).json({
      otp: order.deliveryOtp,
    });
  } catch (error) {
    console.error(
      "GET DELIVERY OTP ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// DATE VALIDATION
// ==========================================

const isValidFutureOrToday = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const parsed = new Date(
    `${value}T00:00:00Z`
  );

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    return false;
  }

  const today = new Date().toLocaleDateString(
    "en-CA",
    {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );

  return value >= today;
};

// ==========================================
// UPDATE MEASUREMENT APPOINTMENT
// ==========================================

const updateMeasurementAppointment = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { action, date, time } = req.body;

    if (
      !["confirm", "propose"].includes(action)
    ) {
      return res.status(400).json({
        message: "Invalid appointment action.",
      });
    }

    if (
      !isValidFutureOrToday(date) ||
      typeof time !== "string" ||
      !time.trim()
    ) {
      return res.status(400).json({
        message:
          "Enter a valid appointment date and time.",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.tailor) !==
      String(req.tailor.id)
    ) {
      return res.status(403).json({
        message:
          "Not authorized for this order.",
      });
    }

    if (
      order.measurementOption !==
      "tailor_visit"
    ) {
      return res.status(400).json({
        message:
          "This order does not require a visit.",
      });
    }

    if (
      order.status !==
      "Awaiting Tailor Review"
    ) {
      return res.status(400).json({
        message:
          "Appointment changes are not allowed at this stage.",
      });
    }

    if (
      !["Pending", "Proposed"].includes(
        order.measurementVisitStatus || "Pending"
      )
    ) {
      return res.status(400).json({
        message:
          "This appointment cannot be changed.",
      });
    }

    const selectedTailor =
      await Tailor.findById(
        req.tailor.id
      ).select("isVerified");

    if (
      !selectedTailor ||
      !selectedTailor.isVerified
    ) {
      return res.status(403).json({
        message:
          "Only verified tailors can provide measurement visits.",
      });
    }

    if (action === "confirm") {
      const requestedDate =
        order.measurementDate
          ? order.measurementDate
              .toISOString()
              .slice(0, 10)
          : "";

      if (
        date !== requestedDate ||
        time !== order.measurementTime
      ) {
        return res.status(400).json({
          message:
            "To change the requested slot, propose a new appointment.",
        });
      }
    }

    order.confirmedMeasurementDate = date;
    order.confirmedMeasurementTime =
      time.trim();

    order.measurementVisitStatus =
      action === "confirm"
        ? "Confirmed"
        : "Proposed";

    clearHomeVisitOtp(order);

    await order.save();

    return res.status(200).json({
      message:
        action === "confirm"
          ? "Measurement appointment confirmed."
          : "New appointment proposed to customer.",
      order,
    });
  } catch (error) {
    console.error(
      "MEASUREMENT APPOINTMENT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update measurement appointment.",
    });
  }
};

// ==========================================
// CUSTOMER CONFIRMS PROPOSED SLOT
// ==========================================

const confirmProposedMeasurement = async (
  req,
  res
) => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.customer) !==
      String(req.customer.id)
    ) {
      return res.status(403).json({
        message:
          "Not authorized for this order.",
      });
    }

    if (
      order.measurementOption !== "tailor_visit" ||
      order.measurementVisitStatus !== "Proposed" ||
      order.status !== "Awaiting Tailor Review"
    ) {
      return res.status(400).json({
        message:
          "No proposed appointment is awaiting confirmation.",
      });
    }

    const proposedDate =
      order.confirmedMeasurementDate
        ? order.confirmedMeasurementDate
            .toISOString()
            .slice(0, 10)
        : "";

    if (!isValidFutureOrToday(proposedDate)) {
      return res.status(400).json({
        message:
          "The proposed date has passed. Contact the tailor.",
      });
    }

    order.measurementVisitStatus =
      "Confirmed";

    clearHomeVisitOtp(order);

    await order.save();

    return res.status(200).json({
      message:
        "Measurement appointment confirmed.",
      order,
    });
  } catch (error) {
    console.error(
      "CONFIRM MEASUREMENT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to confirm appointment.",
    });
  }
};

// ==========================================
// COMPLETE MEASUREMENT VISIT
// ==========================================

const completeMeasurementVisit = async (
  req,
  res
) => {
  try {
    const {
      measurements,
      fabricCollected,
      fabricCollectionNote,
    } = req.body;

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.tailor) !==
      String(req.tailor.id)
    ) {
      return res.status(403).json({
        message:
          "Not authorized for this order.",
      });
    }

    if (
      order.measurementOption !== "tailor_visit" ||
      order.measurementVisitStatus !== "Confirmed" ||
      order.status !== "Awaiting Tailor Review"
    ) {
      return res.status(400).json({
        message:
          "A confirmed measurement visit is required.",
      });
    }

    if (
      !order.homeVisitVerified ||
      !order.homeVisitVerifiedAt
    ) {
      return res.status(400).json({
        message:
          "Customer must verify the assigned visitor before completing the measurement visit.",
      });
    }

    const selectedTailor =
      await Tailor.findById(
        req.tailor.id
      ).select("isVerified");

    if (!selectedTailor?.isVerified) {
      return res.status(403).json({
        message:
          "Only verified tailors can complete measurement visits.",
      });
    }

    if (
      !measurements ||
      typeof measurements !== "object" ||
      Array.isArray(measurements) ||
      Object.keys(measurements).length === 0
    ) {
      return res.status(400).json({
        message:
          "Please enter the recorded measurements.",
      });
    }

    const cleaned = {};

    for (
      const [field, value] of
      Object.entries(measurements)
    ) {
      if (
        !/^[a-zA-Z][a-zA-Z0-9]*$/.test(field) ||
        !Number.isFinite(Number(value)) ||
        Number(value) <= 0 ||
        Number(value) > 200
      ) {
        return res.status(400).json({
          message:
            `Invalid measurement: ${field}`,
        });
      }

      cleaned[field] = String(value);
    }

    if (
      typeof fabricCollected !== "boolean"
    ) {
      return res.status(400).json({
        message:
          "Please specify whether fabric was collected.",
      });
    }

    order.measurements = cleaned;

    order.fabricCollected =
      fabricCollected;

    order.fabricCollectedAt =
      fabricCollected
        ? new Date()
        : null;

    order.fabricCollectionNote =
      typeof fabricCollectionNote === "string"
        ? fabricCollectionNote.trim()
        : "";

    order.measurementVisitStatus =
      "Completed";

    order.measurementCompletedAt =
      new Date();

    await order.save();

    return res.status(200).json({
      message:
        "Measurements recorded successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "COMPLETE MEASUREMENT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to complete measurement visit.",
    });
  }
};

// ==========================================
// ASSIGN HOME VISIT VISITOR
// ==========================================

const assignHomeVisitVisitor = async (
  req,
  res
) => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.tailor) !==
      String(req.tailor.id)
    ) {
      return res.status(403).json({
        message:
          "Not authorized for this order.",
      });
    }

    if (!homeVisitIsConfirmed(order)) {
      return res.status(400).json({
        message:
          "Confirm the measurement appointment before assigning a visitor.",
      });
    }

    const tailor =
      await checkVerifiedTailorForVisit(
        req.tailor.id
      );

    if (!tailor) {
      return res.status(403).json({
        message:
          "Only verified tailors can assign home visitors.",
      });
    }

    const {
      visitorType,
      assistantId,
    } = req.body || {};

    let name;
    let photo;
    let selectedAssistantId = null;

    if (visitorType === "Tailor") {
      name = tailor.ownerName?.trim();
      photo = tailor.profileImage?.trim();
    } else if (
      visitorType === "Assistant"
    ) {
      if (
        !mongoose.isValidObjectId(
          assistantId
        )
      ) {
        return res.status(400).json({
          message:
            "Select a registered assistant.",
        });
      }

      const assistant =
        tailor.homeVisitAssistants?.id(
          assistantId
        );

      if (
        !assistant ||
        !assistant.isActive ||
        assistant.approvalStatus !== "Approved"
      ) {
        return res.status(403).json({
          message:
            "Only active, admin-approved assistants can be assigned to home visits.",
        });
      }

      name = assistant.name?.trim();
      photo = assistant.photo?.trim();
      selectedAssistantId =
        assistant._id;
    } else {
      return res.status(400).json({
        message:
          "Visitor type must be Tailor or Assistant.",
      });
    }

    if (!name || !photo) {
      return res.status(400).json({
        message:
          "Visitor name and profile photo are required before assignment.",
      });
    }

    order.homeVisitVisitorType =
      visitorType;

    order.homeVisitAssistantId =
      selectedAssistantId;

    order.homeVisitVisitorName = name;
    order.homeVisitVisitorPhoto = photo;

    order.homeVisitVisitorAssignedAt =
      new Date();

    clearHomeVisitOtp(order);

    await order.save();

    return res.status(200).json({
      message:
        "Home visit visitor assigned.",
      order,
    });
  } catch (error) {
    console.error(
      "ASSIGN HOME VISIT VISITOR ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to assign home visit visitor.",
    });
  }
};

// ==========================================
// GENERATE HOME VISIT OTP
// ==========================================

const generateHomeVisitOtp = async (
  req,
  res
) => {
  try {
    const order = await Order.findById(
      req.params.id
    ).select(
      "+homeVisitOtpHash +homeVisitOtpExpiresAt"
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.tailor) !==
      String(req.tailor.id)
    ) {
      return res.status(403).json({
        message:
          "Not authorized for this order.",
      });
    }

    if (!homeVisitIsConfirmed(order)) {
      return res.status(400).json({
        message:
          "A confirmed home visit is required.",
      });
    }

    const tailor =
      await checkVerifiedTailorForVisit(
        req.tailor.id
      );

    if (!tailor) {
      return res.status(403).json({
        message:
          "Verified tailor access required.",
      });
    }

    if (
      !order.homeVisitVisitorType ||
      !order.homeVisitVisitorName ||
      !order.homeVisitVisitorPhoto
    ) {
      return res.status(400).json({
        message:
          "Assign a visitor with name and photo first.",
      });
    }

    if (order.homeVisitVerified) {
      return res.status(400).json({
        message:
          "Visitor already verified for this appointment.",
      });
    }

    if (
      order.homeVisitVisitorType ===
      "Assistant"
    ) {
      const assistant =
        tailor.homeVisitAssistants?.id(
          order.homeVisitAssistantId
        );

      if (
        !assistant?.isActive ||
        assistant.approvalStatus !== "Approved" ||
        !assistant.photo ||
        !assistant.name
      ) {
        return res.status(403).json({
          message:
            "Assigned assistant must be active and admin-approved before generating an OTP.",
        });
      }
    }

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    order.homeVisitOtpHash =
      hashHomeVisitOtp(
        order._id,
        otp
      );

    order.homeVisitOtpIssuedAt =
      new Date();

    order.homeVisitOtpExpiresAt =
      new Date(
        Date.now() +
        HOME_VISIT_OTP_LIFETIME_MS
      );

    order.homeVisitOtpAttempts = 0;

    await order.save();

    return res.status(200).json({
      message:
        "Share this code only with the assigned visitor. It expires in 5 minutes.",
      otp,
      expiresAt:
        order.homeVisitOtpExpiresAt,
    });
  } catch (error) {
    console.error(
      "GENERATE HOME VISIT OTP ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to generate home visit OTP.",
    });
  }
};

// ==========================================
// CUSTOMER VERIFIES HOME VISIT OTP
// ==========================================

const verifyHomeVisitOtp = async (
  req,
  res
) => {
  try {
    const otp = req.body?.otp;

    if (
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp.trim())
    ) {
      return res.status(400).json({
        message:
          "Enter a valid 6-digit visitor code.",
      });
    }

    const order = await Order.findById(
      req.params.id
    ).select(
      "+homeVisitOtpHash +homeVisitOtpExpiresAt"
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (
      String(order.customer) !==
      String(req.customer.id)
    ) {
      return res.status(403).json({
        message:
          "Not authorized for this order.",
      });
    }

    if (!homeVisitIsConfirmed(order)) {
      return res.status(400).json({
        message:
          "There is no confirmed visit awaiting verification.",
      });
    }

    if (order.homeVisitVerified) {
      return res.status(400).json({
        message:
          "Visitor has already been verified.",
      });
    }

    if (
      !order.homeVisitVisitorType ||
      !order.homeVisitVisitorName ||
      !order.homeVisitVisitorPhoto
    ) {
      return res.status(400).json({
        message:
          "No assigned visitor found.",
      });
    }

    if (
      !order.homeVisitOtpHash ||
      !order.homeVisitOtpExpiresAt
    ) {
      return res.status(400).json({
        message:
          "Ask the visitor to request a verification code.",
      });
    }

    if (
      order.homeVisitOtpAttempts >=
      HOME_VISIT_MAX_ATTEMPTS
    ) {
      return res.status(429).json({
        message:
          "Too many attempts. Ask the tailor for a new code.",
      });
    }

    if (
      order.homeVisitOtpExpiresAt
        .getTime() <= Date.now()
    ) {
      return res.status(400).json({
        message:
          "Visitor code expired. Ask for a new code.",
      });
    }

    const expected = Buffer.from(
      order.homeVisitOtpHash,
      "hex"
    );

    const actual = Buffer.from(
      hashHomeVisitOtp(
        order._id,
        otp.trim()
      ),
      "hex"
    );

    if (
      expected.length !==
        actual.length ||
      !crypto.timingSafeEqual(
        expected,
        actual
      )
    ) {
      order.homeVisitOtpAttempts += 1;

      await order.save();

      return res.status(400).json({
        message:
          "Incorrect visitor code.",
      });
    }

    order.homeVisitVerified = true;
    order.homeVisitVerifiedAt =
      new Date();

    order.homeVisitOtpHash = "";
    order.homeVisitOtpExpiresAt = null;
    order.homeVisitOtpAttempts = 0;

    await order.save();

    const safeOrder =
      order.toObject();

    delete safeOrder.homeVisitOtpHash;
    delete safeOrder.homeVisitOtpExpiresAt;

    return res.status(200).json({
      message:
        "Home visitor verified successfully.",
      order: safeOrder,
    });
  } catch (error) {
    console.error(
      "VERIFY HOME VISIT OTP ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to verify home visit OTP.",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
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
};
