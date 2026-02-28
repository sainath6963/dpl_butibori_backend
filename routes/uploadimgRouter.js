import express from "express";
import { getSeasonOneImages, getSeasonTwoImages, uploadImageforSeasonOne, uploadImageforSeasonTwo } from "../controllers/uploadimagesController.js";

const router = express.Router();

router.post("/image/seasonone", uploadImageforSeasonOne);
router.post("/image/seasontwo", uploadImageforSeasonTwo);
router.get("/season-one-images", getSeasonOneImages);
router.get("/season-two-images", getSeasonTwoImages);

export default router;