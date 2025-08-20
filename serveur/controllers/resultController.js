const db = require('../db');

// ✅ GET : toutes les soumissions avec jointures
exports.getAllResults = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        s.id,
        s.note,
        s.statutSoumission AS status,
        s.statutEvaluation,
        s.fichier_url,
        u.nom AS user_nom,
        e.titre AS exam_titre
      FROM soumissions s
      JOIN users u ON s.agent_id = u.id
      JOIN exams e ON s.exam_id = e.id
      ORDER BY s.date_soumission DESC
    `);
    res.json(results);
  } catch (err) {
    console.error("Erreur getAllResults:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ PUT : mise à jour de la note + statutSoumission + statutEvaluation
exports.updateResult = async (req, res) => {
  const { id } = req.params;
  const { note, status } = req.body;

  try {
    await db.query(
      `UPDATE soumissions 
       SET note = ?, statutSoumission = ?, statutEvaluation = 'corrigé' 
       WHERE id = ?`,
      [note, status, id]
    );

    res.json({ message: "Note mise à jour avec succès" });
  } catch (err) {
    console.error("Erreur updateResult:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

