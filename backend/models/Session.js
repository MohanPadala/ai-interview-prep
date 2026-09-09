const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobRole: { type: String, required: true },
    experience: { type: String, required: true },
    topicsToFocus: { type: String, required: true },
    questionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);