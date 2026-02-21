import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
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

    matchName: {
      type: String,
    },

    uploadedBy: {
      type: String,
      default: "Admin",
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);