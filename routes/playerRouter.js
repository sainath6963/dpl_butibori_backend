import express from 'express';
import {
    registerPlayer,
    getPlayerProfile,
    updatePlayerProfile,
    getAllPlayers,
    updatePlayerStatus
} from '../controllers/playerController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/register', isAuthenticatedUser, registerPlayer);
router.get('/profile', isAuthenticatedUser, getPlayerProfile);
router.put('/profile', isAuthenticatedUser, updatePlayerProfile);

// Admin routes
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllPlayers);
router.put('/admin/status/:id', isAuthenticatedUser, authorizeRoles('admin'), updatePlayerStatus);

export default router;