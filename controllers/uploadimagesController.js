import fs from "fs";
import path from "path";

export const uploadImageforSeasonOne = async (req, res) => {
  try {

    if (!req.files || (!req.files.image && !req.files.images)) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Get files (support single or multiple)
    let files = [];

    if (req.files.image) {
      files = [req.files.image]; // single file
    }

    if (req.files.images) {
      files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
    }

    // Validate image types
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    // Upload directory
    const uploadsDir = path.join(process.cwd(), "uploads/SeasonOne");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedImages = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed",
        });
      }

      const fileName = `${Date.now()}_${file.name}`;
      const uploadPath = path.join(uploadsDir, fileName);

      await file.mv(uploadPath);

      uploadedImages.push(`/uploads/SeasonOne/${fileName}`);
    }

    console.log("✅ Uploaded Images:", uploadedImages);

    res.status(200).json({
      success: true,
      message: "Image(s) uploaded successfully",
      images: uploadedImages,
    });

  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const uploadImageforSeasonTwo = async (req, res) => {
  try {

    if (!req.files || (!req.files.image && !req.files.images)) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Get files (support single or multiple)
    let files = [];

    if (req.files.image) {
      files = [req.files.image]; // single file
    }

    if (req.files.images) {
      files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
    }

    // Validate image types
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    // Upload directory
    const uploadsDir = path.join(process.cwd(), "uploads/SeasonTwo");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedImages = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed",
        });
      }

      const fileName = `${Date.now()}_${file.name}`;
      const uploadPath = path.join(uploadsDir, fileName);

      await file.mv(uploadPath);

      uploadedImages.push(`/uploads/SeasonTwo/${fileName}`);
    }

    console.log("✅ Uploaded Images:", uploadedImages);

    res.status(200).json({
      success: true,
      message: "Image(s) uploaded successfully",
      images: uploadedImages,
    });

  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};