
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // =========================
    // CUSTOMER DETAILS
    // =========================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // TAILOR
    // =========================

    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tailor",
      required: true,
    },

    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryPartner",
      default: null,
    },

    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Design",
      default: null,
    },

    // =========================
    // GARMENT DETAILS
    // =========================

    garment: {
      type: String,
      required: true,
      trim: true,
    },

    service: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================
    // DESIGN & REQUIREMENTS
    // =========================

    designDescription: {
      type: String,
      default: "",
      trim: true,
    },

    specialRequirements: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // MEASUREMENTS
    // =========================

    measurementOption: {
      type: String,
      enum: [
        "already_have",
        "tailor_visit",
      ],
      required: true,
    },

    measurements: {
      type: Map,
      of: String,
      default: {},
    },

    // =========================
    // MEASUREMENT VISIT
    // =========================

    measurementDate: {
      type: Date,
      default: null,
    },

    measurementTime: {
      type: String,
      default: "",
    },

    // =========================
    // MEASUREMENT APPOINTMENT
    // =========================

    measurementVisitStatus: {
      type: String,
      enum: [
        "Not Required",
        "Pending",
        "Proposed",
        "Confirmed",
        "Completed",
      ],
      default: function () {
        return this.measurementOption === "tailor_visit"
          ? "Pending"
          : "Not Required";
      },
    },

    confirmedMeasurementDate: {
      type: Date,
      default: null,
    },

    confirmedMeasurementTime: {
      type: String,
      default: "",
    },

    measurementCompletedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // HOME VISIT VISITOR IDENTITY
    // =========================

    homeVisitVisitorType: {
      type: String,
      enum: [
        "Tailor",
        "Assistant",
        null,
      ],
      default: null,
    },

    homeVisitAssistantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    homeVisitVisitorName: {
      type: String,
      default: "",
      trim: true,
    },

    homeVisitVisitorPhoto: {
      type: String,
      default: "",
      trim: true,
    },

    homeVisitVisitorAssignedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // HOME VISIT OTP VERIFICATION
    // =========================

    homeVisitOtpHash: {
      type: String,
      default: "",
      select: false,
    },

    homeVisitOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    homeVisitOtpAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    homeVisitOtpIssuedAt: {
      type: Date,
      default: null,
    },

    homeVisitVerified: {
      type: Boolean,
      default: false,
    },

    homeVisitVerifiedAt: {
      type: Date,
      default: null,
    },

    // =========================
    // FABRIC COLLECTION
    // =========================

    fabricCollected: {
      type: Boolean,
      default: false,
    },

    fabricCollectedAt: {
      type: Date,
      default: null,
    },

    fabricCollectionNote: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // PICKUP DETAILS
    // =========================

    pickupAddress: {
      type: String,
      required: true,
    },

    pickupDate: {
      type: Date,
      required: true,
    },

    // =========================
    // TAILOR RESPONSE
    // =========================

    tailorReview: {
      type: String,
      enum: [
        "Pending",
        "Reviewed",
        "Clarification Requested",
      ],
      default: "Pending",
    },

    clarificationMessage: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================
    // STITCHING PRICE
    // =========================

    stitchingPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    estimatedCompletionDate: {
      type: Date,
      default: null,
    },

    // =========================
    // CUSTOMER CONFIRMATION
    // =========================

    customerConfirmation: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
      ],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Paid",
        "Failed",
      ],
      default: "Pending",
    },

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    paymentAmount: {
      type: Number,
      default: null,
      min: 0,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // =========================
    // ORDER STATUS
    // =========================

    status: {
      type: String,
      enum: [
        "Awaiting Tailor Review",
        "Awaiting Customer Clarification",
        "Awaiting Customer Confirmation",
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
      ],
      default: "Awaiting Tailor Review",
    },

    // =========================
    // DELIVERY OTP
    // =========================

    deliveryOtp: {
      type: String,
      default: "",
    },

    deliveryOtpVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Order",
  orderSchema
);
