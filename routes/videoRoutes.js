import express from "express";
import {
  addVideo,
  getAllVideos,
  deleteVideo,
} from "../controllers/videoController.js";

const router = express.Router();

router.post("/add", addVideo);
router.get("/all", getAllVideos);
router.delete("/delete/:id", deleteVideo);

export default router;