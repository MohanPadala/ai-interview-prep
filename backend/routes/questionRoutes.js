const express = require("express");
const router = express.Router();
const { generateQuestions, getQuestionsBySession, togglePinStatus, generateExplanation } = require("../controllers/questionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // Protects all routes below

router.post("/generate/:sessionId", generateQuestions);
router.get("/session/:sessionId", getQuestionsBySession);
router.patch("/:id/pin", togglePinStatus);
router.post("/:id/explain", generateExplanation);

module.exports = router;