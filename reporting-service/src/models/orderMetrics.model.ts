import { Schema, model } from "mongoose";

const orderMetricsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    totalOrders: { type: Number, default: 0 },
    createdOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "order_metrics", versionKey: false },
);

export const OrderMetrics = model("OrderMetrics", orderMetricsSchema);
