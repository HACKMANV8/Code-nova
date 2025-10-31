import express from "express";
const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    res.json({ message: "User registration route working!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    res.json({ message: "User login route working!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
