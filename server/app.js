const express = require("express");
const cors = require("cors");
const tailorRoutes = require("./routes/tailorRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const designRoutes = require("./routes/designRoutes");
const adminRoutes = require("./routes/adminRoutes");

const deliveryPartnerRoutes = require(
  "./routes/deliveryPartnerRoutes"
);

const deliveryRoutes = require(
  "./routes/deliveryRoutes"
);
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/upload", uploadRoutes);
app.use("/api/designs", designRoutes);
app.use(
  "/api/delivery-partners",
  deliveryPartnerRoutes
);

app.use(
  "/api/delivery",
  deliveryRoutes
);
app.get("/", (req, res) => {
  res.send("Welcome to TailorConnect API 🚀");
});

// Customer Routes
app.use("/api/customers", customerRoutes);
// Tailor Routes
app.use("/api/tailors", tailorRoutes);
app.use("/api/orders", orderRoutes);
app.use(
  "/api/payments",
  paymentRoutes
);
app.use("/api/admin", adminRoutes);
module.exports = app;