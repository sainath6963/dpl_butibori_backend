import Video from "../models/videoModel.js";
import { extractYouTubeId } from "../utils/extractYoutubeId.js";

export const createVideoService = async (data) => {
  const youtubeId = extractYouTubeId(data.youtubeUrl);

  if (!youtubeId) {
    throw new Error("Invalid YouTube URL");
  }

  const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

  const video = await Video.create({
    ...data,
    youtubeId,
    thumbnail,
  });

  return video;
};

export const getAllVideosService = async () => {
  return await Video.find({ isPublished: true }).sort({
    uploadDate: -1,
  });
};

export const deleteVideoService = async (id) => {
  return await Video.findByIdAndDelete(id);
};