const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// 1. Core Middleware
app.use(express.json());

// Support both IPv4 loopback addresses and credentials
const cors = require("cors");

// Enable CORS for all origins (or restrict it to your Vercel URL)
app.use(cors({
  origin: "*", // Or replace with your exact Vercel frontend URL
  credentials: true
}));

// 2. Connect to MongoDB
connectDB();


// 3. Serve Static Uploaded Files & API Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));

// 4. Base Health Check Route
app.get("/", (req, res) => {
  res.send("AI Interview Prep API is running...");
});

// 5. Start Listening on 0.0.0.0 (Accepts all incoming IPv4 traffic)
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in development mode on port ${PORT}`);
});