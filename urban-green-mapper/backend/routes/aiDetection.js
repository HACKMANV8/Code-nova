import express from "express";
const router = express.Router();

// Simple test route for now
router.post("/", async (req, res) => {
  try {
    res.json({ message: "AI Detection route working!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
