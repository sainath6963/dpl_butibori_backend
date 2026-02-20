import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import catchAsyncErrors from './catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Check if user is authenticated
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
            return next(new ErrorHandler('User not found', 404));
        }
        
        next();
    } catch (error) {
        return next(new ErrorHandler('Invalid or expired token', 401));
    }
});

// Check user roles
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403));
        }
        next();
    };
};