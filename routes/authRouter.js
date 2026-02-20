import express from 'express';
import {
    registerUser,
    loginUser,
    logout,
    getUserProfile
} from '../controllers/authController.js';
import { isAuthenticatedUser } from '../middlewares/authMiddleware.js';
import { validateRegistration, validateLogin } from '../utils/validators.js';

const router = express.Router();

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/logout', isAuthenticatedUser, logout);
router.get('/profile', isAuthenticatedUser, getUserProfile);

export default router;