import Payment from '../models/paymentModel.js';
import Player from '../models/playerModel.js';
import crypto from 'crypto';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';

// Verify webhook signature
const verifyWebhookSignature = (body, signature, secret) => {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('hex');
    
    return expectedSignature === signature;
};

// Handle Razorpay webhooks
export const handleRazorpayWebhook = catchAsyncErrors(async (req, res, next) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    if (!verifyWebhookSignature(req.body, signature, webhookSecret)) {
        return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
        case 'payment.captured':
            await handlePaymentCaptured(payload);
            break;
            
        case 'payment.failed':
            await handlePaymentFailed(payload);
            break;
            
        case 'order.paid':
            await handleOrderPaid(payload);
            break;
            
        default:
            console.log(`Unhandled webhook event: ${event}`);
    }

    // Always respond with success to acknowledge webhook receipt
    res.status(200).json({ success: true, received: true });
});

// Handle payment captured
async function handlePaymentCaptured(payload) {
    const paymentEntity = payload.payment.entity;
    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (!payment) {
        console.log(`Payment record not found for order: ${orderId}`);
        return;
    }

    // Prevent duplicate updates
    if (payment.status === 'paid') {
        console.log(`Payment already marked paid: ${paymentId}`);
        return;
    }

    // Only update status — DO NOT create player
    payment.razorpayPaymentId = paymentId;
    payment.status = 'captured'; // webhook capture state
    payment.paidAt = new Date();

    await payment.save();

    console.log(`Payment captured via webhook: ${paymentId}`);
}

// Handle payment failed
async function handlePaymentFailed(payload) {
    const paymentEntity = payload.payment.entity;
    const orderId = paymentEntity.order_id;

    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (payment) {
        payment.status = 'failed';
        await payment.save();

        console.log(`Payment failed: ${paymentEntity.id}`);
    }
}

// Handle order paid
async function handleOrderPaid(payload) {
    const orderEntity = payload.order.entity;
    const orderId = orderEntity.id;

    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (payment) {
        payment.status = 'attempted';
        await payment.save();

        console.log(`Order paid: ${orderId}`);
    }
}