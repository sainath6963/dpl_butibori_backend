const crypto = require("crypto");
const Player = require("../models/playerModel");
const Payment = require("../models/paymentModel");
const { generateInvoice } = require("../services/invoiceService");
const { sendEmail } = require("../services/emailService");

exports.handleWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];

  const expected = crypto
    .createHmac("sha256", secret)
    .update(req.body)
    .digest("hex");

  if (expected !== signature) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = JSON.parse(req.body);

  if (event.event === "payment.captured") {
    const paymentData = event.payload.payment.entity;

    const player = await Player.findOne({
      razorpayOrderId: paymentData.order_id,
    });

    if (!player) return res.json({});

    if (player.paymentStatus === "SUCCESS") return res.json({});

    // Update Player
    player.paymentStatus = "SUCCESS";
    player.razorpayPaymentId = paymentData.id;

    // Save Payment
    const payment = await Payment.create({
      playerId: player._id,
      orderId: paymentData.order_id,
      paymentId: paymentData.id,
      amount: paymentData.amount / 100,
      status: "SUCCESS",
    });

    // Generate Invoice
    const invoicePath = await generateInvoice(
      player,
      payment
    );

    player.invoicePath = invoicePath;
    await player.save();

    // Send Email
    await sendEmail(
      player.email,
      "Tournament Registration Success",
      "Payment successful. Invoice attached.",
      invoicePath
    );
  }

  res.json({ received: true });
};
