import { kafka } from "./kafka.config";
import { Tracking } from "../models/tracking.model";
import { ProcessedEvent } from "../models/processedEvent.model";
import { connectProducer, disconnectProducer, publishEvent } from "./producer";

type DomainEvent = {
  eventId?: string;
  eventType?: string;
  eventVersion?: number;
  occurredAt?: string;
  producer?: string;
  correlationId?: string;
  data?: unknown;
};

const consumer = kafka.consumer({ groupId: "tracking-group" });

let isConnected = false;

const subscribedTopics = [
  "logistics.order.events",
  "logistics.planning.events",
  "logistics.delivery.events",
] as const;

const parseMessage = (value: string): DomainEvent | null => {
  try {
    return JSON.parse(value) as DomainEvent;
  } catch {
    return null;
  }
};

const wait = async (delayMs: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
};

const isDuplicateEvent = async (eventId: string): Promise<boolean> => {
  const existing = await ProcessedEvent.findOne({ eventId }).lean().exec();
  return Boolean(existing);
};

const markEventProcessed = async (eventId: string): Promise<void> => {
  await ProcessedEvent.updateOne(
    { eventId },
    { $setOnInsert: { eventId, processedAt: new Date() } },
    { upsert: true },
  ).exec();
};

const buildDlqTopic = (topic: string): string => {
  return topic.replace(".events", ".dlq");
};

const publishToDlq = async (
  sourceTopic: string,
  originalEvent: DomainEvent,
  error: unknown,
): Promise<void> => {
  const errorMessage =
    error instanceof Error ? error.message : "Unknown processing error";

  await publishEvent(buildDlqTopic(sourceTopic), {
    originalEvent,
    errorMessage,
    failedAt: new Date().toISOString(),
    consumer: "tracking-service",
  });
};

const validateEvent = (event: DomainEvent): Required<
  Pick<
    DomainEvent,
    | "eventId"
    | "eventType"
    | "eventVersion"
    | "occurredAt"
    | "producer"
    | "correlationId"
  >
> => {
  if (typeof event.eventId !== "string" || event.eventId.trim() === "") {
    throw new Error("Invalid or missing eventId");
  }

  if (
    typeof event.correlationId !== "string" ||
    event.correlationId.trim() === ""
  ) {
    throw new Error("Invalid or missing correlationId");
  }

  if (typeof event.eventType !== "string" || event.eventType.trim() === "") {
    throw new Error("Invalid or missing eventType");
  }

  if (
    typeof event.eventVersion !== "number" ||
    !Number.isInteger(event.eventVersion) ||
    event.eventVersion < 1
  ) {
    throw new Error("Invalid or missing eventVersion");
  }

  if (typeof event.occurredAt !== "string" || event.occurredAt.trim() === "") {
    throw new Error("Invalid or missing occurredAt");
  }

  if (typeof event.producer !== "string" || event.producer.trim() === "") {
    throw new Error("Invalid or missing producer");
  }

  return {
    eventId: event.eventId.trim(),
    eventType: event.eventType.trim(),
    eventVersion: event.eventVersion,
    occurredAt: event.occurredAt,
    producer: event.producer.trim(),
    correlationId: event.correlationId.trim(),
  };
};

const appendTrackingEvent = async (event: DomainEvent): Promise<void> => {
  const validEvent = validateEvent(event);

  if (await isDuplicateEvent(validEvent.eventId)) {
    return;
  }

  await Tracking.create({
    orderId: validEvent.correlationId,
    eventId: validEvent.eventId,
    eventType: validEvent.eventType,
    eventVersion: validEvent.eventVersion,
    occurredAt: new Date(validEvent.occurredAt),
    producer: validEvent.producer,
    data: event.data,
    receivedAt: new Date(),
  });

  await markEventProcessed(validEvent.eventId);
};

const processWithRetry = async (
  sourceTopic: string,
  event: DomainEvent,
): Promise<void> => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await appendTrackingEvent(event);
      return;
    } catch (error) {
      if (attempt === 3) {
        await publishToDlq(sourceTopic, event, error);
        console.error(error);
        return;
      }

      await wait(500 * attempt);
    }
  }
};

export const connectConsumer = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  await connectProducer();
  await consumer.connect();

  for (const topic of subscribedTopics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) {
        return;
      }

      const parsed = parseMessage(message.value.toString());

      if (!parsed) {
        return;
      }

      await processWithRetry(topic, parsed);
    },
  });

  isConnected = true;
};

export const disconnectConsumer = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  await consumer.disconnect();
  await disconnectProducer();
  isConnected = false;
};
