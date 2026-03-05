import { Schema, model } from "mongoose";

const processedEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    processedAt: { type: Date, required: true, default: Date.now },
  },
  {
    collection: "processed_events",
    versionKey: false,
  },
);

export const ProcessedEvent = model("ProcessedEvent", processedEventSchema);
