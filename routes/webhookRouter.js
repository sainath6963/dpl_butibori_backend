import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Razorpay webhook endpoint (no authentication)
// Use express.raw for webhook to preserve signature
router.post('/razorpay', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

export default router;