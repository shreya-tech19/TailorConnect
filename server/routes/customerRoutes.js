const express = require("express");

const router = express.Router();

const {
  registerCustomer,
  loginCustomer,
  googleLogin,
} = require("../controllers/customerController");

router.post(
  "/register",
  registerCustomer
);

router.post(
  "/login",
  loginCustomer
);

router.post(
  "/google-login",
  googleLogin
);

module.exports = router;