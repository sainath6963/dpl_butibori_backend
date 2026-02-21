import mongoose from 'mongoose';



const tournamentSchema = new mongoose.Schema({
    tournament: String,
    year: Number,
    ballType: {
        type: String,
        enum: ["Tennis", "Leather"]
    }
}, { _id: false });

const playerSchema = new mongoose.Schema({

    // 🔗 User Reference
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // 📌 Basic Details
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true
    },

    address: {
        type: String,
        required: true
    },

    mobileNumber: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Invalid mobile number"]
    },

    height: Number,   // in cm
    weight: Number,   // in kg

    aadharNumber: {
        type: String,
        required: true,
        match: [/^[0-9]{12}$/, "Invalid Aadhar number"]
    },

    dateOfBirth: {
        type: Date,
        required: true
    },

    // 🏏 Playing Type
    isBatsman: {
        type: Boolean,
        default: false
    },

    isBowler: {
        type: Boolean,
        default: false
    },

    battingHand: {
        type: String,
        enum: ["Right Hand", "Left Hand"]
    },

    bowlingArm: {
        type: String,
        enum: ["Right Arm", "Left Arm"]
    },

    bowlingType: {
        type: String,
        enum: ["Pacer", "Spinner"]
    },

    isWicketKeeper: {
        type: Boolean,
        default: false
    },

    // 🏆 Tournament History
    playedTournament: {
        type: Boolean,
        default: false
    },

    tournaments: [tournamentSchema],

    // 🏅 Awards
    manOfTheMatch: {
        type: Boolean,
        default: false
    },

    manOfTheMatchDetails: [tournamentSchema],

    manOfTheSeries: {
        type: Boolean,
        default: false
    },

    manOfTheSeriesDetails: [tournamentSchema],

    // 📂 Documents (Local Upload)
    documents: {
        playerPhoto: String,
        aadharCard: String,
        panCard: String,
        drivingLicense: String
    },
payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
},

registrationStatus: {
    type: String,
    enum: ["pending", "payment-pending", "approved", "rejected"],
    default: "payment-pending"
},
jerseyNumber: {
    type: Number,
    unique: true,
    sparse: true
},
    createdAt: {
        type: Date,
        default: Date.now
    }

});



// Calculate age from date of birth
playerSchema.pre('save', function () {
    if (this.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        this.age = age;
    }
});

const Player = mongoose.model('Player', playerSchema);
export default Player;