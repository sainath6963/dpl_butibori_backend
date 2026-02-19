const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
    orderId: String,
    paymentId: String,
    amount: Number,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
