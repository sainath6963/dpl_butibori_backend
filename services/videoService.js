import Video from "../models/videoModel.js";

export const createVideoService = async (data) => {
  try {
    console.log("📦 createVideoService received:", JSON.stringify(data, null, 2));

    let thumbnail = null;

    if (data.platform === "youtube") {
      thumbnail = `https://img.youtube.com/vi/${data.videoId}/hqdefault.jpg`;
    }

    const videoData = {
      title: data.title,
      description: data.description || "",
      videoUrl: data.videoUrl,
      platform: data.platform,

      // ⭐ FIXED FIELD NAME
      videoId: data.videoId,

      thumbnail,
      category: data.category || "Highlights",
      match: data.match || null,
      teams: data.teams || null,
      season: data.season || "DPL 2026",
      isFeatured: data.isFeatured || false,
      uploadedBy: data.uploadedBy,
      isPublished: true,
      uploadDate: new Date(),
    };

    console.log("📦 Saving to database:", JSON.stringify(videoData, null, 2));

    const video = await Video.create(videoData);

    console.log("✅ Video created in database:", video._id);

    return video;
  } catch (error) {
    console.error("❌ Error in createVideoService:", error);
    throw error;
  }
};

export const getAllVideosService = async (filters = {}) => {
  try {
    console.log("🔍 Fetching videos with filters:", filters);

    const query = { isPublished: true, ...filters };

    // ✅ newest videos first
    const videos = await Video.find(query)
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${videos.length} videos`);

    return videos;
  } catch (error) {
    console.error("❌ Error in getAllVideosService:", error);
    throw error;
  }
};

export const deleteVideoService = async (id) => {
  try {
    console.log("🗑️ Deleting video with ID:", id);
    
    const video = await Video.findByIdAndDelete(id);
    
    if (video) {
      console.log("✅ Video deleted:", video._id);
    } else {
      console.log("❌ Video not found with ID:", id);
    }
    
    return video;
  } catch (error) {
    console.error("❌ Error in deleteVideoService:", error);
    throw error;
  }
};