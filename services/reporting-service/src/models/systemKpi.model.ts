import { Schema, model } from "mongoose";

const systemKpiSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    totalOrders: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    avgDeliveryTime: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { collection: "system_kpis", versionKey: false },
);

export const SystemKpi = model("SystemKpi", systemKpiSchema);
