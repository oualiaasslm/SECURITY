const express = require("express");
const router = express.Router();

const agentController = require("../controllers/agentController");
const agentCoursController = require("../controllers/agentCoursController");

router.get("/agents", agentController.getAllAgents);
router.post("/agents", agentController.createAgent);
router.put("/agents/:id", agentController.updateAgent);
router.delete("/agents/:id", agentController.deleteAgent);

// Les routes cours/évaluation si tu les as toujours
router.get("/agent/cours", agentCoursController.getCoursAvecModulesEtEvaluation);
router.post("/agent/evaluer", agentCoursController.evaluerCours);
router.get("/cours-avec-exams", agentCoursController.getCoursAvecExams);
router.get("/agents/:id", agentController.getAgentById);





module.exports = router;
