import Payment from '../models/paymentModel.js';
import Player from '../models/playerModel.js';
import User from '../models/userModel.js';
import razorpayService from '../services/razorpayService.js';
import invoiceService from '../services/invoiceService.js';
import notificationService from '../services/notifyUsers.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Registration fee amount (in INR)
const REGISTRATION_FEE = 500; // Change as needed

// Create payment order
export const createPaymentOrder = catchAsyncErrors(async (req, res, next) => {
    const { playerId } = req.body;

    // Check if player exists and belongs to user
    const player = await Player.findOne({ 
        _id: playerId, 
        user: req.user.id 
    });

    if (!player) {
        return next(new ErrorHandler('Player profile not found', 404));
    }

    // Check if payment already exists and is paid
    if (player.registrationStatus === 'registered' || player.registrationStatus === 'payment-pending') {
        return next(new ErrorHandler('Registration already in progress or completed', 400));
    }

    // Create unique receipt ID
    const receipt = `rcpt_${player._id}_${Date.now()}`;

    // Create Razorpay order
    const order = await razorpayService.createOrder(
        REGISTRATION_FEE,
        'INR',
        receipt
    );

    // Create payment record
    const payment = await Payment.create({
        user: req.user.id,
        player: player._id,
        razorpayOrderId: order.id,
        amount: REGISTRATION_FEE,
        currency: 'INR',
        status: 'created',
        metadata: {
            playerName: player.fullName,
            userEmail: req.user.email
        }
    });

    // Update player registration status
    player.registrationStatus = 'payment-pending';
    player.payment = payment._id;
    await player.save();

    res.status(200).json({
        success: true,
        order: {
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        },
        paymentId: payment._id
    });
});

// Verify payment
export const verifyPayment = catchAsyncErrors(async (req, res, next) => {
    const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentId
    } = req.body;

    // Find payment
    const payment = await Payment.findById(paymentId)
        .populate('user')
        .populate('player');

    if (!payment) {
        return next(new ErrorHandler('Payment record not found', 404));
    }

    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    );

    if (!isValid) {
        payment.status = 'failed';
        await payment.save();
        return next(new ErrorHandler('Invalid payment signature', 400));
    }

    // Update payment
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'paid';
    payment.paidAt = Date.now();

    // Get payment details from Razorpay
    const paymentDetails = await razorpayService.getPaymentDetails(razorpayPaymentId);
    payment.paymentMethod = paymentDetails.method;
    
    await payment.save();

    // Update player registration status
    const player = await Player.findById(payment.player._id);
    player.registrationStatus = 'registered';
    await player.save();

    // Generate invoice
    const invoice = await invoiceService.generateInvoice(
        payment,
        payment.user,
        payment.player
    );
    
    payment.invoiceGenerated = true;
    payment.invoiceUrl = invoice.invoiceUrl;
    await payment.save();

    // Send notifications
    await notificationService.sendPaymentSuccess(payment.user, payment);
    await notificationService.sendRegistrationSuccess(
        payment.user,
        payment.player,
        payment
    );

    res.status(200).json({
        success: true,
        message: 'Payment verified and registration completed',
        payment: {
            id: payment._id,
            amount: payment.amount,
            razorpayPaymentId,
            status: payment.status,
            paidAt: payment.paidAt
        },
        invoice: invoice
    });
});

// Get payment status
export const getPaymentStatus = catchAsyncErrors(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id)
        .populate('player', 'fullName registrationStatus');

    if (!payment) {
        return next(new ErrorHandler('Payment not found', 404));
    }

    // Check if payment belongs to user
    if (payment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorHandler('Not authorized to view this payment', 403));
    }

    res.status(200).json({
        success: true,
        payment
    });
});

// Get user's payment history
export const getUserPayments = catchAsyncErrors(async (req, res, next) => {
    const payments = await Payment.find({ user: req.user.id })
        .populate('player', 'fullName playerRole')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: payments.length,
        payments
    });
});

// Admin: Get all payments
export const getAllPayments = catchAsyncErrors(async (req, res, next) => {
    const payments = await Payment.find()
        .populate('user', 'name email')
        .populate('player', 'fullName')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: payments.length,
        payments
    });
});

// Process refund (admin only)
export const processRefund = catchAsyncErrors(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        return next(new ErrorHandler('Payment not found', 404));
    }

    if (payment.status !== 'paid') {
        return next(new ErrorHandler('Only paid payments can be refunded', 400));
    }

    // Process refund through Razorpay
    const refund = await razorpayService.refundPayment(
        payment.razorpayPaymentId,
        req.body.amount // Optional partial refund amount
    );

    // Update payment status
    payment.status = 'refunded';
    await payment.save();

    // Update player status
    const player = await Player.findById(payment.player);
    player.registrationStatus = 'cancelled';
    await player.save();

    res.status(200).json({
        success: true,
        message: 'Refund processed successfully',
        refund
    });
});