
import express from "express";
import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import CommunicationLog from "../models/CommunicationLog.js";
import Customer from "../models/Customer.js";

const router = express.Router();
async function generateTags({ name = "", rules = {}, audienceSize = 0 }) {
  const tags = new Set();
  const nm = (name || "").toLowerCase();
  const minSpend = Number(rules?.min_spend || 0);
  const inactiveDays = Number(rules?.inactive_days || 0);

  if (inactiveDays >= 30) {
    tags.add("Win-back");
    tags.add("Reactivation");
  }
  if (minSpend >= 4000) {
    tags.add("High value customers");
    tags.add("Loyalty");
  }
  if (/\b(vip|elite|prime)\b/i.test(nm)) tags.add("Loyalty");
  if (/\b(festival|diwali|pongal|christmas|xmas|eoy|clearance|sale|offer)\b/i.test(nm)) {
    tags.add("Seasonal");
    tags.add("Promotion");
  }
  if (audienceSize === 0) tags.add("Narrow audience");
  try {
    if (process.env.OPENAI_API_KEY) {
      const prompt = `
Suggest 1-3 short marketing tags for a campaign based on:
Name: "${name}"
Rules: ${JSON.stringify(rules)}
Audience size: ${audienceSize}
Return only a JSON array of strings, e.g. ["Win-back","High value customers","Seasonal"].
      `.trim();

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        }),
      });

      const data = await resp.json();
      const text = data?.choices?.[0]?.message?.content || "[]";
      const ai = JSON.parse(text);
      (Array.isArray(ai) ? ai : []).forEach((t) => {
        if (typeof t === "string" && t.trim()) tags.add(t.trim());
      });
    }
  } catch {

  }


  return Array.from(tags)
    .map((t) => t.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 3);
}


router.post("/suggest-tags", async (req, res) => {
  try {
    const { name = "", rules = {} } = req.body || {};

    const q = {};
    if (rules.min_spend) q.total_spend = { $gte: Number(rules.min_spend) };
    if (rules.inactive_days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(rules.inactive_days));
      q.last_visit_date = { $lte: cutoff };
    }
    const audienceSize = Object.keys(q).length ? await Customer.countDocuments(q) : 0;

    const tags = await generateTags({ name, rules, audienceSize });
    res.json({ tags });
  } catch (err) {
    console.error("❌ suggest-tags error:", err);
    res.status(200).json({ tags: [] });
  }
});


router.post("/", async (req, res) => {
  try {
    const { name, rules, selectedTags } = req.body;

    if (!name || !rules) {
      return res.status(400).json({ error: "Name and rules are required" });
    }


    const query = {};
    if (rules.min_spend) query.total_spend = { $gte: Number(rules.min_spend) };
    if (rules.inactive_days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(rules.inactive_days));
      query.last_visit_date = { $lte: cutoff };
    }


    const customers = await Customer.find(query);
    console.log(`👥 Found ${customers.length} customers for campaign with rules`, rules);


    const campaign = new Campaign({
      name,
      rules,
      audience_size: customers.length,
    });

    const autoTags = await generateTags({
      name,
      rules,
      audienceSize: customers.length,
    });
    const userTags = Array.isArray(selectedTags) ? selectedTags.filter(Boolean) : [];
    const finalTags = Array.from(new Set([...(autoTags || []), ...userTags])).slice(0, 5);
    campaign.tags = finalTags;
    campaign.tagUpdatedAt = new Date();

    await campaign.save();

    const logs = await Promise.all(
      customers.map(async (customer) => {
        const message = `Hi ${customer.name}, thanks for being with us! Here's a special offer just for you.`;

        const log = new CommunicationLog({
          campaign_id: campaign._id,
          customer_id: customer._id,
          message,
          status: "PENDING",
        });
        await log.save();

        try {
          const apiBase = process.env.API_BASE_URL || "http://localhost:5000";
          await fetch(`${apiBase}/api/vendor/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              log_id: log._id,
              customer_id: customer._id,
              message,
            }),
          });
        } catch (err) {
          console.error("❌ Vendor send failed:", err?.message || err);
        }

        return log;
      })
    );

    res.status(201).json({
      message: "Campaign created, auto-tagged, and logs queued",
      campaign,
      logs_count: logs.length,
    });
  } catch (error) {
    console.error("❌ Error creating campaign:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const raw = (req.query.tag || "").trim();
    const filter = {};

    if (raw) {
      const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const fuzzy = escaped.replace(/\s+/g, "[-_\\s]*");
      const pattern = new RegExp(fuzzy, "i");

      filter.$or = [
        { tags: { $elemMatch: { $regex: pattern } } }, 
        { tags: { $regex: pattern } },                
        { name: { $regex: pattern } },                
      ];
    }

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error("❌ Error fetching campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});


router.get("/:id/logs", async (req, res) => {
  try {
    const campaignId = new mongoose.Types.ObjectId(req.params.id);

    const logs = await CommunicationLog.find({ campaign_id: campaignId }).populate(
      "customer_id",
      "name email"
    );

    res.json(logs);
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
