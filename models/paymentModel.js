import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        unique: true,
        sparse: true
    },
    razorpaySignature: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'attempted', 'paid', 'failed', 'refunded'],
        default: 'created'
    },
    paymentMethod: {
        type: String
    },
    description: {
        type: String,
        default: 'Cricket Match Registration Fee'
    },
    metadata: {
        type: Map,
        of: String
    },
    invoiceGenerated: {
        type: Boolean,
        default: false
    },
    invoiceUrl: String,
    paidAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;