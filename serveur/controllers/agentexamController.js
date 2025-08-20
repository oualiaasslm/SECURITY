const db = require("../db");

// Obtenir tous les examens avec leurs modules (si module_id existe encore)
exports.getAllExams = async (req, res) => {
  try {
    console.log("📥 Requête reçue pour GET /api/exams");
    const [rows] = await db.query(`
      SELECT e.*, m.titre AS module_titre
      FROM exams e
      LEFT JOIN modules m ON e.module_id = m.id
    `);
    console.log("📤 Résultat envoyé :", rows);
    res.json(rows);
  } catch (err) {
    console.error("❌ Erreur getAllExams:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Ajouter un nouvel examen
exports.createExam = async (req, res) => {
  const { titre, cours_id, fichier_url } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO exams (titre, cours_id, fichier_url) VALUES (?, ?, ?)`,
      [titre, cours_id, fichier_url]
    );
    res.status(201).json({ id: result.insertId, titre, cours_id, fichier_url });
  } catch (err) {
    console.error("❌ Erreur createExam:", err);
    res.status(500).json({ message: "Erreur lors de l'ajout" });
  }
};

// Modifier un examen
exports.updateExam = async (req, res) => {
  const { id } = req.params;
  const { titre, cours_id, fichier_url } = req.body;
  try {
    await db.query(
      `UPDATE exams SET titre = ?, cours_id = ?, fichier_url = ? WHERE id = ?`,
      [titre, cours_id, fichier_url, id]
    );
    res.json({ message: "Examen mis à jour" });
  } catch (err) {
    console.error("❌ Erreur updateExam:", err);
    res.status(500).json({ message: "Erreur mise à jour" });
  }
};

// Supprimer un examen
exports.deleteExam = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM exams WHERE id = ?`, [id]);
    res.json({ message: "Examen supprimé" });
  } catch (err) {
    console.error("❌ Erreur deleteExam:", err);
    res.status(500).json({ message: "Erreur suppression" });
  }
};

// Obtenir l'examen d'un cours spécifique
exports.getExamByCoursId = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM exams WHERE cours_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Aucun examen trouvé pour ce cours." });
    }

    res.json(rows[0]); // on retourne le premier trouvé
  } catch (err) {
    console.error("❌ Erreur getExamByCoursId:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
