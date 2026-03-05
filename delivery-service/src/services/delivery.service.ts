import { Delivery } from "../models/delivery.model";
import { ProcessedEvent } from "../models/processedEvent.model";
import type { PlanConfirmedEvent } from "../events/planning.events";

const parseDate = (value: string | undefined, fallback: string): Date => {
  const source = value ?? fallback;
  const date = new Date(source);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid plannedAt/occurredAt date");
  }

  return date;
};

const validateEvent = (event: PlanConfirmedEvent): void => {
  if (!event.eventId?.trim()) {
    throw new Error("Invalid eventId");
  }

  if (!event.data?.orderId?.trim()) {
    throw new Error("Invalid orderId");
  }

  if (!event.data.franchiseId?.trim()) {
    throw new Error("Invalid franchiseId");
  }

  if (!event.data.vehicleId?.trim()) {
    throw new Error("Invalid vehicleId");
  }

  if (!event.data.driverId?.trim()) {
    throw new Error("Invalid driverId");
  }

  if (!event.occurredAt?.trim()) {
    throw new Error("Invalid occurredAt");
  }
};

export const createDeliveryFromPlan = async (
  event: PlanConfirmedEvent,
): Promise<void> => {
  validateEvent(event);

  const eventId = event.eventId.trim();

  const existingProcessedEvent = await ProcessedEvent.findOne({ eventId })
    .lean()
    .exec();

  if (existingProcessedEvent) {
    return;
  }

  await Delivery.updateOne(
    { orderId: event.data.orderId.trim() },
    {
      $setOnInsert: {
        orderId: event.data.orderId.trim(),
        franchiseId: event.data.franchiseId.trim(),
        vehicleId: event.data.vehicleId.trim(),
        driverId: event.data.driverId.trim(),
        currentState: "PLANNED",
        plannedAt: parseDate(event.data.plannedAt, event.occurredAt),
        version: 1,
      },
    },
    { upsert: true },
  ).exec();

  await ProcessedEvent.updateOne(
    { eventId },
    { $setOnInsert: { eventId, processedAt: new Date() } },
    { upsert: true },
  ).exec();
};
