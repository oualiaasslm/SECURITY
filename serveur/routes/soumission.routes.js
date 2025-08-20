// 📁 routes/soumission.routes.js
const express = require("express");
const router = express.Router();
const soumissionController = require("../controllers/soumissionController");

// 📥 GET : Récupérer la soumission du cours
router.get("/cours/:id", soumissionController.getSoumissionByCoursId);

// 📤 POST : Créer une soumission (upload)
router.post(
  "/",
  soumissionController.upload.single("fichier"),
  soumissionController.createSoumission
);

module.exports = router;
