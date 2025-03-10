const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

// Import Routes
const userRoutes = require("./routes/userRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const taskRoutes = require("./routes/taskRoutes");
const mindRoutes = require("./routes/mindRoutes");
const therapyRoutes = require("./routes/therapyRoutes");
const moodRoutes = require("./routes/moodRoutes");
const journeyRoutes = require("./routes/journeyRoutes");
const journalRoutes = require("./routes/journalRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const GPTRoutes = require("./routes/GPTRoutes");
const FrequentWordsRoutes = require("./routes/frequentWordsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");




// Initialize Express App
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

// API Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/surveys", surveyRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/mind", mindRoutes);
app.use("/api/v1/therapy", therapyRoutes);
app.use("/api/v1/mood", moodRoutes);
app.use("/api/v1/journey", journeyRoutes);
app.use("/api/v1/journal", journalRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/gpt", GPTRoutes);
app.use("/api/v1/frequent-words", FrequentWordsRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Error Handling Middleware
app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
// app.listen(PORT, () => {
//   console.log(`Server running on http://127.0.0.1:${PORT}`);
// });

module.exports = app;