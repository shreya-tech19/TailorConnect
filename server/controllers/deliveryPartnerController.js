const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const DeliveryPartner = require(
  "../models/DeliveryPartner"
);

// ==========================================
// REGISTER DELIVERY PARTNER
// ==========================================

const registerDeliveryPartner = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      city,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Name, email, phone and password are required.",
      });
    }

    const existingPartner =
      await DeliveryPartner.findOne({
        $or: [
          { email: email.toLowerCase() },
          { phone },
        ],
      });

    if (existingPartner) {
      return res.status(400).json({
        message:
          "A delivery partner with this email or phone already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const partner =
      await DeliveryPartner.create({
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        city: city || "",
      });

    res.status(201).json({
      message:
        "Delivery partner registered successfully.",
      deliveryPartner: {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        city: partner.city,
        isAvailable: partner.isAvailable,
      },
    });
  } catch (error) {
    console.error(
      "DELIVERY PARTNER REGISTER ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// LOGIN DELIVERY PARTNER
// ==========================================

const loginDeliveryPartner = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Please enter email and password.",
      });
    }

    const partner =
      await DeliveryPartner.findOne({
        email: email.toLowerCase(),
      });

    if (!partner) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        partner.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: partner._id,
        role: "deliveryPartner",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message:
        "Delivery partner login successful.",
      token,
      deliveryPartner: {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        city: partner.city,
        isAvailable: partner.isAvailable,
      },
    });
  } catch (error) {
    console.error(
      "DELIVERY PARTNER LOGIN ERROR:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  registerDeliveryPartner,
  loginDeliveryPartner,
};