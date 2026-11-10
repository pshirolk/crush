require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const PORT = process.env.PORT || 5001;

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend is running!",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Test database connection
pool
  .query("SELECT NOW()")
  .then((result) => {
    console.log("Database connected!");
    console.log(result.rows[0]);
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });
