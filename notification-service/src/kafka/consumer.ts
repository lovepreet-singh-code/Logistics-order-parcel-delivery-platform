import { kafka } from "./kafka.config";
import { ProcessedEvent } from "../models/processedEvent.model";
import {
  connectProducer,
  disconnectProducer,
  publishEvent,
} from "./producer";

type DomainEventPayload = {
  eventId?: string;
  eventType?: string;
  correlationId?: string;
  data?: unknown;
};

const consumer = kafka.consumer({ groupId: "notification-group" });

let isConnected = false;

const parseMessage = (value: string): DomainEventPayload | null => {
  try {
    return JSON.parse(value) as DomainEventPayload;
  } catch {
    return null;
  }
};

const wait = async (delayMs: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
};

const handleEvent = (event: DomainEventPayload): void => {
  const correlationId = event.correlationId;

  if (!correlationId) {
    return;
  }

  switch (event.eventType) {
    case "OrderCreated":
      console.info("Notification: Order created for orderId:", correlationId);
      break;
    case "PlanningCreated":
      console.info(
        "Notification: Planning completed for orderId:",
        correlationId,
      );
      break;
    default:
      break;
  }
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
  originalEvent: DomainEventPayload,
  error: unknown,
): Promise<void> => {
  const dlqTopic = buildDlqTopic(sourceTopic);
  const errorMessage =
    error instanceof Error ? error.message : "Unknown processing error";

  await publishEvent(dlqTopic, {
    originalEvent,
    errorMessage,
    failedAt: new Date().toISOString(),
    consumer: "notification-service",
  });
};

const processEventWithRetry = async (
  sourceTopic: string,
  event: DomainEventPayload,
): Promise<void> => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      if (typeof event.eventId !== "string" || event.eventId.trim() === "") {
        throw new Error("Invalid or missing eventId");
      }

      const eventId = event.eventId.trim();

      if (await isDuplicateEvent(eventId)) {
        return;
      }

      handleEvent(event);
      await markEventProcessed(eventId);
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
  await consumer.subscribe({ topic: "logistics.order.events", fromBeginning: false });
  await consumer.subscribe({
    topic: "logistics.planning.events",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      if (!message.value) {
        return;
      }

      const parsed = parseMessage(message.value.toString());

      if (!parsed) {
        return;
      }

      await processEventWithRetry(topic, parsed);
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
