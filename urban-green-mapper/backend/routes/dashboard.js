import express from "express";
const router = express.Router();

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    res.json({ message: "Dashboard route working!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
