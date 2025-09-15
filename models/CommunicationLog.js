import mongoose from "mongoose";

const communicationLogSchema = new mongoose.Schema(
  {
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    message: { type: String, required: true },


    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",   
    },


    vendorMsgId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CommunicationLog ||
  mongoose.model("CommunicationLog", communicationLogSchema, "communication_logs1");
