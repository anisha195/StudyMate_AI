const express = require("express");
const { protect } = require("../middleware/auth");
const {
  askQuestion,
  listConversations,
  getConversation,
} = require("../controllers/chatController");

const router = express.Router();

router.use(protect);

router.post("/ask", askQuestion);
router.get("/conversations", listConversations);
router.get("/conversations/:id", getConversation);

module.exports = router;
