import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    youtubeUrl: {
      type: String,
      required: true,
    },

    youtubeId: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      default: function () {
        return `https://img.youtube.com/vi/${this.youtubeId}/mqdefault.jpg`;
      },
    },

    category: {
      type: String,
      enum: [
        "Highlights",
        "Full Match",
        "Live",
        "Interviews",
        "Press Conference",
        "Behind The Scenes",
        "Practice Nets",
        "Trailer",
      ],
      default: "Highlights",
    },

    // 🔥 NEW – Connect video to match
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
    },

    // 🔥 NEW – Connect video to teams
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],

    season: {
      type: String, // Example: "DPL 2026"
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);