import {
  createVideoService,
  getAllVideosService,
  deleteVideoService,
} from "../services/videoService.js";

import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

/* =========================================================
   FIRST: Define the helper function
========================================================= */
/* =========================================================
   UNIVERSAL VIDEO EXTRACTOR (Move this to the TOP)
========================================================= */
function extractVideoData(url) {
  console.log("\n========== EXTRACTING VIDEO DATA ==========");
  console.log("Input URL:", url);
  
  if (!url || typeof url !== "string") {
    console.log("❌ Invalid URL: not a string or empty");
    return null;
  }

  try {
    // Clean the URL but keep parameters for YouTube
    console.log("📝 Parsing URL...");
    const parsedUrl = new URL(url);
    console.log("  → Hostname:", parsedUrl.hostname);
    console.log("  → Pathname:", parsedUrl.pathname);
    console.log("  → Search params:", Object.fromEntries(parsedUrl.searchParams));
    
    const host = parsedUrl.hostname.replace("www.", "").toLowerCase();
    console.log("  → Clean host:", host);

    /* ================= YOUTUBE ================= */
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      console.log("🎬 Platform: YOUTUBE detected");
      let videoId = null;
      let methodUsed = "";

      // Method 1: youtu.be/ID
      if (host === "youtu.be") {
        console.log("  Checking Method 1 (youtu.be)...");
        videoId = parsedUrl.pathname.slice(1);
        if (videoId) {
          methodUsed = "youtu.be";
          console.log("    ✅ Found via youtu.be:", videoId);
        }
      }
      
      // Method 2: watch?v=ID
      if (!videoId && parsedUrl.searchParams.get("v")) {
        console.log("  Checking Method 2 (watch?v=)...");
        videoId = parsedUrl.searchParams.get("v");
        if (videoId) {
          methodUsed = "watch?v=";
          console.log("    ✅ Found via watch parameter:", videoId);
        }
      }

      // Method 3: /live/VIDEO_ID
      if (!videoId && parsedUrl.pathname.includes("/live/")) {
        console.log("  Checking Method 3 (/live/VIDEO_ID)...");
        const liveMatch = parsedUrl.pathname.match(/\/live\/([^/?&]+)/);
        if (liveMatch && liveMatch[1]) {
          videoId = liveMatch[1];
          methodUsed = "/live/ regex";
          console.log("    ✅ Regex matched. Capture group 1:", liveMatch[1]);
        }
      }

      // Method 4: /shorts/ID
      if (!videoId && parsedUrl.pathname.includes("/shorts/")) {
        console.log("  Checking Method 4 (/shorts/ID)...");
        const shortsMatch = parsedUrl.pathname.match(/\/shorts\/([^/?&]+)/);
        if (shortsMatch && shortsMatch[1]) {
          videoId = shortsMatch[1];
          methodUsed = "/shorts/";
          console.log("    ✅ Found via shorts:", videoId);
        }
      }

      // Method 5: /embed/ID
      if (!videoId && parsedUrl.pathname.includes("/embed/")) {
        console.log("  Checking Method 5 (/embed/ID)...");
        const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?&]+)/);
        if (embedMatch && embedMatch[1]) {
          videoId = embedMatch[1];
          methodUsed = "/embed/";
          console.log("    ✅ Found via embed:", videoId);
        }
      }

      // Method 6: /v/ID
      if (!videoId && parsedUrl.pathname.includes("/v/")) {
        console.log("  Checking Method 6 (/v/ID)...");
        const vMatch = parsedUrl.pathname.match(/\/v\/([^/?&]+)/);
        if (vMatch && vMatch[1]) {
          videoId = vMatch[1];
          methodUsed = "/v/";
          console.log("    ✅ Found via /v/:", videoId);
        }
      }

      if (!videoId) {
        console.log("❌ Could not extract video ID");
        return null;
      }

      console.log("✅ Video ID found using method:", methodUsed);
      
      // Clean video ID
      videoId = videoId.split("?")[0].split("&")[0].split("#")[0];
      
      const result = {
        platform: "youtube",
        videoId: videoId,
        type: parsedUrl.pathname.includes('/live/') ? 'live' : 'video',
        url: `https://www.youtube.com/watch?v=${videoId}`,
        originalUrl: url,
        extractionMethod: methodUsed
      };
      
      console.log("📤 YouTube result:", result);
      return result;
    }

    /* ================= INSTAGRAM ================= */
    if (host.includes("instagram.com")) {
      console.log("📷 Platform: INSTAGRAM detected");
      const pathParts = parsedUrl.pathname.split('/').filter(p => p);
      
      const validTypes = ['p', 'reel', 'tv', 'reels', 'stories'];
      let postId = null;
      let contentType = 'post';
      
      for (let i = 0; i < pathParts.length; i++) {
        if (validTypes.includes(pathParts[i]) && i + 1 < pathParts.length) {
          postId = pathParts[i + 1];
          contentType = pathParts[i];
          console.log(`  ✅ Found ${contentType} with ID:`, postId);
          break;
        }
      }
      
      if (!postId) {
        console.log("❌ No Instagram post ID found");
        return null;
      }

      return {
        platform: "instagram",
        videoId: postId,
        type: contentType,
        url: `https://www.instagram.com/${contentType}/${postId}/`
      };
    }

    /* ================= FACEBOOK ================= */
    if (host.includes("facebook.com") || host.includes("fb.watch")) {
      console.log("👥 Platform: FACEBOOK detected");
      let videoId = null;
      let videoType = 'video';

      if (host === "fb.watch") {
        videoId = parsedUrl.pathname.slice(1);
        return {
          platform: "facebook",
          videoId: videoId,
          type: 'shortlink',
          url: url
        };
      }

      const pathParts = parsedUrl.pathname.split('/').filter(p => p);
      
      // Facebook watch
      if (pathParts[0] === 'watch' && parsedUrl.searchParams.get('v')) {
        videoId = parsedUrl.searchParams.get('v');
        videoType = 'watch';
        console.log("  ✅ Found watch video ID:", videoId);
      }
      
      // Facebook videos
      if (!videoId && pathParts.includes('videos')) {
        const videosIndex = pathParts.indexOf('videos');
        if (videosIndex !== -1 && videosIndex + 1 < pathParts.length) {
          videoId = pathParts[videosIndex + 1];
          videoType = 'video';
          console.log("  ✅ Found video ID:", videoId);
        }
      }
      
      // Facebook reels
      if (!videoId && pathParts.includes('reel')) {
        const reelIndex = pathParts.indexOf('reel');
        if (reelIndex !== -1 && reelIndex + 1 < pathParts.length) {
          videoId = pathParts[reelIndex + 1];
          videoType = 'reel';
          console.log("  ✅ Found reel ID:", videoId);
        }
      }

      if (!videoId) {
        console.log("❌ No Facebook video ID found");
        return null;
      }

      return {
        platform: "facebook",
        videoId: videoId,
        type: videoType,
        url: url.split('?')[0]
      };
    }

    console.log("❌ Unsupported platform:", host);
    return null;
  } catch (err) {
    console.error("❌ Error parsing URL:", err);
    return null;
  }
}

/* =========================================================
   THEN: Define your controllers (AFTER the helper function)
========================================================= */

/* =========================================================
   ➜ Add Video (Admin Only)
========================================================= */
export const addVideo = catchAsyncErrors(async (req, res, next) => {
  console.log("📥 Received request body:", req.body); // Debug log

  const {
    title,
    description,
    videoUrl,
    category,
    match,
    teams,
    season,
    isFeatured,
  } = req.body;

  // Basic validation
  if (!title || !videoUrl) {
    return next(new ErrorHandler("Title and Video URL are required", 400));
  }

  console.log("🔍 Extracting video data from URL:", videoUrl);
  
  // Extract video data
  const videoData = extractVideoData(videoUrl);

  if (!videoData) {
    console.log("❌ Failed to extract video data from URL:", videoUrl);
    return next(new ErrorHandler("Invalid Video URL. Please provide a valid YouTube, Instagram, or Facebook link", 400));
  }

  console.log("✅ Video data extracted successfully:", videoData);

  // Create video in database
  const video = await createVideoService({
    title,
    description: description || "",
    videoUrl,
    platform: videoData.platform,
    videoId: videoData.videoId,
    category: category || "Highlights",
    match,
    teams,
    season: season || "DPL 2026",
    isFeatured: isFeatured || false,
    uploadedBy: req.user?.id,
  });

  console.log("✅ Video created successfully:", video);

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

// Remove the test code at the bottom - it should only run in development
if (process.env.NODE_ENV === 'development') {
  console.log("\n🔍 TESTING VIDEO EXTRACTOR IN DEVELOPMENT MODE:");
  const testUrl = "https://www.youtube.com/live/ITXd2anufsw?si=sT7I3bxmojDCm_us";
  const result = extractVideoData(testUrl);
  console.log("Test result:", result);
}