import express from 'express';
import User from '../models/userModel.js';
import { isAuthenticatedUser, authorizeRoles } from '../middlewares/authMiddleware.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';

const router = express.Router();

// Get all users (admin only)
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), catchAsyncErrors(async (req, res) => {
    const users = await User.find().select('-password');
    res.status(200).json({
        success: true,
        count: users.length,
        users
    });
}));

// Update user profile
router.put('/profile', isAuthenticatedUser, catchAsyncErrors(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    ).select('-password');

    res.status(200).json({
        success: true,
        user
    });
}));

export default router;