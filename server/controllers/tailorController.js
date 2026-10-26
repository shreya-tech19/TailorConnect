
const Tailor = require("../models/Tailor");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ===============================
// REGISTER TAILOR
// ===============================

const registerTailor = async (req, res) => {
  try {
    const {
      shopName,
      ownerName,
      email,
      phone,
      password,
      city,
      address,
      specialization,
      experience,
      priceRange,
      description,
    } = req.body;

    if (
      !shopName ||
      !ownerName ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Shop name, owner name, email, phone and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingTailor = await Tailor.findOne({
      email: normalizedEmail,
    });

    if (existingTailor) {
      return res.status(400).json({
        message:
          "A tailor account with this email already exists.",
      });
    }

    const existingPhone = await Tailor.findOne({
      phone: phone.trim(),
    });

    if (existingPhone) {
      return res.status(400).json({
        message:
          "A tailor account with this phone number already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tailor = new Tailor({
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,

      city: city || "Not provided",
      address: address || "Not provided",
      specialization: specialization || "General Tailoring",
      experience: experience ? Number(experience) : 0,
      priceRange: priceRange || "Contact tailor",
      description:
        description ||
        "Professional tailoring services available through TailorConnect.",

      isAvailable: true,
      availabilityMessage: "Available for new orders",
    });

    await tailor.save();

    res.status(201).json({
      message: "Tailor registered successfully!",
      tailor: {
        id: tailor._id,
        shopName: tailor.shopName,
        ownerName: tailor.ownerName,
        email: tailor.email,
        phone: tailor.phone,
        city: tailor.city,
        address: tailor.address,
        specialization: tailor.specialization,
        experience: tailor.experience,
        priceRange: tailor.priceRange,
        description: tailor.description,
        isAvailable: tailor.isAvailable,
        availabilityMessage: tailor.availabilityMessage,
      },
    });
  } catch (error) {
    console.error("TAILOR REGISTER ERROR:", error);

    res.status(500).json({
      message: "Tailor registration failed.",
    });
  }
};

// ===============================
// TAILOR LOGIN
// ===============================

const loginTailor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const tailor = await Tailor.findOne({
      email: normalizedEmail,
    });

    if (!tailor) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!tailor.password) {
      return res.status(401).json({
        message:
          "This account cannot use password login.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      tailor.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from .env");

      return res.status(500).json({
        message:
          "Server authentication configuration is missing.",
      });
    }

    const token = jwt.sign(
      {
        id: tailor._id,
        role: "tailor",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful!",
      token,

      tailor: {
        id: tailor._id,
        shopName: tailor.shopName,
        ownerName: tailor.ownerName,
        email: tailor.email,
        phone: tailor.phone,
        city: tailor.city,
        address: tailor.address,
        specialization: tailor.specialization,
        experience: tailor.experience,
        priceRange: tailor.priceRange,
        description: tailor.description,
        profileImage: tailor.profileImage || "",
        isVerified: tailor.isVerified === true,
        isAvailable:
          tailor.isAvailable !== undefined
            ? tailor.isAvailable
            : true,
        availabilityMessage:
          tailor.availabilityMessage ||
          "Available for new orders",
      },
    });
  } catch (error) {
    console.error("TAILOR LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};

// ===============================
// TAILOR GOOGLE LOGIN
// ===============================

const googleLoginTailor = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required.",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message:
          "Google authentication is not configured.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const emailVerified = payload.email_verified;

    if (!email || !emailVerified) {
      return res.status(401).json({
        message:
          "Google email could not be verified.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const tailor = await Tailor.findOne({
      email: normalizedEmail,
    });

    if (!tailor) {
      return res.status(404).json({
        message:
          "No tailor account exists with this Google email. Please register first.",
      });
    }

    if (
      tailor.googleId &&
      tailor.googleId !== googleId
    ) {
      return res.status(401).json({
        message:
          "This Google account is not linked to this tailor account.",
      });
    }

    tailor.googleId = googleId;
    await tailor.save();

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message:
          "Server authentication configuration is missing.",
      });
    }

    const token = jwt.sign(
      {
        id: tailor._id,
        role: "tailor",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      message: "Google login successful!",
      token,

      tailor: {
        id: tailor._id,
        shopName: tailor.shopName,
        ownerName: tailor.ownerName,
        email: tailor.email,
        phone: tailor.phone,
        city: tailor.city,
        address: tailor.address,
        specialization: tailor.specialization,
        experience: tailor.experience,
        priceRange: tailor.priceRange,
        description: tailor.description,
        profileImage: tailor.profileImage || "",
        isVerified: tailor.isVerified === true,
        isAvailable:
          tailor.isAvailable !== undefined
            ? tailor.isAvailable
            : true,
        availabilityMessage:
          tailor.availabilityMessage ||
          "Available for new orders",
      },
    });
  } catch (error) {
    console.error(
      "TAILOR GOOGLE LOGIN ERROR:",
      error
    );

    return res.status(401).json({
      message:
        "Google login failed. Please try again.",
    });
  }
};

// ===============================
// GET ALL TAILORS
// ===============================

const getAllTailors = async (req, res) => {
  try {
    const tailors = await Tailor.find()
      .select("-password -homeVisitAssistants");

    res.status(200).json(tailors);
  } catch (error) {
    console.error("GET TAILORS ERROR:", error);

    res.status(500).json({
      message: "Unable to fetch tailors.",
    });
  }
};

// ===============================
// GET TAILOR BY ID
// ===============================

const getTailorById = async (req, res) => {
  try {
    const tailor = await Tailor.findById(
      req.params.id
    ).select("-password -homeVisitAssistants");

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found.",
      });
    }

    res.status(200).json(tailor);
  } catch (error) {
    console.error("GET TAILOR ERROR:", error);

    res.status(500).json({
      message: "Unable to fetch tailor.",
    });
  }
};

// ==========================================
// UPDATE TAILOR AVAILABILITY
// ==========================================

const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        message:
          "isAvailable must be true or false.",
      });
    }

    if (
      !mongoose.isValidObjectId(id) ||
      String(req.tailor?.id) !== String(id)
    ) {
      return res.status(403).json({
        message:
          "You can update only your own profile.",
      });
    }

    const tailor = await Tailor.findById(id);

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found.",
      });
    }

    tailor.isAvailable = isAvailable;

    tailor.availabilityMessage = isAvailable
      ? "Available for new stitching orders"
      : "Currently not accepting new stitching orders";

    await tailor.save();

    return res.status(200).json({
      message: isAvailable
        ? "You are now available for new orders."
        : "You are now unavailable for new orders.",
      tailor: {
        _id: tailor._id,
        shopName: tailor.shopName,
        ownerName: tailor.ownerName,
        isAvailable: tailor.isAvailable,
        availabilityMessage:
          tailor.availabilityMessage,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE AVAILABILITY ERROR:",
      error
    );

    return res.status(500).json({
      message: "Unable to update availability.",
    });
  }
};

// ==========================================
// UPDATE TAILOR PROFILE IMAGE
// ==========================================

const updateProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileImage } = req.body;

    if (
      typeof profileImage !== "string" ||
      !profileImage.trim()
    ) {
      return res.status(400).json({
        message: "Profile image URL is required.",
      });
    }

    if (
      !mongoose.isValidObjectId(id) ||
      String(req.tailor?.id) !== String(id)
    ) {
      return res.status(403).json({
        message:
          "You can update only your own profile.",
      });
    }

    const tailor = await Tailor.findById(id);

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found.",
      });
    }

    tailor.profileImage = profileImage.trim();

    await tailor.save();

    return res.status(200).json({
      message:
        "Profile image updated successfully.",
      tailor: {
        _id: tailor._id,
        shopName: tailor.shopName,
        ownerName: tailor.ownerName,
        profileImage: tailor.profileImage,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE PROFILE IMAGE ERROR:",
      error
    );

    return res.status(500).json({
      message: "Unable to update profile image.",
    });
  }
};
// ==========================================
// UPDATE TAILOR PROFILE
// ==========================================

const updateTailorProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id) ||
      String(req.tailor?.id) !== String(id)
    ) {
      return res.status(403).json({
        message: "You can update only your own profile.",
      });
    }

    const tailor = await Tailor.findById(id);

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found.",
      });
    }

    const allowedFields = [
      "shopName",
      "ownerName",
      "phone",
      "city",
      "address",
      "specialization",
      "experience",
      "priceRange",
      "description",
    ];

    for (const field of allowedFields) {
      if (req.body[field] === undefined) continue;

      if (field === "experience") {
        const experience = Number(req.body.experience);

        if (
          !Number.isInteger(experience) ||
          experience < 0 ||
          experience > 80
        ) {
          return res.status(400).json({
            message: "Enter valid years of experience.",
          });
        }

        tailor.experience = experience;
      } else {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            message: `Invalid value for ${field}.`,
          });
        }

        const value = req.body[field].trim();

        if (!value || value.length > 500) {
          return res.status(400).json({
            message: `Enter a valid ${field}.`,
          });
        }

        tailor[field] = value;
      }
    }

    if (req.body.phone !== undefined) {
      if (!/^[6-9]\d{9}$/.test(tailor.phone)) {
        return res.status(400).json({
          message: "Enter a valid 10-digit phone number.",
        });
      }

      const existingPhone = await Tailor.findOne({
        phone: tailor.phone,
        _id: { $ne: tailor._id },
      });

      if (existingPhone) {
        return res.status(400).json({
          message: "This phone number is already registered.",
        });
      }
    }

    await tailor.save();

    const updatedTailor = await Tailor.findById(id)
      .select("-password -homeVisitAssistants");

    return res.status(200).json({
      message: "Profile updated successfully.",
      tailor: updatedTailor,
    });

  } catch (error) {
    console.error("UPDATE TAILOR PROFILE ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check the profile details.",
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Phone number is already registered.",
      });
    }

    return res.status(500).json({
      message: "Unable to update tailor profile.",
    });
  }
};
// ==========================================
// REGISTER HOME VISIT ASSISTANT
// ==========================================

const registerHomeVisitAssistant = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { name, photo } = req.body;

    if (
      !mongoose.isValidObjectId(id) ||
      String(req.tailor?.id) !== String(id)
    ) {
      return res.status(403).json({
        message:
          "You can register assistants only for your own tailor account.",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof photo !== "string" ||
      !photo.trim()
    ) {
      return res.status(400).json({
        message:
          "Assistant name and photo are required.",
      });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({
        message:
          "Assistant name must be within 100 characters.",
      });
    }

    if (!/^https:\/\/.+/i.test(photo.trim())) {
      return res.status(400).json({
        message:
          "Assistant photo must be a secure HTTPS URL.",
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
          "Only admin-verified tailors can register home visit assistants.",
      });
    }

    tailor.homeVisitAssistants.push({
      name: name.trim(),
      photo: photo.trim(),
      isActive: true,
      approvalStatus: "Pending",
      approvedAt: null,
      approvedBy: null,
    });

    await tailor.save();

    const assistant =
      tailor.homeVisitAssistants[
        tailor.homeVisitAssistants.length - 1
      ];

    return res.status(201).json({
      message:
        "Assistant registered. Waiting for admin approval.",
      assistant,
    });
  } catch (error) {
    console.error(
      "REGISTER HOME VISIT ASSISTANT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to register home visit assistant.",
    });
  }
};

// ==========================================
// GET MY HOME VISIT ASSISTANTS
// ==========================================

const getHomeVisitAssistants = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.isValidObjectId(id) ||
      String(req.tailor?.id) !== String(id)
    ) {
      return res.status(403).json({
        message:
          "You can view only your own assistants.",
      });
    }

    const tailor = await Tailor.findById(id)
      .select("homeVisitAssistants");

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found.",
      });
    }

    return res.status(200).json({
      assistants:
        tailor.homeVisitAssistants || [],
    });
  } catch (error) {
    console.error(
      "GET HOME VISIT ASSISTANTS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to fetch home visit assistants.",
    });
  }
};

// ==========================================
// DEACTIVATE HOME VISIT ASSISTANT
// ==========================================

const deactivateHomeVisitAssistant = async (
  req,
  res
) => {
  try {
    const { id, assistantId } = req.params;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(assistantId) ||
      String(req.tailor?.id) !== String(id)
    ) {
      return res.status(403).json({
        message:
          "You can manage only your own assistants.",
      });
    }

    const tailor = await Tailor.findById(id);

    if (!tailor) {
      return res.status(404).json({
        message: "Tailor not found.",
      });
    }

    const assistant =
      tailor.homeVisitAssistants.id(assistantId);

    if (!assistant) {
      return res.status(404).json({
        message: "Assistant not found.",
      });
    }

    if (!assistant.isActive) {
      return res.status(400).json({
        message:
          "Assistant is already inactive.",
      });
    }

    assistant.isActive = false;
    assistant.approvalStatus = "Pending";
    assistant.approvedAt = null;
    assistant.approvedBy = null;

    await tailor.save();

    // Cancel pending assignments for this assistant.
    // Do not change completed measurement visits.
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
        "Assistant deactivated successfully.",
      assistant,
    });
  } catch (error) {
    console.error(
      "DEACTIVATE HOME VISIT ASSISTANT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to deactivate home visit assistant.",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
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
};
