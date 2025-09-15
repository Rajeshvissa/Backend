
import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import CommunicationLog from "../models/CommunicationLog.js";

const router = express.Router();

router.post("/delivery", async (req, res) => {
  try {
    const signature = req.headers["x-signature"];
    if (!signature || typeof signature !== "string") {
      return res.status(401).json({ error: "Missing signature" });
    }

    const secret = process.env.VENDOR_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "Server misconfigured: VENDOR_SECRET missing" });
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    const validSig =
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

    if (!validSig) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { log_id, vendorMsgId, status } = req.body;

    if (!log_id || !mongoose.isValidObjectId(log_id)) {
      return res.status(400).json({ error: "Invalid or missing log_id" });
    }

    const allowedStatuses = new Set(["PENDING", "SENT", "FAILED"]);
    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const existing = await CommunicationLog.findById(log_id).select("status vendorMsgId");
    if (!existing) {
      return res.status(404).json({ error: "Log not found" });
    }

    if (
      existing.status === status &&
      (vendorMsgId ? existing.vendorMsgId === vendorMsgId : true)
    ) {
      return res.json({ ok: true, updated: false, log_id, status });
    }

    const updates = {
      status,
      updatedAt: new Date(),
    };
    if (vendorMsgId) updates.vendorMsgId = vendorMsgId;

    const updatedLog = await CommunicationLog.findByIdAndUpdate(log_id, updates, {
      new: true,
    });

    return res.json({ ok: true, updated: true, log: updatedLog });
  } catch (err) {
    console.error("❌ Receipts /delivery error:", err);
    return res.status(500).json({ error: err.message || "receipt update failed" });
  }
});

export default router;
