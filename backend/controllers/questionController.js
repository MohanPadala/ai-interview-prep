const Question = require("../models/Question");
const Session = require("../models/Session");
const Groq = require("groq-sdk");

// Initialize Groq SDK
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper to call Groq with automatic model failover
// Helper to call Groq with automatic model failover
// Helper to call Groq with automatic model failover
const callGroqWithFallback = async (prompt, enforceJson = false) => {
  const activeModels = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "openai/gpt-oss-20b"
  ];
  let lastError;

  for (const model of activeModels) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: model,
        ...(enforceJson && { response_format: { type: "json_object" } }),
      });
      return completion.choices[0]?.message?.content || "";
    } catch (err) {
      console.warn(`Model ${model} failed (${err.message}). Retrying next model...`);
      lastError = err;
    }
  }
  throw lastError;
};

// @desc    Generate questions for a session using Groq AI
// @route   POST /api/questions/generate/:sessionId
const generateQuestions = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Prompt structured specifically for Groq's JSON mode
    const prompt = `You are a senior technical interviewer. Generate 5 technical interview questions with detailed answers for a ${session.jobRole} role with ${session.experience} experience focusing on: ${session.topicsToFocus}.
    
    You MUST respond strictly with a valid JSON object in this exact shape:
    {
      "questions": [
        {
          "question": "Question text here",
          "answer": "Detailed answer text here"
        }
      ]
    }`;

    const rawResponse = await callGroqWithFallback(prompt, true);
    const parsedData = JSON.parse(rawResponse);
    const questionsList = parsedData.questions || parsedData;

    // Save generated questions to DB
    const savedQuestions = [];
    for (const item of questionsList) {
      const newQuestion = await Question.create({
        sessionId: session._id,
        userId: req.user._id,
        question: item.question,
        answer: item.answer,
      });
      savedQuestions.push(newQuestion);
    }

    // Update session question count
    session.questionsCount += savedQuestions.length;
    await session.save();

    res.status(201).json(savedQuestions);
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ message: "Error generating questions", details: error.message });
  }
};

// @desc    Get questions for a session
// @route   GET /api/questions/session/:sessionId
const getQuestionsBySession = async (req, res) => {
  try {
    const questions = await Question.find({ sessionId: req.params.sessionId }).sort({ isPinned: -1, createdAt: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions" });
  }
};

// @desc    Toggle question pin status
// @route   PATCH /api/questions/:id/pin
const togglePinStatus = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    question.isPinned = !question.isPinned;
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Error pinning question" });
  }
};

// @desc    Generate concept explanation via AI
// @route   POST /api/questions/:id/explain
const generateExplanation = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });
    if (question.explanation) return res.json({ explanation: question.explanation });

    const prompt = `Explain the core technical concept in this answer simply in under 3 bullet points: "${question.answer}"`;

    const explanation = await callGroqWithFallback(prompt, false);

    question.explanation = explanation;
    await question.save();

    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ message: "Error generating explanation" });
  }
};

module.exports = { generateQuestions, getQuestionsBySession, togglePinStatus, generateExplanation };