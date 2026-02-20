import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: [true, 'Please enter full name'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please enter date of birth']
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    battingStyle: {
        type: String,
        enum: ['right-handed', 'left-handed'],
        required: true
    },
    bowlingStyle: {
        type: String,
        enum: ['right-arm-fast', 'right-arm-medium', 'left-arm-fast', 
               'left-arm-medium', 'spin', 'none'],
        default: 'none'
    },
    playerRole: {
        type: String,
        enum: ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'],
        required: true
    },
    previousExperience: {
        type: String,
        enum: ['professional', 'club-level', 'district-level', 'beginner'],
        required: true
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    registrationStatus: {
        type: String,
        enum: ['pending', 'payment-pending', 'registered', 'cancelled'],
        default: 'pending'
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    matchAssigned: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match'
    },
    jerseyNumber: {
        type: Number,
        unique: true,
        sparse: true
    },
    documents: {
        photo: String,
        idProof: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate age from date of birth
playerSchema.pre('save', function(next) {
    if (this.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        this.age = age;
    }
    next();
});

const Player = mongoose.model('Player', playerSchema);
export default Player;