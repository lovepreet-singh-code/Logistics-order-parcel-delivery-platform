import {
  type HydratedDocument,
  type Model,
  Schema,
  model,
} from "mongoose";

export interface IShipmentTimelineEvent {
  event: string;
  timestamp: Date;
}

export interface IShipmentTimeline {
  orderId: string;
  events: IShipmentTimelineEvent[];
  lastUpdated: Date;
}

export type ShipmentTimelineDocument = HydratedDocument<IShipmentTimeline>;

type ShipmentTimelineModel = Model<IShipmentTimeline>;

const shipmentTimelineSchema = new Schema<
  IShipmentTimeline,
  ShipmentTimelineModel
>(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    events: [
      {
        event: {
          type: String,
          required: true,
          trim: true,
        },
        timestamp: {
          type: Date,
          required: true,
        },
      },
    ],
    lastUpdated: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    collection: "shipment_timelines",
    versionKey: false,
  },
);

shipmentTimelineSchema.index({ orderId: 1 }, { unique: true });

export const ShipmentTimeline = model<IShipmentTimeline, ShipmentTimelineModel>(
  "ShipmentTimeline",
  shipmentTimelineSchema,
);
