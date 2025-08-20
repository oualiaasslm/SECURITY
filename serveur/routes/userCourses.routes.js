const express = require("express");
const router = express.Router();
const userCoursesController = require("../controllers/userCoursesController");

// Route pour ajouter un cours à la liste d'un agent

router.post("/cours-disponibles/ajouter", userCoursesController.addUserCourse);
// Route pour récupérer les cours choisis par un agent
router.get("/cours-choisis/:userId", userCoursesController.getUserCourses);


module.exports = router;
