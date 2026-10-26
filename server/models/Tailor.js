
const mongoose = require("mongoose");

// =====================================
// HOME VISIT ASSISTANT SCHEMA
// =====================================

const assistantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    photo: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // =========================
    // ADMIN APPROVAL
    // =========================

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// TAILOR SCHEMA
// =====================================

const tailorSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
    },

    ownerName: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    googleId: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    experience: {
      type: Number,
      required: true,
    },

    priceRange: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    // =========================
    // TAILOR AVAILABILITY
    // =========================

    isAvailable: {
      type: Boolean,
      default: true,
    },

    availabilityMessage: {
      type: String,
      default: "Available for new orders",
    },

    // =========================
    // ADMIN VERIFICATION
    // =========================

    isVerified: {
      type: Boolean,
      default: false,
    },

    // =========================
    // REGISTERED HOME VISIT ASSISTANTS
    // =========================

    homeVisitAssistants: {
      type: [assistantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Tailor",
  tailorSchema
);
