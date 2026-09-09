const Session = require("../models/Session");
const Question = require("../models/Question");

// @desc    Create a new interview session
// @route   POST /api/sessions
const createSession = async (req, res) => {
  const { jobRole, experience, topicsToFocus } = req.body;

  try {
    const session = await Session.create({
      userId: req.user._id,
      jobRole,
      experience,
      topicsToFocus,
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error creating session" });
  }
};

// @desc    Get all sessions for logged in user
// @route   GET /api/sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sessions" });
  }
};

// @desc    Get a single session by ID
// @route   GET /api/sessions/:id
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    // Ensure the session belongs to the user
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Error fetching session" });
  }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    // Delete all questions associated with this session first
    await Question.deleteMany({ sessionId: session._id });
    await session.deleteOne();
    
    res.json({ message: "Session removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting session" });
  }
};

module.exports = { createSession, getSessions, getSessionById, deleteSession };