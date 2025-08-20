const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

router.get('/results', resultController.getAllResults);
router.put('/results/:id', resultController.updateResult);

module.exports = router;
