import { ProcessedEvent } from "../models/processedEvent.model";
import type { EventEnvelope } from "../types/event";
import { logError, logInfo } from "../utils/logger";
import { kafka } from "./kafka.config";
import { connectProducer, disconnectProducer, publishDlq } from "./producer";
import { applyProjection } from "../services/projection.service";

const consumer = kafka.consumer({ groupId: "reporting-service-group" });

let isConnected = false;

const subscribedTopics = [
  "logistics.order.events",
  "logistics.planning.events",
  "logistics.delivery.events",
  "logistics.tracking.events",
  "logistics.payment.events",
] as const;

const wait = async (delayMs: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
};

const parseMessage = (value: string): EventEnvelope | null => {
  try {
    return JSON.parse(value) as EventEnvelope;
  } catch {
    return null;
  }
};

const validateEvent = (event: Partial<EventEnvelope>): EventEnvelope => {
  if (typeof event.eventId !== "string" || event.eventId.trim() === "") {
    throw new Error("Invalid or missing eventId");
  }

  if (typeof event.eventType !== "string" || event.eventType.trim() === "") {
    throw new Error("Invalid or missing eventType");
  }

  if (
    typeof event.eventVersion !== "number" ||
    !Number.isInteger(event.eventVersion) ||
    event.eventVersion <= 0
  ) {
    throw new Error("Invalid or missing eventVersion");
  }

  if (typeof event.occurredAt !== "string" || event.occurredAt.trim() === "") {
    throw new Error("Invalid or missing occurredAt");
  }

  if (typeof event.producer !== "string" || event.producer.trim() === "") {
    throw new Error("Invalid or missing producer");
  }

  if (typeof event.correlationId !== "string" || event.correlationId.trim() === "") {
    throw new Error("Invalid or missing correlationId");
  }

  const data = event.data && typeof event.data === "object" ? event.data : {};

  return {
    eventId: event.eventId.trim(),
    eventType: event.eventType.trim(),
    eventVersion: event.eventVersion,
    occurredAt: event.occurredAt,
    producer: event.producer.trim(),
    correlationId: event.correlationId.trim(),
    data: data as Record<string, unknown>,
  };
};

const isDuplicateEvent = async (eventId: string): Promise<boolean> => {
  const existing = await ProcessedEvent.findOne({ eventId }).lean().exec();
  return Boolean(existing);
};

const markEventProcessed = async (
  eventId: string,
  correlationId: string,
  topic: string,
): Promise<void> => {
  await ProcessedEvent.updateOne(
    { eventId },
    {
      $setOnInsert: {
        eventId,
        correlationId,
        topic,
        processedAt: new Date(),
      },
    },
    { upsert: true },
  ).exec();
};

const buildDlqTopic = (sourceTopic: string): string => {
  return sourceTopic.replace(".events", ".dlq");
};

const publishToDlq = async (
  sourceTopic: string,
  event: Partial<EventEnvelope>,
  error: unknown,
): Promise<void> => {
  const errorMessage = error instanceof Error ? error.message : "Unknown processing error";

  await publishDlq(buildDlqTopic(sourceTopic), {
    event,
    errorMessage,
    failedAt: new Date().toISOString(),
    consumer: "reporting-service",
    sourceTopic,
  });
};

const processWithRetry = async (sourceTopic: string, rawEvent: Partial<EventEnvelope>): Promise<void> => {
  const safeCorrelationId =
    typeof rawEvent.correlationId === "string" ? rawEvent.correlationId : "unknown";

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const event = validateEvent(rawEvent);

      logInfo("Processing event", {
        correlationId: event.correlationId,
        eventId: event.eventId,
        eventType: event.eventType,
        sourceTopic,
        attempt,
      });

      if (await isDuplicateEvent(event.eventId)) {
        logInfo("Skipping duplicate event", {
          correlationId: event.correlationId,
          eventId: event.eventId,
          sourceTopic,
        });
        return;
      }

      await applyProjection(event);
      await markEventProcessed(event.eventId, event.correlationId, sourceTopic);

      logInfo("Event projected", {
        correlationId: event.correlationId,
        eventId: event.eventId,
        sourceTopic,
      });

      return;
    } catch (error) {
      if (attempt === 3) {
        await publishToDlq(sourceTopic, rawEvent, error);

        logError("Event processing failed after retries", {
          correlationId: safeCorrelationId,
          sourceTopic,
          error: error instanceof Error ? error.message : "Unknown error",
        });

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
    eachMessage: async ({ topic, message, partition }) => {
      if (!message.value) {
        return;
      }

      const parsed = parseMessage(message.value.toString());

      if (!parsed) {
        logError("Unable to parse Kafka message", {
          sourceTopic: topic,
          partition,
        });
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
