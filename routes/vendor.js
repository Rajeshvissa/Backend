
import express from "express";
import crypto from "crypto";

const router = express.Router();


router.post("/send", (req, res) => {
  try {
    const { log_id, customer_id, message } = req.body;
    console.log("📤 Vendor received send request:", { log_id, customer_id });

    if (!log_id) {
      return res.status(400).json({ error: "log_id is required" });
    }

    const status = Math.random() < 0.9 ? "SENT" : "FAILED";
    const vendorMsgId = `v-${Math.floor(Math.random() * 1e9)}`;

    console.log(`📡 Vendor will send status=${status}, vendorMsgId=${vendorMsgId}`);
    const delayMs = Math.floor(Math.random() * 800) + 100;

    setTimeout(async () => {
      try {
        const apiBase = process.env.API_BASE_URL || "http://localhost:5000";
        const body = JSON.stringify({ log_id, vendorMsgId, status });

        const signature = crypto
          .createHmac("sha256", process.env.VENDOR_SECRET)
          .update(body)
          .digest("hex");

        console.log("➡️ Vendor calling receipts with signed body:", {
          log_id,
          vendorMsgId,
          status,
          signature,
        });

        await fetch(`${apiBase}/api/receipts/delivery`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-signature": signature, 
          },
          body,
        });

        console.log("✅ Vendor -> receipts call sent!");
      } catch (err) {
        console.error("❌ Vendor -> receipts call failed:", err?.message || err);
      }
    }, delayMs);

    return res.json({ ok: true, vendorMsgId, queued: true });
  } catch (err) {
    console.error("Vendor /send error:", err);
    return res.status(500).json({ error: err.message || "vendor error" });
  }
});

export default router;
