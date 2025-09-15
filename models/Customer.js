import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  total_spend: { type: Number, default: 0 },
  last_visit_date: Date,
}, { timestamps: true });

export default mongoose.models.Customer ||
  mongoose.model("Customer", customerSchema, "customer1");
