const express = require("express");
const router = express.Router();

const {
  handleWebhook,
} = require("../controllers/webhookController");

router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  handleWebhook
);

module.exports = router;
