// 📁 controllers/soumissionController.js
const db = require("../db");
const multer = require("multer");
const path = require("path");

// 📁 Configuration de Multer pour stocker les fichiers dans /uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
exports.upload = upload;

// ✅ GET : /api/soumissions/cours/:id?agent_id=xx → Récupérer la soumission de l’agent pour ce cours
exports.getSoumissionByCoursId = async (req, res) => {
  try {
    const coursId = req.params.id;
    const agentId = req.query.agent_id;

    if (!agentId) {
      return res.status(400).json({ message: "agent_id est requis dans la requête." });
    }
    console.log("🔍 GET soumission - cours:", coursId, "agent:", agentId);
    const [rows] = await db.query(
      "SELECT * FROM soumissions WHERE cours_id = ? AND agent_id = ?",
      [coursId, agentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Aucune soumission trouvée." });
    }

    res.json(rows[0]); // renvoie la soumission de cet agent pour ce cours
  } catch (err) {
    console.error("❌ Erreur dans getSoumissionByCoursId:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ✅ POST : /api/soumissions → Enregistrer une nouvelle soumission
exports.createSoumission = async (req, res) => {
  try {
    console.log("📥 Reçu (body):", req.body);
    console.log("📎 Reçu (file):", req.file);

    const { agent_id, cours_id, exam_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier reçu." });
    }

    const fichier_url = "/uploads/" + req.file.filename;

    // Optionnel : empêcher les doublons (1 soumission max par agent pour ce cours)
    const [existing] = await db.query(
      "SELECT * FROM soumissions WHERE agent_id = ? AND cours_id = ?",
      [agent_id, cours_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Vous avez déjà soumis ce travail." });
    }

    const [result] = await db.query(
      `INSERT INTO soumissions 
        (agent_id, cours_id, exam_id, fichier_url, statutSoumission, statutEvaluation, date_soumission)
       VALUES (?, ?, ?, ?, 'Soumis', 'En attente', NOW())`,
      [agent_id, cours_id, exam_id, fichier_url]
    );

    res.status(201).json({
      message: "Soumission enregistrée",
      soumissionId: result.insertId,
      fichier_url
    });
  } catch (err) {
    console.error("❌ Erreur dans createSoumission:", err);
    res.status(500).json({ message: "Erreur lors de la soumission." });
  }
};
