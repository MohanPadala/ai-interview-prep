const express = require("express");
const router = express.Router();
const { createSession, getSessions, getSessionById, deleteSession } = require("../controllers/sessionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // Protects all routes below

router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSessionById);
router.delete("/:id", deleteSession);

module.exports = router;