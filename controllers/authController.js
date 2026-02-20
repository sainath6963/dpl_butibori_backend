import User from '../models/userModel.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';
import sendToken from '../utils/jwtToken.js';

// Register user
export const registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
        $or: [{ email }, { phone }] 
    });

    if (existingUser) {
        return next(new ErrorHandler('User with this email or phone already exists', 400));
    }

    // Create user
    const user = await User.create({
        name,
        email,
        phone,
        password
    });

    sendToken(user, 201, res);
});

// Login user
export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password is provided
    if (!email || !password) {
        return next(new ErrorHandler('Please provide email and password', 400));
    }

    // Find user in database
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    sendToken(user, 200, res);
});

// Logout user
export const logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Get current user profile
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});