import { Schema, model } from "mongoose";

const planningMetricsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    planningCreated: { type: Number, default: 0 },
    planningUpdated: { type: Number, default: 0 },
    planningFailed: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "planning_metrics", versionKey: false },
);

export const PlanningMetrics = model("PlanningMetrics", planningMetricsSchema);
