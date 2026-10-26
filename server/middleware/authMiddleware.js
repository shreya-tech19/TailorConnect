
const jwt = require("jsonwebtoken");

// ==========================================
// CUSTOMER AUTHENTICATION
// ==========================================

const protectCustomer = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Please login to continue.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "customer") {
      return res.status(403).json({
        message: "Customer access required.",
      });
    }

    req.customer = decoded;

    next();
  } catch (error) {
    console.error(
      "CUSTOMER AUTH ERROR:",
      error
    );

    return res.status(401).json({
      message:
        "Session expired. Please login again.",
    });
  }
};

// ==========================================
// TAILOR AUTHENTICATION
// ==========================================

const protectTailor = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Please login as a tailor.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "tailor") {
      return res.status(403).json({
        message: "Tailor access required.",
      });
    }

    req.tailor = decoded;

    next();
  } catch (error) {
    console.error(
      "TAILOR AUTH ERROR:",
      error
    );

    return res.status(401).json({
      message:
        "Tailor session expired. Please login again.",
    });
  }
};

// ==========================================
// DELIVERY PARTNER AUTHENTICATION
// ==========================================

const protectDeliveryPartner = (
  req,
  res,
  next
) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message:
          "Please login as a delivery partner.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "deliveryPartner") {
      return res.status(403).json({
        message:
          "Delivery partner access required.",
      });
    }

    req.deliveryPartner = decoded;

    next();
  } catch (error) {
    console.error(
      "DELIVERY PARTNER AUTH ERROR:",
      error
    );

    return res.status(401).json({
      message:
        "Delivery partner session expired. Please login again.",
    });
  }
};

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Please login as admin.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required.",
      });
    }

    req.admin = decoded;

    next();
  } catch (error) {
    console.error(
      "ADMIN AUTH ERROR:",
      error
    );

    return res.status(401).json({
      message:
        "Admin session expired. Please login again.",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  protectCustomer,
  protectTailor,
  protectDeliveryPartner,
  protectAdmin,
};
