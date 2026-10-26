
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Admin = require("../models/Admin");
const Customer = require("../models/Customer");
const Tailor = require("../models/Tailor");
const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/Order");

// ==========================================
// ADMIN LOGIN
// ==========================================

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid admin credentials.",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Invalid admin credentials.",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Admin login successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Admin login failed.",
    });
  }
};

// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalTailors,
      verifiedTailors,
      pendingTailors,
      totalDeliveryPartners,
      totalOrders,
      completedOrders,
      pendingOrders,
    ] = await Promise.all([
      Customer.countDocuments(),

      Tailor.countDocuments(),

      Tailor.countDocuments({
        isVerified: true,
      }),

      Tailor.countDocuments({
        isVerified: false,
      }),

      DeliveryPartner.countDocuments(),

      Order.countDocuments(),

      Order.countDocuments({
        status: "Completed",
      }),

      Order.countDocuments({
        status: {
          $nin: ["Completed", "Cancelled"],
        },
      }),
    ]);

    return res.status(200).json({
      totalCustomers,
      totalTailors,
      verifiedTailors,
      pendingTailors,
      totalDeliveryPartners,
      totalOrders,
      completedOrders,
      pendingOrders,
    });
  } catch (error) {
    console.error(
      "ADMIN DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load dashboard statistics.",
    });
  }
};

// ==========================================
// GET ALL CUSTOMERS
// ==========================================

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(customers);
  } catch (error) {
    console.error(
      "GET ALL CUSTOMERS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Unable to fetch customers.",
    });
  }
};

// ==========================================
// GET ALL TAILORS
// ==========================================

const getAllTailors = async (req, res) => {
  try {
    const tailors = await Tailor.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json(tailors);
  } catch (error) {
    console.error(
      "GET ALL TAILORS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Unable to fetch tailors.",
    });
  }
};

// ==========================================
// VERIFY TAILOR
// ==========================================

const verifyTailor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid tailor ID.",
      });
    }

    const tailor = await Tailor.findById(id);

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found.",
      });
    }

    tailor.isVerified = true;

    await tailor.save();

    const safeTailor = tailor.toObject();
    delete safeTailor.password;

    return res.status(200).json({
      message: "Tailor verified successfully.",
      tailor: safeTailor,
    });
  } catch (error) {
    console.error(
      "VERIFY TAILOR ERROR:",
      error
    );

    return res.status(500).json({
      message: "Unable to verify tailor.",
    });
  }
};

// ==========================================
// UNVERIFY TAILOR
// ==========================================

const unverifyTailor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid tailor ID.",
      });
    }

    const tailor = await Tailor.findById(id);

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found.",
      });
    }

    tailor.isVerified = false;

    await tailor.save();

    const safeTailor = tailor.toObject();
    delete safeTailor.password;

    return res.status(200).json({
      message: "Tailor verification removed.",
      tailor: safeTailor,
    });
  } catch (error) {
    console.error(
      "UNVERIFY TAILOR ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to update tailor verification.",
    });
  }
};

// ==========================================
// APPROVE HOME VISIT ASSISTANT
// ==========================================

const approveHomeVisitAssistant = async (
  req,
  res
) => {
  try {
    const { id, assistantId } = req.params;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(assistantId)
    ) {
      return res.status(400).json({
        message: "Invalid tailor or assistant ID.",
      });
    }

    const tailor = await Tailor.findById(id);

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found.",
      });
    }

    if (!tailor.isVerified) {
      return res.status(403).json({
        message:
          "Verify the tailor before approving assistants.",
      });
    }

    const assistant =
      tailor.homeVisitAssistants?.id(
        assistantId
      );

    if (!assistant) {
      return res.status(404).json({
        message: "Assistant not found.",
      });
    }

    if (
      !assistant.name?.trim() ||
      !assistant.photo?.trim()
    ) {
      return res.status(400).json({
        message:
          "Assistant must have a name and photo before approval.",
      });
    }

    if (!assistant.isActive) {
      return res.status(400).json({
        message:
          "Inactive assistants cannot be approved.",
      });
    }

    if (
      assistant.approvalStatus === "Approved"
    ) {
      return res.status(400).json({
        message:
          "Assistant is already approved.",
      });
    }

    assistant.approvalStatus = "Approved";
    assistant.approvedAt = new Date();
    assistant.approvedBy = req.admin.id;

    await tailor.save();

    return res.status(200).json({
      message:
        "Home visit assistant approved successfully.",
      assistant,
    });
  } catch (error) {
    console.error(
      "APPROVE HOME VISIT ASSISTANT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to approve home visit assistant.",
    });
  }
};

// ==========================================
// REJECT HOME VISIT ASSISTANT
// ==========================================

const rejectHomeVisitAssistant = async (
  req,
  res
) => {
  try {
    const { id, assistantId } = req.params;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(assistantId)
    ) {
      return res.status(400).json({
        message: "Invalid tailor or assistant ID.",
      });
    }

    const tailor = await Tailor.findById(id);

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found.",
      });
    }

    const assistant =
      tailor.homeVisitAssistants?.id(
        assistantId
      );

    if (!assistant) {
      return res.status(404).json({
        message: "Assistant not found.",
      });
    }

    assistant.approvalStatus = "Rejected";
    assistant.approvedAt = null;
    assistant.approvedBy = null;

    await tailor.save();

    // Invalidate pending visit assignments for this assistant.
    // Completed visits remain unchanged.
    await Order.updateMany(
      {
        tailor: tailor._id,
        homeVisitAssistantId: assistant._id,
        homeVisitVisitorType: "Assistant",
        measurementVisitStatus: "Confirmed",
        homeVisitVerified: false,
      },
      {
        $set: {
          homeVisitVisitorType: null,
          homeVisitAssistantId: null,
          homeVisitVisitorName: "",
          homeVisitVisitorPhoto: "",
          homeVisitVisitorAssignedAt: null,
          homeVisitOtpHash: "",
          homeVisitOtpExpiresAt: null,
          homeVisitOtpAttempts: 0,
          homeVisitOtpIssuedAt: null,
          homeVisitVerified: false,
          homeVisitVerifiedAt: null,
        },
      }
    );

    return res.status(200).json({
      message:
        "Home visit assistant rejected successfully.",
      assistant,
    });
  } catch (error) {
    console.error(
      "REJECT HOME VISIT ASSISTANT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to reject home visit assistant.",
    });
  }
};

// ==========================================
// GET ALL DELIVERY PARTNERS
// ==========================================

const getAllDeliveryPartners = async (
  req,
  res
) => {
  try {
    const partners =
      await DeliveryPartner.find()
        .select("-password")
        .sort({ createdAt: -1 });

    return res.status(200).json(partners);
  } catch (error) {
    console.error(
      "GET DELIVERY PARTNERS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to fetch delivery partners.",
    });
  }
};

// ==========================================
// GET ALL ORDERS
// ==========================================

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate(
        "customer",
        "fullName email phone"
      )
      .populate(
        "tailor",
        "shopName ownerName email phone"
      )
      .populate(
        "deliveryPartner",
        "name email phone"
      )
      .populate("design")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error(
      "GET ADMIN ORDERS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Unable to fetch orders.",
    });
  }
};

// ==========================================
// UPDATE ORDER STATUS BY ADMIN
// ==========================================

const updateOrderStatusByAdmin = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
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
    ];

    if (!status) {
      return res.status(400).json({
        message: "Order status is required.",
      });
    }

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

    order.status = status;

    await order.save();

    return res.status(200).json({
      message:
        "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error(
      "ADMIN UPDATE ORDER STATUS ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  loginAdmin,
  getDashboardStats,
  getAllCustomers,
  getAllTailors,
  verifyTailor,
  unverifyTailor,
  approveHomeVisitAssistant,
  rejectHomeVisitAssistant,
  getAllDeliveryPartners,
  getAllOrders,
  updateOrderStatusByAdmin,
};
