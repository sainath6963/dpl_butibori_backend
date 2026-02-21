import {
  createVideoService,
  getAllVideosService,
  deleteVideoService,
} from "../services/videoService.js";

// ➜ Add Video
export const addVideo = async (req, res) => {
  try {
    const video = await createVideoService(req.body);

    res.status(201).json({
      success: true,
      video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ➜ Get All Videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await getAllVideosService();

    res.json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ➜ Delete
export const deleteVideo = async (req, res) => {
  await deleteVideoService(req.params.id);

  res.json({
    success: true,
    message: "Video deleted",
  });
};