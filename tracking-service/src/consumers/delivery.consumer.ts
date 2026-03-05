import { ProcessedEvent } from "../models/processedEvent.model";
import { appendTimelineEvent } from "../services/timeline.service";

type DeliveryEvent = {
  eventId?: string;
  eventType?: string;
  occurredAt?: string;
  correlationId?: string;
};

const DELIVERY_TOPIC = "logistics.delivery.events";

const SUPPORTED_DELIVERY_EVENTS = new Set([
  "DELIVERY_ASSIGNED",
  "DELIVERY_STARTED",
  "DELIVERY_COMPLETED",
  "DELIVERY_FAILED",
  "DELIVERY_RETURNED",
]);

const toTimelineProcessedEventId = (eventId: string): string => {
  return `${eventId}:timeline`;
};

const isDuplicateTimelineEvent = async (eventId: string): Promise<boolean> => {
  const existing = await ProcessedEvent.findOne({ eventId }).lean().exec();
  return Boolean(existing);
};

const markTimelineProcessed = async (eventId: string): Promise<void> => {
  await ProcessedEvent.updateOne(
    { eventId },
    {
      $setOnInsert: {
        eventId,
        processedAt: new Date(),
      },
    },
    { upsert: true },
  ).exec();
};

const validateDeliveryEvent = (
  event: DeliveryEvent,
): {
  eventId: string;
  eventType: string;
  occurredAt: string;
  correlationId: string;
} => {
  if (typeof event.eventId !== "string" || event.eventId.trim() === "") {
    throw new Error("Invalid or missing eventId");
  }

  if (typeof event.eventType !== "string" || event.eventType.trim() === "") {
    throw new Error("Invalid or missing eventType");
  }

  if (
    typeof event.correlationId !== "string" ||
    event.correlationId.trim() === ""
  ) {
    throw new Error("Invalid or missing correlationId");
  }

  if (typeof event.occurredAt !== "string" || event.occurredAt.trim() === "") {
    throw new Error("Invalid or missing occurredAt");
  }

  return {
    eventId: event.eventId.trim(),
    eventType: event.eventType.trim(),
    correlationId: event.correlationId.trim(),
    occurredAt: event.occurredAt,
  };
};

export const processDeliveryTimelineEvent = async (
  topic: string,
  event: DeliveryEvent,
): Promise<void> => {
  if (topic !== DELIVERY_TOPIC) {
    return;
  }

  const validEvent = validateDeliveryEvent(event);

  if (!SUPPORTED_DELIVERY_EVENTS.has(validEvent.eventType)) {
    return;
  }

  const timelineProcessedEventId = toTimelineProcessedEventId(validEvent.eventId);

  if (await isDuplicateTimelineEvent(timelineProcessedEventId)) {
    return;
  }

  const timestamp = new Date(validEvent.occurredAt);

  if (Number.isNaN(timestamp.getTime())) {
    throw new Error("Invalid occurredAt date");
  }

  await appendTimelineEvent(
    validEvent.correlationId,
    validEvent.eventType,
    timestamp,
  );

  await markTimelineProcessed(timelineProcessedEventId);
};
