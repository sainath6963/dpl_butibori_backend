import Player from '../models/playerModel.js';
import User from '../models/userModel.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import path from "path";
import fs from "fs";


export const registerPlayer = catchAsyncErrors(async (req, res, next) => {
  const traceId = `REG-${Date.now()}`;
console.log(`\n==============================`);
console.log(`🚀 [${traceId}] REGISTER PLAYER CALLED`);
console.log(`==============================`);


console.log(`📡 [${traceId}] URL →`, req.originalUrl);
console.log(`📡 [${traceId}] METHOD →`, req.method);
console.log(`📡 [${traceId}] HEADERS →`, req.headers["user-agent"]);

  // ================= BODY =================
  console.log("🧾 req.body →", req.body);

  const {
    fullName,
    email,
    address,
    mobileNumber,
    height,
    weight,
    aadharNumber,
    dateOfBirth,
    isBatsman,
    isBowler,
    battingHand,
    bowlingArm,
    bowlingType,
    isWicketKeeper,
    playedTournament,
    tournaments,
    manOfTheMatch,
    manOfTheMatchDetails,
    manOfTheSeries,
    manOfTheSeriesDetails,
  } = req.body;

  // ================= FILES =================
  console.log("📂 req.files →", req.files);

  if (!req.files || !req.files.playerPhoto) {
    console.log("❌ Player photo missing");
    return next(new ErrorHandler("Player photo is required", 400));
  }

  // ================= DUPLICATE CHECK =================
  console.log("🔍 Checking duplicate player...");

  const existingPlayer = await Player.findOne({
    $or: [{ aadharNumber }, { mobileNumber }, { email }],
  });

  if (existingPlayer) {
    console.log("❌ Duplicate player found:", existingPlayer._id);
    return next(new ErrorHandler("Player already registered", 400));
  }

  console.log("✅ No duplicate player");

  // ================= UPLOAD DIR =================
  const uploadsDir = path.join(process.cwd(), "uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Uploads folder created");
  }

  // ================= FILE SAVE FUNCTION =================
  const saveFile = async (file) => {
    console.log("⬆️ Saving file:", file.name);

    const fileName = `${Date.now()}_${file.name}`;
    const uploadPath = path.join(uploadsDir, fileName);

    await file.mv(uploadPath);

    console.log("✅ File saved:", fileName);

    return `/uploads/${fileName}`;
  };

  // ================= SAVE FILES =================
  const photoPath = await saveFile(req.files.playerPhoto);

  const aadharPath = req.files.aadharCard
    ? await saveFile(req.files.aadharCard)
    : null;

  const panPath = req.files.panCard
    ? await saveFile(req.files.panCard)
    : null;

  const licensePath = req.files.drivingLicense
    ? await saveFile(req.files.drivingLicense)
    : null;

  console.log("📎 File Paths:", {
    photoPath,
    aadharPath,
    panPath,
    licensePath,
  });

  // ================= BOOLEAN CONVERT =================
  const convertBool = (val) => val === "true" || val === true;

  // ================= JSON PARSE =================
  let parsedTournaments = [];
  let parsedMOM = [];
  let parsedMOS = [];

  try {
    parsedTournaments = tournaments ? JSON.parse(tournaments) : [];
    parsedMOM = manOfTheMatchDetails
      ? JSON.parse(manOfTheMatchDetails)
      : [];
    parsedMOS = manOfTheSeriesDetails
      ? JSON.parse(manOfTheSeriesDetails)
      : [];
  } catch (err) {
    console.log("❌ JSON Parse Error:", err.message);
  }

  console.log("🏏 Parsed Data:", {
    parsedTournaments,
    parsedMOM,
    parsedMOS,
  });

// ================= CLEAN ENUM VALUES =================
const cleanEnum = (val) => {
  if (!val || val === "") return undefined;
  return val;
};

const cleanedBattingHand = cleanEnum(battingHand);
const cleanedBowlingArm = cleanEnum(bowlingArm);
const cleanedBowlingType = cleanEnum(bowlingType);

console.log("🧹 Cleaned Enums:", {
  cleanedBattingHand,
  cleanedBowlingArm,
  cleanedBowlingType,
});

// ================= CREATE PLAYER =================
// ================= BLOCK DIRECT CREATION =================
console.log(`❌ [${traceId}] BLOCKED — Player cannot be created before payment`);

return res.status(400).json({
  success: false,
  message: "Player will be created only after successful payment."
});

// ================= BLOCK DIRECT CREATION =================
  // ================= RESPONSE =================
  res.status(201).json({
    success: true,
    message: "Player registered successfully. Please complete payment.",
    player,
  });
});

// Get player profile
export const getPlayerProfile = catchAsyncErrors(async (req, res, next) => {
    const player = await Player.findOne({ user: req.user.id })
        .populate('user', 'name email phone')
        .populate('payment');

    if (!player) {
        return next(new ErrorHandler('Player profile not found', 404));
    }

    res.status(200).json({
        success: true,
        player
    });
});

export const updatePlayerProfile = catchAsyncErrors(async (req, res, next) => {

    const player = await Player.findOne({ user: req.user.id });

    if (!player) {
        return next(new ErrorHandler("Player profile not found", 404));
    }

    if (player.registrationStatus === "approved") {
        return next(
            new ErrorHandler("Cannot update profile after approval", 400)
        );
    }

    // ✅ Parse JSON fields if sent as string
    if (req.body.tournaments) {
        req.body.tournaments = JSON.parse(req.body.tournaments);
    }

    if (req.body.manOfTheMatchDetails) {
        req.body.manOfTheMatchDetails = JSON.parse(req.body.manOfTheMatchDetails);
    }

    if (req.body.manOfTheSeriesDetails) {
        req.body.manOfTheSeriesDetails = JSON.parse(req.body.manOfTheSeriesDetails);
    }

    // ✅ Handle File Updates (NEW CODE ADDED)
    if (req.files) {

        const uploadsDir = path.join(process.cwd(), "uploads");

        const saveFile = async (file) => {
            const fileName = `${Date.now()}_${file.name}`;
            const uploadPath = path.join(uploadsDir, fileName);
            await file.mv(uploadPath);
            return `/uploads/${fileName}`;
        };

        // If new file uploaded → update document path
        if (req.files.playerPhoto) {
            req.body["documents.playerPhoto"] = await saveFile(req.files.playerPhoto);
        }

        if (req.files.aadharCard) {
            req.body["documents.aadharCard"] = await saveFile(req.files.aadharCard);
        }

        if (req.files.panCard) {
            req.body["documents.panCard"] = await saveFile(req.files.panCard);
        }

        if (req.files.drivingLicense) {
            req.body["documents.drivingLicense"] = await saveFile(req.files.drivingLicense);
        }
    }

    // ✅ Prevent restricted fields
    const restrictedFields = ["user", "payment", "registrationStatus", "_id"];
    restrictedFields.forEach(field => delete req.body[field]);

    const updatedPlayer = await Player.findByIdAndUpdate(
        player._id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    )
    .populate("user", "name email phone")
    .populate("payment", "amount status")
    .select("-__v");

    res.status(200).json({
        success: true,
        message: "Player profile updated successfully",
        player: updatedPlayer
    });
});

// Admin: Get all players
export const getAllPlayers = catchAsyncErrors(async (req, res, next) => {
    const players = await Player.find()
        .populate('user', 'name email phone')
        .populate('payment');

    res.status(200).json({
        success: true,
        count: players.length,
        players
    });
});

// Admin: Update player status
export const updatePlayerStatus = catchAsyncErrors(async (req, res, next) => {
    const { status, jerseyNumber } = req.body;

    const allowedStatuses = ["pending", "payment-pending", "approved", "rejected"];

    if (!allowedStatuses.includes(status)) {
        return next(new ErrorHandler("Invalid registration status", 400));
    }

    const player = await Player.findById(req.params.id);

    if (!player) {
        return next(new ErrorHandler("Player not found", 404));
    }

    // 🔹 If approving, jersey number is required
    if (status === "approved") {

        if (!jerseyNumber) {
            return next(
                new ErrorHandler("Jersey number is required when approving player", 400)
            );
        }

        // 🔹 Check duplicate jersey number
        const existingJersey = await Player.findOne({
            jerseyNumber,
            _id: { $ne: player._id }
        });

        if (existingJersey) {
            return next(
                new ErrorHandler("Jersey number already assigned to another player", 400)
            );
        }

        player.jerseyNumber = jerseyNumber;
    }

    // 🔹 If rejected → remove jersey number
    if (status === "rejected") {
        player.jerseyNumber = undefined;
    }

    player.registrationStatus = status;

    await player.save();

    res.status(200).json({
        success: true,
        message: "Player status updated successfully",
        player
    });
});