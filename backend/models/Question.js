const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    explanation: { type: String, default: "" },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);