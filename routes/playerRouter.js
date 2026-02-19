const express = require("express");
const router = express.Router();

const {
  getAllPlayers,
  getPlayerById,
  deletePlayer,
} = require("../controllers/playerController");

// Get all players
router.get("/", getAllPlayers);

// Get single player
router.get("/:id", getPlayerById);

// Delete player
router.delete("/:id", deletePlayer);

module.exports = router;
