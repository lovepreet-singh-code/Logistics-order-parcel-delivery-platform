import { ShipmentTimeline } from "../models/shipmentTimeline.model";

export const appendTimelineEvent = async (
  orderId: string,
  eventName: string,
  timestamp: Date,
): Promise<void> => {
  await ShipmentTimeline.updateOne(
    { orderId },
    {
      $setOnInsert: { orderId },
      $push: {
        events: {
          event: eventName,
          timestamp,
        },
      },
      $set: { lastUpdated: new Date() },
    },
    { upsert: true },
  ).exec();
};
