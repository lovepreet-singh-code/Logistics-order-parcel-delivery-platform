import { Schema, model } from "mongoose";

const revenueMetricsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    totalRevenue: { type: Number, default: 0 },
    successfulPayments: { type: Number, default: 0 },
    failedPayments: { type: Number, default: 0 },
    refundedAmount: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "revenue_metrics", versionKey: false },
);

export const RevenueMetrics = model("RevenueMetrics", revenueMetricsSchema);
