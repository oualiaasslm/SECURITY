const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// 🛡️ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Importation des routes
const authRoutes = require('./routes/auth.routes');
const agentRoutes = require('./routes/agent.routes');
const coursRoutes = require('./routes/cours.routes');
const examRoutes = require('./routes/exam.routes');            // 👈 Route des examens
const moduleRoutes = require('./routes/module.routes');
const resultRoutes = require('./routes/result.routes');
const messageRoutes = require('./routes/message.routes');
const userCoursesRoutes = require('./routes/userCourses.routes');
const uploadRoutes = require('./routes/upload.routes');        // 👈 Upload de fichiers
const soumissionRoutes = require('./routes/soumission.routes'); // 👈 Route des soumissions
const chatbotRoutes = require('./routes/chatbot.routes');       // 👈 Route du chatbot

console.log("✅ Toutes les routes ont été importées");

// ✅ Utilisation des routes (avec le préfixe /api)
app.use('/api', authRoutes);
app.use('/api', agentRoutes);
app.use('/api', coursRoutes);
app.use('/api', examRoutes);
app.use('/api', moduleRoutes);
app.use('/api', resultRoutes);
app.use('/api', messageRoutes);
app.use('/api', userCoursesRoutes);
app.use('/api', uploadRoutes);
console.log("📦 Route soumissions activée !");
app.use('/api/soumissions', soumissionRoutes);
app.use('/api/chatbot', chatbotRoutes); // 👈 Activation de la route chatbot

// ✅ Rendre les fichiers statiques accessibles (pour les PDF, images, vidéos, etc.)
app.use('/uploads', express.static('uploads'));

// 🏠 Route par défaut
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur le backend Node.js !" });
});

// 🚀 Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Serveur backend lancé sur http://localhost:${PORT}`);
});
