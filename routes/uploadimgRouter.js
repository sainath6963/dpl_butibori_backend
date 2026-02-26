import express from "express";
import { uploadImageforSeasonOne, uploadImageforSeasonTwo } from "../controllers/uploadimagesController.js";

const router = express.Router();

router.post("/image/seasonone", uploadImageforSeasonOne);
router.post("/image/seasontwo", uploadImageforSeasonTwo);

export default router;