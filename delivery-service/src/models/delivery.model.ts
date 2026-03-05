import { Schema, model } from "mongoose";

export type DeliveryState = "PLANNED";

const deliverySchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    franchiseId: { type: String, required: true },
    vehicleId: { type: String, required: true },
    driverId: { type: String, required: true },
    currentState: {
      type: String,
      required: true,
      enum: ["PLANNED"],
      default: "PLANNED",
      index: true,
    },
    plannedAt: { type: Date, required: true },
    version: { type: Number, required: true, default: 1 },
  },
  {
    collection: "deliveries",
    versionKey: false,
    timestamps: true,
  },
);

deliverySchema.index({ orderId: 1 }, { unique: true });

export const Delivery = model("Delivery", deliverySchema);
