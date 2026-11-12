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


app.get('/api/inventory', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT item_key, status FROM inventory'
    )

    const inventory = Object.fromEntries(
      result.rows.map((row) => [
        row.item_key,
        row.status,
      ])
    )

    res.json(inventory)
  } catch (error) {
    console.error('Error loading inventory:', error)
    res.status(500).json({
      error: 'Failed to load inventory',
    })
  }
})

app.put('/api/inventory/:key', async (req, res) => {
  const { key } = req.params
  const { status } = req.body

  if (!['available', 'low', 'soldout'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid inventory status',
    })
  }

  if (!/^(product|modifier):[a-zA-Z0-9-]+$/.test(key)) {
    return res.status(400).json({
      error: 'Invalid inventory key',
    })
  }

  try {
    const result = await pool.query(
      `INSERT INTO inventory (item_key, status)
       VALUES ($1, $2)
       ON CONFLICT (item_key)
       DO UPDATE SET
         status = EXCLUDED.status,
         updated_at = NOW()
       RETURNING item_key, status`,
      [key, status]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating inventory:', error)
    res.status(500).json({
      error: 'Failed to update inventory',
    })
  }
})

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