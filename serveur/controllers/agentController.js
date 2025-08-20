const db = require("../db");

// 🔹 Obtenir tous les agents
exports.getAllAgents = async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users");
    res.json(users);
  } catch (err) {
    console.error("Erreur getAllAgents:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Créer un utilisateur (agent)
exports.createAgent = async (req, res) => {
  const { prenom, nom, email, numero_tel, password } = req.body;

  try {
    const initiales = prenom[0].toUpperCase() + nom[0].toUpperCase();
    const annee = new Date().getFullYear();

    function genererChiffresAleatoires(longueur = 5) {
      return Array.from({ length: longueur }, () => Math.floor(Math.random() * 10)).join('');
    }

    let identifiant;
    let existe = true;

    do {
      const chiffres = genererChiffresAleatoires(5);
      identifiant = `${initiales}${annee}${chiffres}`;
      const [rows] = await db.query("SELECT id FROM users WHERE identifiant_agent = ?", [identifiant]);
      existe = rows.length > 0;
    } while (existe);

    const numeroTelFormate = numero_tel.startsWith('+') ? numero_tel : `+1${numero_tel}`;

    const [result] = await db.query(
      `INSERT INTO users (prenom, nom, email, numero_tel, password, role, approuve, identifiant_agent)
       VALUES (?, ?, ?, ?, ?, 'agent', 1, ?)`,
      [prenom, nom, email, numeroTelFormate, password, identifiant]
    );

    res.status(201).json({
      message: "Agent créé",
      id: result.insertId,
      identifiant
    });
  } catch (err) {
    console.error("Erreur createAgent:", err);
    res.status(500).json({ message: "Erreur lors de l'ajout" });
  }
};

// 🔹 Modifier un utilisateur
exports.updateAgent = async (req, res) => {
  const id = req.params.id;
  const { prenom, nom, email, numero_tel, password } = req.body;
  try {
    if (password && password !== "") {
      await db.query(
        `UPDATE users SET prenom = ?, nom = ?, email = ?, numero_tel = ?, password = ? WHERE id = ?`,
        [prenom, nom, email, numero_tel, password, id]
      );
    } else {
      await db.query(
        `UPDATE users SET prenom = ?, nom = ?, email = ?, numero_tel = ? WHERE id = ?`,
        [prenom, nom, email, numero_tel, id]
      );
    }
    res.json({ message: "Utilisateur mis à jour" });
  } catch (err) {
    console.error("Erreur updateAgent:", err);
    res.status(500).json({ message: "Erreur mise à jour" });
  }
};

// 🔹 Supprimer un utilisateur
exports.deleteAgent = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    console.error("Erreur deleteAgent:", err);
    res.status(500).json({ message: "Erreur suppression" });
  }
};

// 🔹 Obtenir un agent par son ID
exports.getAgentById = async (req, res) => {
  const { id } = req.params;
  console.log("✅ Reçu GET /agents/:id avec id =", id);
  try {
    const [rows] = await db.query(
      `SELECT id, prenom, nom, email, numero_tel, identifiant_agent FROM users WHERE id = ?`,
      [id]
    );
    console.log("📝 Résultat SQL pour GET /agents/:id =", rows);
    if (rows.length === 0) return res.status(404).json({ message: "Agent introuvable" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur getAgentById:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
