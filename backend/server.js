const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// 1. Core Middleware
app.use(express.json());


app.use(cors({
  origin: true, // Automatically reflects the request origin and allows it
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 3. Connect MongoDB
connectDB();

// 4. Serve Static Uploaded Files & API Routes
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));

// 5. Base Health Check Route
app.get("/", (req, res) => {
  res.send("AI Interview Prep API is running...");
});

// 6. Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in development mode on port ${PORT}`);
});