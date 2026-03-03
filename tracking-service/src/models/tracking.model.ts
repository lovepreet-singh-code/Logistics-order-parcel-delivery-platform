import {
  type HydratedDocument,
  type Model,
  Schema,
  model,
} from "mongoose";

export interface ITracking {
  orderId: string;
  eventId: string;
  eventType: string;
  eventVersion: number;
  occurredAt: Date;
  producer: string;
  data?: unknown;
  receivedAt: Date;
}

export type TrackingDocument = HydratedDocument<ITracking>;

type TrackingModel = Model<ITracking>;

const trackingSchema = new Schema<ITracking, TrackingModel>(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
    },
    eventId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    eventVersion: {
      type: Number,
      required: true,
      min: 1,
    },
    occurredAt: {
      type: Date,
      required: true,
    },
    producer: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: false,
    },
    receivedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  },
);

trackingSchema.index({ orderId: 1, occurredAt: 1 });
trackingSchema.index({ eventId: 1 }, { unique: true });

export const Tracking = model<ITracking, TrackingModel>("Tracking", trackingSchema);
