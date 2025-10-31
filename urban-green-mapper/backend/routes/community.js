import express from "express";
const router = express.Router();

// GET /api/community
router.get("/", async (req, res) => {
  try {
    res.json({ message: "Community route working!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
