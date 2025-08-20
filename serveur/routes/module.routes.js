const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

// ✅ Modules par cours
router.get('/modules/cours/:id', moduleController.getModulesByCoursId);

// Tous les modules
router.get('/modules', moduleController.getAllModules);

// Modules avec examens
router.get('/modules-avec-exams', moduleController.getModulesAvecExams);

module.exports = router;
