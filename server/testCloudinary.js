require("dotenv").config();

const cloudinary = require("./config/cloudinary");

console.log("Cloudinary configuration loaded.");

console.log({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKeyExists: !!process.env.CLOUDINARY_API_KEY,
  apiSecretExists: !!process.env.CLOUDINARY_API_SECRET,
});