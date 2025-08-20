const db = require("../db");

// 🔹 Créer un message pour un agent
exports.createMessage = async (req, res) => {
  const { user_id, objet, contenu } = req.body;

  if (!user_id || !objet || !contenu) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  try {
    await db.query(
      "INSERT INTO messages (user_id, objet, contenu) VALUES (?, ?, ?)",
      [user_id, objet, contenu]
    );
    res.json({ message: "Message envoyé avec succès !" });
  } catch (error) {
    console.error("Erreur createMessage:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi du message." });
  }
};

// 🔹 Récupérer un message spécifique
exports.getMessageById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM messages WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Message introuvable." });
    res.json(rows[0]);
  } catch (error) {
    console.error("Erreur getMessageById:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Marquer un message comme lu
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE messages SET lu = true WHERE id = ?", [id]);
    res.json({ message: "Message marqué comme lu." });
  } catch (error) {
    console.error("Erreur markAsRead:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Récupérer tous les messages pour un agent donné
exports.getMessagesForAgent = async (req, res) => {
  const { user_id } = req.params;
  try {
    const [messages] = await db.query(
      `SELECT 
        id, 
        user_id, 
        objet, 
        contenu, 
        date_envoi AS date_creation,  -- renvoi sous le nom attendu par le front
        lu 
      FROM messages 
      WHERE user_id = ? 
      ORDER BY date_envoi DESC`,
      [user_id]
    );
    res.json(messages);
  } catch (error) {
    console.error("Erreur getMessagesForAgent:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
