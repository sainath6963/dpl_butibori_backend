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

// Update player profile
export const updatePlayerProfile = catchAsyncErrors(async (req, res, next) => {
    const player = await Player.findOne({ user: req.user.id });

    if (!player) {
        return next(new ErrorHandler('Player profile not found', 404));
    }

    // Only allow updates if registration is not completed
    if (player.registrationStatus === 'registered') {
        return next(new ErrorHandler('Cannot update profile after registration', 400));
    }

    const updatedPlayer = await Player.findByIdAndUpdate(
        player._id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
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
    
    const player = await Player.findById(req.params.id);

    if (!player) {
        return next(new ErrorHandler('Player not found', 404));
    }

    player.registrationStatus = status;
    
    if (jerseyNumber) {
        player.jerseyNumber = jerseyNumber;
    }

    await player.save();

    res.status(200).json({
        success: true,
        player
    });
});