require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Admin = require("./models/Admin");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.");

    const existingAdmin = await Admin.findOne({
      email: "admin@tailorconnect.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    const admin = new Admin({
      name: "TailorConnect Admin",
      email: "admin@tailorconnect.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    console.log("Admin created successfully.");
    console.log("Email: admin@tailorconnect.com");
    console.log("Password: Admin@123");

    process.exit();
  } catch (error) {
    console.error(
      "ADMIN CREATION ERROR:",
      error
    );

    process.exit(1);
  }
};

createAdmin();