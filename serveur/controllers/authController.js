const db = require('../db');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.login = async (req, res) => {
  const { identifiant, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE identifiant_agent = ?', [identifiant]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const user = rows[0];

    if (password !== user.password) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        identifiant: user.identifiant_agent
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      identifiant: user.identifiant_agent
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.demandeInscription = async (req, res) => {
  const { prenom, nom, email, password, numero_tel } = req.body;

  try {
    await db.query(
      `INSERT INTO pending_registrations (prenom, nom, email, password, numero_tel)
       VALUES (?, ?, ?, ?, ?)`,
      [prenom, nom, email, password, numero_tel]
    );

    res.status(201).json({ message: "Demande envoyée à l'administrateur." });
  } catch (err) {
    console.error("Erreur demandeInscription:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getPendingRegistrations = async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM pending_registrations");
    res.json(users);
  } catch (error) {
    console.error("Erreur getPendingRegistrations:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.approveRegistration = async (req, res) => {
  console.log("✅ Requête reçue pour approveRegistration");

  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM pending_registrations WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Demande non trouvée.' });
    }

    const user = rows[0];

    if (!user.prenom || !user.nom || user.prenom.trim() === '' || user.nom.trim() === '') {
      return res.status(400).json({ message: 'Les champs prénom ou nom sont manquants.' });
    }

    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [user.email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé. L'utilisateur est peut-être déjà approuvé." });
    }

    const initiales = user.prenom[0].toUpperCase() + user.nom[0].toUpperCase();
    const annee = new Date().getFullYear();

    function genererChiffresAleatoires(longueur = 5) {
      return Array.from({ length: longueur }, () => Math.floor(Math.random() * 10)).join('');
    }

    let identifiant;
    let identifiantExiste = true;

    do {
      const chiffres = genererChiffresAleatoires(5);
      identifiant = `${initiales}${annee}${chiffres}`;

      const [check] = await db.query(
        'SELECT id FROM users WHERE identifiant_agent = ?',
        [identifiant]
      );
      identifiantExiste = check.length > 0;
    } while (identifiantExiste);

    console.log("🆔 Identifiant généré :", identifiant);

    const numeroTelFormate = user.numero_tel && user.numero_tel.startsWith('+') ? user.numero_tel : `+1${user.numero_tel}`;

    await db.query(
      `INSERT INTO users (prenom, nom, username, email, password, numero_tel, role, approuve, identifiant_agent)
       VALUES (?, ?, ?, ?, ?, ?, 'agent', true, ?)`,
      [user.prenom, user.nom, `${user.prenom} ${user.nom}`, user.email, user.password, numeroTelFormate, identifiant]
    );

    await db.query('DELETE FROM pending_registrations WHERE id = ?', [id]);

    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      let mailOptions = {
        from: `\"Panneau Admin\" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Votre inscription a été approuvée',
        text: `Bonjour ${user.prenom},\n\nVotre demande d'inscription a été approuvée.\nVoici votre identifiant : ${identifiant}\nMot de passe : ${user.password}\n\nVous pouvez maintenant vous connecter à la plateforme.`
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email envoyé :", info.response);
    } catch (emailErr) {
      console.error("❌ Erreur lors de l'envoi d'email :", emailErr);
    }

    try {
      const sms = await client.messages.create({
        body: `Bonjour ${user.prenom}, votre compte est activé. Identifiant: ${identifiant}, Mot de passe: ${user.password}`,
        from: process.env.TWILIO_PHONE,
        to: numeroTelFormate
      });
      console.log("✅ SMS envoyé :", sms.sid);
    } catch (smsErr) {
      console.error("❌ Erreur lors de l'envoi du SMS :", smsErr);
    }

    res.json({ message: 'Utilisateur approuvé et enregistré', identifiant });
  } catch (error) {
    console.error("❌ Erreur approveRegistration:", error);
    res.status(500).json({ message: "Erreur serveur", erreur: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Email non trouvé" });
    }

    const user = users[0];
    const nouveauMotDePasse = Math.random().toString(36).slice(-8);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [nouveauMotDePasse, user.id]);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Réinitialisation de mot de passe",
      text: `Bonjour ${user.prenom},\n\nVoici votre nouveau mot de passe temporaire : ${nouveauMotDePasse}\n\nMerci de le changer après connexion.`
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.json({ message: "Un nouveau mot de passe a été envoyé par email." });
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email de réinitialisation :", err);
      return res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
    }

  } catch (err) {
    console.error("Erreur resetPassword:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.changerMotDePasse = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { ancien, nouveau } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [decoded.id]);

    if (users.length === 0 || users[0].password !== ancien) {
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    }

    await db.query("UPDATE users SET password = ? WHERE id = ?", [nouveau, decoded.id]);
    res.json({ message: "Mot de passe mis à jour" });
  } catch (err) {
    console.error("Erreur changement mot de passe :", err);
    res.status(500).json({ message: "Erreur serveur", erreur: err.message });
  }
};

exports.refuserDemande = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM pending_registrations WHERE id = ?", [id]);
    res.json({ message: "Demande supprimée avec succès." });
  } catch (err) {
    console.error("Erreur refuserDemande :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
