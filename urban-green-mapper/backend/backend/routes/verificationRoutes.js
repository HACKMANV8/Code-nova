// backend/routes/verificationRoutes.js
import express from "express";
import Verification from "../models/Verification.js";

const router = express.Router();

// ✅ POST: Add new verification record
router.post("/", async (req, res) => {
  try {
    const { name, location, status } = req.body;

    const verification = new Verification({
      name,
      location,
      status,
      createdAt: new Date(),
    });

    await verification.save();
    res.status(201).json({ success: true, message: "Verification added", verification });
  } catch (error) {
    console.error("Error saving verification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ GET: Fetch all verification records
router.get("/", async (req, res) => {
  try {
    const records = await Verification.find();
    res.json(records);
  } catch (error) {
    console.error("Error fetching verification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
