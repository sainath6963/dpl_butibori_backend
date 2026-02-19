const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: String,
    mobile: String,
    email: String,
    teamName: String,

    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    invoicePath: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Player", playerSchema);
