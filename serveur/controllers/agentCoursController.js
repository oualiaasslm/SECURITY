// ✅ controllers/coursController.js
const db = require("../db");

// Obtenir tous les cours
exports.getAllCours = async (req, res) => {
  try {
    const [cours] = await db.query("SELECT * FROM courses");
    res.json(cours);
  } catch (err) {
    console.error("Erreur getAllCours:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Ajouter un cours
exports.createCours = async (req, res) => {
  const { titre, description, introduction, conclusion, video_url } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO courses (titre, description, introduction, conclusion, video_url)
       VALUES (?, ?, ?, ?, ?)`,
      [titre, description, introduction, conclusion, video_url]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    console.error("Erreur createCours:", err);
    res.status(500).json({ message: "Erreur création" });
  }
};

// Modifier un cours
exports.updateCours = async (req, res) => {
  const id = req.params.id;
  const { titre, description, introduction, conclusion, video_url } = req.body;
  try {
    await db.query(
      `UPDATE courses SET titre = ?, description = ?, introduction = ?, conclusion = ?, video_url = ?
       WHERE id = ?`,
      [titre, description, introduction, conclusion, video_url, id]
    );
    res.json({ message: "Cours mis à jour" });
  } catch (err) {
    console.error("Erreur updateCours:", err);
    res.status(500).json({ message: "Erreur modification" });
  }
};

// Supprimer un cours
exports.deleteCours = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM courses WHERE id = ?", [id]);
    res.json({ message: "Cours supprimé" });
  } catch (err) {
    console.error("Erreur deleteCours:", err);
    res.status(500).json({ message: "Erreur suppression" });
  }
};

// Obtenir tous les cours avec modules + évaluations (pour /agent/cours)
exports.getCoursAvecModulesEtEvaluation = async (req, res) => {
  try {
    const [cours] = await db.query(`
      SELECT c.*,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', m.id, 'titre', m.titre, 'description', m.description))
         FROM modules m WHERE m.cours_id = c.id) AS modules,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', e.id, 'prenom', e.prenom, 'nom', e.nom, 'note', e.note, 'commentaire', e.commentaire))
         FROM evaluations e WHERE e.cours_id = c.id) AS evaluations
      FROM courses c
    `);

    const coursAvecDetails = cours.map((c) => ({
      ...c,
      modules: JSON.parse(c.modules || "[]"),
      evaluations: JSON.parse(c.evaluations || "[]")
    }));

    res.json(coursAvecDetails);
  } catch (err) {
    console.error("Erreur getCoursAvecModulesEtEvaluation:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Ajouter une évaluation (pour /agent/evaluer)
exports.evaluerCours = async (req, res) => {
  const { cours_id, prenom, nom, note, commentaire } = req.body;
  try {
    await db.query(
      `INSERT INTO evaluations (cours_id, prenom, nom, note, commentaire)
       VALUES (?, ?, ?, ?, ?)`,
      [cours_id, prenom, nom, note, commentaire]
    );
    res.json({ message: "Évaluation enregistrée" });
  } catch (err) {
    console.error("Erreur evaluerCours:", err);
    res.status(500).json({ message: "Erreur enregistrement" });
  }
};

// Obtenir tous les cours avec leurs examens associés
exports.getCoursAvecExams = async (req, res) => {
  try {
    const [cours] = await db.query("SELECT * FROM courses");

    const coursIds = cours.map(c => c.id);
    const [exams] = await db.query(
      "SELECT * FROM exams WHERE cours_id IN (?)", // ✅ ici la correction !
      [coursIds]
    );

    const examsParCours = {};
    exams.forEach((exam) => {
      if (!examsParCours[exam.cours_id]) {
        examsParCours[exam.cours_id] = [];
      }
      examsParCours[exam.cours_id].push(exam);
    });

    const resultat = cours.map((c) => ({
      ...c,
      exams: examsParCours[c.id] || []
    }));

    res.json(resultat);
  } catch (err) {
    console.error("Erreur getCoursAvecExams:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
  
// ✅ Obtenir un cours par ID
exports.getCoursById = async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query("SELECT * FROM courses WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur getCoursById:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
