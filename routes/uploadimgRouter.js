import express from "express";
import {
  getSeasonOneImages,
  getSeasonTwoImages,
  uploadImageforSeasonOne,
  uploadImageforSeasonTwo,
  deleteSeasonOneImage,
  deleteSeasonTwoImage
} from "../controllers/uploadimagesController.js";

const router = express.Router();

// Upload
router.post("/image/seasonone", uploadImageforSeasonOne);
router.post("/image/seasontwo", uploadImageforSeasonTwo);

// Get Images
router.get("/season-one-images", getSeasonOneImages);
router.get("/season-two-images", getSeasonTwoImages);

// ✅ Delete Image
router.delete("/image/seasonone/:imageName", deleteSeasonOneImage);
router.delete("/image/seasontwo/:imageName", deleteSeasonTwoImage);

export default router;