// routes/upload.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db");

// Configuration de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos"); // Assure-toi que ce dossier existe
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `video_${Date.now()}${ext}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

// Route POST pour upload vidéo
router.post("/upload-video/:moduleId", upload.single("video"), async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const videoPath = `/uploads/videos/${req.file.filename}`;
    
    await db.query("UPDATE modules SET video_url = ? WHERE id = ?", [videoPath, moduleId]);
    res.json({ message: "Vidéo ajoutée", path: videoPath });
  } catch (err) {
    console.error("❌ Erreur upload vidéo :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
