const express = require("express");
const router = express.Router();

const {
  registerPlayer,
  verifyPayment,
} = require("../controllers/paymentController");

// Register player + create Razorpay order
router.post("/register", registerPlayer);

// Verify payment (frontend fallback)
router.post("/verify", verifyPayment);

module.exports = router;
