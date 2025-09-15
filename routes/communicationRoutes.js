import express from "express";
import CommunicationLog from "../models/CommunicationLog.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await CommunicationLog.find()
      .populate("customer_id", "name email")  
      .populate("campaign_id", "name")        
      .sort({ createdAt: -1 })              
      .skip(skip)
      .limit(limit);

    const total = await CommunicationLog.countDocuments();

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      logs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
