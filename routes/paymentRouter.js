import express from 'express';
import {
    createPaymentOrder,
    verifyPayment,
    getPaymentStatus,
    getUserPayments,
    getAllPayments,
    processRefund
} from '../controllers/paymentController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/create-order', isAuthenticatedUser, createPaymentOrder);
router.post('/verify', isAuthenticatedUser, verifyPayment);
router.get('/status/:id', isAuthenticatedUser, getPaymentStatus);
router.get('/my-payments', isAuthenticatedUser, getUserPayments);

// Admin routes
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllPayments);
router.post('/admin/refund/:id', isAuthenticatedUser, authorizeRoles('admin'), processRefund);

export default router;