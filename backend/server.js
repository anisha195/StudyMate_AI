require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documents");
const chatRoutes = require("./routes/chat");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "2mb" }));

// Basic protection against brute-force / abuse on the API
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "studymate-ai-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[StudyMate AI] Backend running on port ${PORT}`);
});
