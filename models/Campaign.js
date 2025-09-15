import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rules: { type: Object, required: true },
  audience_size: { type: Number, default: 0 },

  tags: { type: [String], default: [] },
  tagUpdatedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Campaign ||
  mongoose.model("Campaign", campaignSchema, "campaigns1");
