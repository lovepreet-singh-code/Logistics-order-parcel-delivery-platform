import { kafka } from "./kafka.config";
import { ProcessedEvent } from "../models/processedEvent.model";
import {
  applyAggregations,
  type OrderEvent,
} from "../services/reporting.service";

const consumer = kafka.consumer({ groupId: "reporting-group" });
const dlqProducer = kafka.producer();

let isConnected = false;

const subscribedTopics = [
  "logistics.order.events",
  "logistics.planning.events",
  "logistics.delivery.events",
] as const;

const parseMessage = (value: string): OrderEvent | null => {
  try {
    return JSON.parse(value) as OrderEvent;
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
  originalEvent: OrderEvent,
  error: unknown,
): Promise<void> => {
  const errorMessage =
    error instanceof Error ? error.message : "Unknown processing error";

  await dlqProducer.send({
    topic: buildDlqTopic(sourceTopic),
    messages: [
      {
        value: JSON.stringify({
          originalEvent,
          errorMessage,
          failedAt: new Date().toISOString(),
          consumer: "reporting-service",
        }),
      },
    ],
  });
};

const processWithRetry = async (
  sourceTopic: string,
  event: OrderEvent,
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

      await applyAggregations(event);
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

  await dlqProducer.connect();
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
  await dlqProducer.disconnect();
  isConnected = false;
};
