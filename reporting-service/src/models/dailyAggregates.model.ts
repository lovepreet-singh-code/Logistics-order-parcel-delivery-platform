import { Schema, model } from "mongoose";

const dailyAggregatesSchema = new Schema(
  {
    date: { type: String, required: true, unique: true, index: true },
    totalOrders: { type: Number, default: 0 },
    plannedOrders: { type: Number, default: 0 },
    deliveredOrders: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    successfulPayments: { type: Number, default: 0 },
    failedPayments: { type: Number, default: 0 },
    trackingEvents: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "daily_aggregates", versionKey: false },
);

export const DailyAggregates = model("DailyAggregates", dailyAggregatesSchema);
