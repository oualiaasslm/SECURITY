const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

router.post("/messages", messageController.createMessage);
router.get("/messages/:user_id", messageController.getMessagesForAgent); // ✅ LA ROUTE MANQUANTE
router.get("/messages/details/:id", messageController.getMessageById);
router.put("/messages/:id/lu", messageController.markAsRead);

module.exports = router;
