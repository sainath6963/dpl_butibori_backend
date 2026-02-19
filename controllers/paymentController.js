const Player = require("../models/playerModel");
const { createOrder } = require("../services/razorpayService");

exports.registerPlayer = async (req, res) => {
  try {
    const { name, mobile, email, teamName, amount } = req.body;

    // Create Player
    const player = await Player.create({
      name,
      mobile,
      email,
      teamName,
    });

    // Create Order
    const order = await createOrder(
      amount,
      `receipt_${player._id}`
    );

    player.razorpayOrderId = order.id;
    await player.save();

    res.json({
      success: true,
      order,
      playerId: player._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
