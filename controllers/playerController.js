import Player from '../models/playerModel.js';
import User from '../models/userModel.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import path from "path";
import fs from "fs";
export const registerPlayer = catchAsyncErrors(async (req, res, next) => {

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
        manOfTheSeriesDetails
    } = req.body;

    const existingPlayer = await Player.findOne({ user: req.user.id });
    if (existingPlayer) {
        return next(new ErrorHandler("You already have a player profile", 400));
    }

    if (!req.files || !req.files.playerPhoto) {
        return next(new ErrorHandler("Player photo is required", 400));
    }

    const uploadsDir = path.join(process.cwd(), "uploads");

    const saveFile = async (file) => {
        const fileName = `${Date.now()}_${file.name}`;
        const uploadPath = path.join(uploadsDir, fileName);
        await file.mv(uploadPath);
        return `/uploads/${fileName}`;
    };

    const photoPath = await saveFile(req.files.playerPhoto);

    let aadharPath = null;
    let panPath = null;
    let licensePath = null;

    if (req.files.aadharCard) {
        aadharPath = await saveFile(req.files.aadharCard);
    }

    if (req.files.panCard) {
        panPath = await saveFile(req.files.panCard);
    }

    if (req.files.drivingLicense) {
        licensePath = await saveFile(req.files.drivingLicense);
    }

    const convertBool = (val) => val === "true" || val === true;

    const player = await Player.create({
        user: req.user.id,
        fullName,
        email,
        address,
        mobileNumber,
        height,
        weight,
        aadharNumber,
        dateOfBirth,

        isBatsman: convertBool(isBatsman),
        isBowler: convertBool(isBowler),
        battingHand,
        bowlingArm,
        bowlingType,
        isWicketKeeper: convertBool(isWicketKeeper),

        playedTournament: convertBool(playedTournament),
        tournaments: tournaments ? JSON.parse(tournaments) : [],

        manOfTheMatch: convertBool(manOfTheMatch),
        manOfTheMatchDetails: manOfTheMatchDetails
            ? JSON.parse(manOfTheMatchDetails)
            : [],

        manOfTheSeries: convertBool(manOfTheSeries),
        manOfTheSeriesDetails: manOfTheSeriesDetails
            ? JSON.parse(manOfTheSeriesDetails)
            : [],

        documents: {
            playerPhoto: photoPath,
            aadharCard: aadharPath,
            panCard: panPath,
            drivingLicense: licensePath
        }

        // ❌ No payment fields here anymore
        // registrationStatus will default to "payment-pending"
    });

    res.status(201).json({
        success: true,
        message: "Player registered successfully. Please complete payment.",
        player
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