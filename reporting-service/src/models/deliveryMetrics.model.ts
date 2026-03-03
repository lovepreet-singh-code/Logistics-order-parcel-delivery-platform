import { Schema, model } from "mongoose";

const deliveryMetricsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    assignedDeliveries: { type: Number, default: 0 },
    inTransitDeliveries: { type: Number, default: 0 },
    deliveredOrders: { type: Number, default: 0 },
    failedDeliveries: { type: Number, default: 0 },
    trackingEvents: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "delivery_metrics", versionKey: false },
);

export const DeliveryMetrics = model("DeliveryMetrics", deliveryMetricsSchema);
