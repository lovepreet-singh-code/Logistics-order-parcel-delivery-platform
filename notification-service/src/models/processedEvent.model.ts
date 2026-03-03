import {
  type HydratedDocument,
  type Model,
  Schema,
  model,
} from "mongoose";

export interface IProcessedEvent {
  eventId: string;
  processedAt: Date;
}

export type ProcessedEventDocument = HydratedDocument<IProcessedEvent>;

type ProcessedEventModel = Model<IProcessedEvent>;

const processedEventSchema = new Schema<IProcessedEvent, ProcessedEventModel>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    processedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

processedEventSchema.index({ eventId: 1 }, { unique: true });

export const ProcessedEvent = model<IProcessedEvent, ProcessedEventModel>(
  "ProcessedEvent",
  processedEventSchema,
);
