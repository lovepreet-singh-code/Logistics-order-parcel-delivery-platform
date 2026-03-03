import { Schema, model } from "mongoose";

const processedEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    correlationId: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { collection: "processed_events", versionKey: false },
);

export const ProcessedEvent = model("ProcessedEvent", processedEventSchema);
