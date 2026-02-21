import {
  createVideoService,
  getAllVideosService,
  deleteVideoService,
} from "../services/videoService.js";

import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

/* =========================================================
   ➜ Add Video (Admin Only)
========================================================= */
export const addVideo = catchAsyncErrors(async (req, res, next) => {
  const {
    title,
    description,
    youtubeUrl,
    category,
    match,
    teams,
    season,
    isFeatured,
  } = req.body;

  if (!title || !youtubeUrl) {
    return next(new ErrorHandler("Title and YouTube URL are required", 400));
  }

  // Extract youtubeId automatically
  const youtubeId = extractYoutubeId(youtubeUrl);

  if (!youtubeId) {
    return next(new ErrorHandler("Invalid YouTube URL", 400));
  }

  const video = await createVideoService({
    title,
    description,
    youtubeUrl,
    youtubeId,
    category,
    match,
    teams,
    season,
    isFeatured,
    uploadedBy: req.user?.id,
  });

  res.status(201).json({
    success: true,
    message: "Video added successfully",
    video,
  });
});

/* =========================================================
   ➜ Get All Videos (With Filters)
========================================================= */
export const getAllVideos = catchAsyncErrors(async (req, res, next) => {
  const { category, team, match, featured } = req.query;

  const filters = {};

  if (category) filters.category = category;
  if (match) filters.match = match;
  if (featured) filters.isFeatured = featured === "true";

  if (team) {
    filters.teams = team;
  }

  const videos = await getAllVideosService(filters);

  res.status(200).json({
    success: true,
    count: videos.length,
    videos,
  });
});

/* =========================================================
   ➜ Delete Video (Admin Only)
========================================================= */
export const deleteVideo = catchAsyncErrors(async (req, res, next) => {
  const video = await deleteVideoService(req.params.id);

  if (!video) {
    return next(new ErrorHandler("Video not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Video deleted successfully",
  });
});

/* =========================================================
    Helper: Extract YouTube ID
========================================================= */
function extractYoutubeId(url) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;

  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}