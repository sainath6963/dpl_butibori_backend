import express from 'express';
import {
    createPaymentOrder,
    verifyPayment,
    getPaymentStatus,
    getUserPayments,
    getAllPayments,
    processRefund,
    updatePaymentStatus 
} from '../controllers/paymentController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ================= USER =================

// Create order
router.post('/create-order', createPaymentOrder);

// Verify payment
router.post('/verify', verifyPayment);

// Update payment status (cancel / failed)
router.patch('/status/:paymentId', updatePaymentStatus);

// Get single payment
router.get('/status/:id', getPaymentStatus);

// My payments
router.get('/my-payments', getUserPayments);

// ================= ADMIN =================

router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllPayments);

router.post('/admin/refund/:id',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  processRefund
);

export default router;