const express = require('express');
const router = express.Router();
const agentCoursController = require('../controllers/agentCoursController'); // ✅ le nom du fichier réel

// ✅ GET un seul cours
router.get('/cours/:id', agentCoursController.getCoursById);

// CRUD cours
router.get('/cours', agentCoursController.getAllCours);
router.post('/cours', agentCoursController.createCours);
router.put('/cours/:id', agentCoursController.updateCours);
router.delete('/cours/:id', agentCoursController.deleteCours);

// Autres
router.get('/cours-avec-exams', agentCoursController.getCoursAvecExams);
router.get('/cours-avec-modules', agentCoursController.getCoursAvecModulesEtEvaluation);
router.post('/evaluer', agentCoursController.evaluerCours);

module.exports = router;
