// 📁 routes/exam.routes.js
const express = require('express');
const router = express.Router();

const agentexamController = require('../controllers/agentexamController');
const soumissionController = require('../controllers/soumissionController');

// Routes CRUD pour les examens
router.get("/exams", agentexamController.getAllExams);
router.post("/exams", agentexamController.createExam);
router.put("/exams/:id", agentexamController.updateExam);
router.delete("/exams/:id", agentexamController.deleteExam);

// ✅ Route pour récupérer l’examen lié à un cours
router.get("/exams/cours/:id", agentexamController.getExamByCoursId);

// ✅ Route pour récupérer la soumission liée à un cours
router.get("/soumissions/cours/:id", soumissionController.getSoumissionByCoursId);

module.exports = router;
