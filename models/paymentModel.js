import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Linked AFTER payment
    player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        default: null
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

    razorpaySignature: String,

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

    paymentMethod: String,

    description: {
        type: String,
        default: 'Cricket Match Registration Fee'
    },

    // ⭐ Store full form here
    metadata: {
        formData: Object
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

export default mongoose.model('Payment', paymentSchema);