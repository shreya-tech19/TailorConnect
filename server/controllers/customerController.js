const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");


// ===============================
// GOOGLE CLIENT
// ===============================

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);


// ===============================
// CREATE JWT
// ===============================

const createCustomerToken = (customer) => {
  return jwt.sign(
    {
      id: customer._id,
      role: "customer",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};


// ===============================
// REGISTER CUSTOMER
// ===============================

const registerCustomer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      address,
      city,
      pincode,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !password ||
      !address ||
      !city ||
      !pincode
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await Customer.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        message:
          "An account with this email already exists.",
      });
    }

    const existingPhone = await Customer.findOne({
      phone: phone.trim(),
    });

    if (existingPhone) {
      return res.status(400).json({
        message:
          "An account with this phone number already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const customer = new Customer({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
    });

    await customer.save();

    res.status(201).json({
      message:
        "Customer registered successfully!",
    });
  } catch (error) {
    console.error(
      "CUSTOMER REGISTER ERROR:",
      error
    );

    res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
};


// ===============================
// CUSTOMER LOGIN
// ===============================

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const customer = await Customer.findOne({
      email: normalizedEmail,
    });

    if (!customer) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!customer.password) {
      return res.status(401).json({
        message:
          "This account was created with Google. Please continue with Google.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message:
          "Server authentication configuration is missing.",
      });
    }

    const token = createCustomerToken(
      customer
    );

    res.status(200).json({
      message: "Login successful",
      token,

      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        pincode: customer.pincode,
      },
    });
  } catch (error) {
    console.error(
      "CUSTOMER LOGIN ERROR:",
      error
    );

    res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
};


// ===============================
// GOOGLE LOGIN
// ===============================

const googleLogin = async (req, res) => {
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
          "Google authentication is not configured on the server.",
      });
    }

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message:
          "Unable to verify Google account.",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      email_verified: emailVerified,
    } = payload;

    if (!email || !emailVerified) {
      return res.status(401).json({
        message:
          "Google email could not be verified.",
      });
    }

    const normalizedEmail =
      email.toLowerCase();

    let customer = await Customer.findOne({
      email: normalizedEmail,
    });

    if (!customer) {
      customer = new Customer({
        fullName:
          name || "Google Customer",
        email: normalizedEmail,
        googleId,
      });

      await customer.save();
    } else if (!customer.googleId) {
      customer.googleId = googleId;
      await customer.save();
    }

    const token =
      createCustomerToken(customer);

    res.status(200).json({
      message: "Google login successful",
      token,

      customer: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        pincode: customer.pincode || "",
      },
    });
  } catch (error) {
    console.error(
      "GOOGLE LOGIN ERROR:",
      error
    );

    res.status(401).json({
      message:
        "Google authentication failed.",
    });
  }
};


module.exports = {
  registerCustomer,
  loginCustomer,
  googleLogin,
};