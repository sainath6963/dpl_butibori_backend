import Payment from '../models/paymentModel.js';
import Player from '../models/playerModel.js';
import User from '../models/userModel.js';
import razorpayService from '../services/razorpayService.js';
import invoiceService from '../services/invoiceService.js';
import notificationService from '../services/notifyUsers.js';
import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// Registration fee amount (in INR)
const REGISTRATION_FEE = 503; // Change as needed

// Create payment order
export const createPaymentOrder = catchAsyncErrors(async (req, res, next) => {

    console.log("📥 Registration Form Data:", req.body);

    const receipt = `rcpt_${Date.now()}`;

    const order = await razorpayService.createOrder(
        REGISTRATION_FEE,
        "INR",
        receipt
    );

    // Store form data temporarily
    const payment = await Payment.create({
        razorpayOrderId: order.id,
        amount: REGISTRATION_FEE,
        currency: "INR",
        status: "created",
        metadata: {
            formData: req.body   // ⭐ STORE COMPLETE FORM
        }
    });

    res.status(200).json({
        success: true,
        order,
        paymentId: payment._id,
        key: process.env.RAZORPAY_KEY_ID
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
 // Find payment
const payment = await Payment.findById(paymentId)
  .populate('player');

if (!payment) {
    return next(new ErrorHandler('Payment record not found', 404));
}

// 🔥 ADD THIS CHECK
if (payment.status === "paid") {
    return next(new ErrorHandler('Payment already verified', 400));
}

    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    );

    if (!isValid) {
        payment.status = 'failed';
payment.paymentResult = 'failed';
        await payment.save();
        return next(new ErrorHandler('Invalid payment signature', 400));
    }

    // Update payment
   // Get payment details from Razorpay
const paymentDetails = await razorpayService.getPaymentDetails(razorpayPaymentId);

//  ADD THIS CHECK (VERY IMPORTANT)
if (paymentDetails.status !== "captured") {
   payment.status = "failed";
payment.paymentResult = "failed";
    await payment.save();
    return next(new ErrorHandler("Payment not captured", 400));
}

// Update payment AFTER capture confirmation
payment.razorpayPaymentId = razorpayPaymentId;
payment.razorpaySignature = razorpaySignature;
payment.status = 'paid';
payment.paymentResult = 'success';
payment.paidAt = Date.now();
payment.paymentMethod = paymentDetails.method;

await payment.save();
// 🚨 ADD THIS BLOCK HERE (VERY IMPORTANT)
if (payment.status !== "paid") {
    console.log("❌ Payment not paid — skipping player creation");
    return next(new ErrorHandler("Payment not completed", 400));
}

// 🚨 ALSO ADD DUPLICATE CHECK
if (payment.player) {
    console.log("⚠️ Player already exists for this payment");
    return res.status(200).json({
        success: true,
        message: "Player already created"
    });
}
// ================= CREATE PLAYER AFTER PAYMENT =================

const formData = payment.metadata.formData;

const convertBool = (val) => val === "true" || val === true;

let parsedTournaments = [];
let parsedMOM = [];
let parsedMOS = [];

try {
    parsedTournaments = formData.tournaments
        ? JSON.parse(formData.tournaments)
        : [];

    parsedMOM = formData.manOfTheMatchDetails
        ? JSON.parse(formData.manOfTheMatchDetails)
        : [];

    parsedMOS = formData.manOfTheSeriesDetails
        ? JSON.parse(formData.manOfTheSeriesDetails)
        : [];
} catch (err) {
    console.log("JSON Parse Error:", err.message);
}

const player = await Player.create({
    fullName: formData.fullName,
    email: formData.email,
    address: formData.address,
    mobileNumber: formData.mobileNumber,
    height: formData.height,
    weight: formData.weight,
    aadharNumber: formData.aadharNumber,
    dateOfBirth: formData.dateOfBirth,

    isBatsman: convertBool(formData.isBatsman),
    isBowler: convertBool(formData.isBowler),
    battingHand: formData.battingHand || undefined,
    bowlingArm: formData.bowlingArm || undefined,
    bowlingType: formData.bowlingType || undefined,
    isWicketKeeper: convertBool(formData.isWicketKeeper),

    playedTournament: convertBool(formData.playedTournament),
    tournaments: parsedTournaments,

    manOfTheMatch: convertBool(formData.manOfTheMatch),
    manOfTheMatchDetails: parsedMOM,

    manOfTheSeries: convertBool(formData.manOfTheSeries),
    manOfTheSeriesDetails: parsedMOS,

    documents: {
        playerPhoto: null,
        aadharCard: null,
        panCard: null,
        drivingLicense: null
    },

    registrationStatus: "registered",
    payment: payment._id
});

// Link player to payment
payment.player = player._id;
await payment.save();

    // Generate invoice
   const invoice = await invoiceService.generateInvoice(
    payment,
    null,
    player
);
    
    payment.invoiceGenerated = true;
    payment.invoiceUrl = invoice.invoiceUrl;
    await payment.save();

    // Send notifications
    await notificationService.sendPaymentSuccess(null, payment);

await notificationService.sendRegistrationSuccess(
    null,
    player,
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

// ================= UPDATE PAYMENT STATUS (for cancellations) =================
export const updatePaymentStatus = catchAsyncErrors(async (req, res, next) => {
  const { paymentId } = req.params;
  const { status } = req.body;


  console.log("🔍 Looking for payment with ID:", paymentId); 

  // Validate status
  const validStatuses = ['created', 'attempted', 'paid', 'failed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler('Invalid status value', 400));
  }

  const payment = await Payment.findById(paymentId);
  
  if (!payment) {
    return next(new ErrorHandler('Payment not found', 404));
  }

  // Only allow updating if status is still 'created'
  if (payment.status !== 'created') {
    return next(new ErrorHandler(`Cannot update payment status from ${payment.status} to ${status}`, 400));
  }

  payment.status = status; // 'cancelled' or 'failed'
  await payment.save();

  console.log(`✅ Payment ${paymentId} status updated to ${status}`);

  res.status(200).json({
    success: true,
    message: 'Payment status updated successfully',
    payment: {
      id: payment._id,
      status: payment.status
    }
  });
});