import { Schema, model } from "mongoose";
import { DELIVERY_STATES } from "../state-machine/delivery.state-machine";

export type DeliveryState = keyof typeof DELIVERY_STATES;

const deliverySchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    franchiseId: { type: String, required: true },
    vehicleId: { type: String, required: true },
    driverId: { type: String, required: true },
    currentState: {
      type: String,
      required: true,
      enum: Object.values(DELIVERY_STATES),
      default: DELIVERY_STATES.PLANNED,
      index: true,
    },
    plannedAt: { type: Date, required: true },
    failureReason: { type: String, required: false },
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
