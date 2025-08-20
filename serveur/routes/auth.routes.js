// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');



router.post('/login', authController.login);
router.post('/demande-inscription', authController.demandeInscription);
router.get('/pending-registrations', authController.getPendingRegistrations);
router.post('/approve-registration/:id', authController.approveRegistration);
router.post('/reset-password', authController.resetPassword);
router.post('/changer-mdp', authController.changerMotDePasse);
router.delete('/pending-registrations/:id', authController.refuserDemande);






module.exports = router;