// controllers/moduleController.js
const db = require('../db');

// 📌 1. Obtenir tous les modules
exports.getAllModules = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM modules');
    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur getAllModules:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📌 2. Obtenir tous les modules avec leurs examens (jointure)
exports.getModulesAvecExams = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, e.id AS exam_id, e.titre AS exam_titre, e.fichier_url, e.module_id
      FROM modules m
      LEFT JOIN exams e ON e.module_id = m.id
    `);

    // Regrouper les examens sous chaque module
    const modulesMap = {};

    rows.forEach(row => {
      const moduleId = row.id;
      if (!modulesMap[moduleId]) {
        modulesMap[moduleId] = {
          id: moduleId,
          titre: row.titre,
          description: row.description,
          ordre: row.ordre,
          video_url: row.video_url,
          course_id: row.course_id,
          created_at: row.created_at,
          exams: []
        };
      }

      if (row.exam_id) {
        modulesMap[moduleId].exams.push({
          id: row.exam_id,
          titre: row.exam_titre,
          fichier_url: row.fichier_url,
          module_id: row.module_id
        });
      }
    });

    const result = Object.values(modulesMap);
    res.json(result);

  } catch (err) {
    console.error("❌ Erreur getModulesAvecExams:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 📌 3. Obtenir les modules liés à un cours spécifique (pour afficher dans la page du cours)
exports.getModulesByCoursId = async (req, res) => {
  const coursId = req.params.id;
  try {
    const [rows] = await db.query(
      "SELECT * FROM modules WHERE course_id = ? ORDER BY ordre ASC",
      [coursId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur getModulesByCoursId:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
