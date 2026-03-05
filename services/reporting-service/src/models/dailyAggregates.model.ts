import { Schema, model } from "mongoose";

const dailyAggregatesSchema = new Schema(
  {
    date: { type: String, required: true, unique: true, index: true },
    orders: { type: Number, default: 0 },
    deliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "daily_aggregates", versionKey: false },
);

export const DailyAggregates = model("DailyAggregates", dailyAggregatesSchema);
