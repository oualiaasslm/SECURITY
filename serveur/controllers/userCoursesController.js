const db = require("../db");

// Ajoute un cours choisi par l'agent
exports.addUserCourse = async (req, res) => {
  const { user_id, course_id } = req.body;

  if (!user_id || !course_id) {
    return res.status(400).json({ message: "Champs manquants : user_id et course_id requis." });
  }

  try {
    // Vérifie s'il n'existe pas déjà pour éviter les doublons
    const [exists] = await db.query(
      "SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?",
      [user_id, course_id]
    );
    if (exists.length > 0) {
      return res.status(409).json({ message: "Vous avez déjà ajouté ce cours." });
    }

    // Ajoute dans la table user_courses
    await db.query(
      "INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)",
      [user_id, course_id]
    );
    res.status(201).json({ message: "Cours ajouté avec succès !" });
  } catch (err) {
    console.error("Erreur addUserCourse:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout du cours." });
  }
};
// Obtenir les cours choisis par un utilisateur
exports.getUserCourses = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.query(`
      SELECT c.id, c.titre, c.session
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      WHERE uc.user_id = ?
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error("Erreur getUserCourses:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
