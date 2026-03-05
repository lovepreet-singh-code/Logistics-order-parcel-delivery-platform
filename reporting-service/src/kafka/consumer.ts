import { kafka } from "./kafka.config";
import { connectProducer, disconnectProducer, publishDlq } from "./producer";
import {
  DELIVERY_TOPIC,
  handleDeliveryEvent,
} from "../consumers/delivery.consumer";
import { ORDER_TOPIC, handleOrderEvent } from "../consumers/order.consumer";
import {
  PLANNING_TOPIC,
  handlePlanningEvent,
} from "../consumers/planning.consumer";
import type { DomainEvent } from "../services/projection.service";
import { logError } from "../utils/logger";

const consumer = kafka.consumer({ groupId: "reporting-service-group" });

let isConnected = false;

const subscribedTopics = [ORDER_TOPIC, PLANNING_TOPIC, DELIVERY_TOPIC] as const;

const parseMessage = (value: string): DomainEvent | null => {
  try {
    return JSON.parse(value) as DomainEvent;
  } catch {
    return null;
  }
};

const buildDlqTopic = (sourceTopic: string): string => {
  return sourceTopic.replace(".events", ".dlq");
};

const publishToDlq = async (
  sourceTopic: string,
  event: DomainEvent,
  error: unknown,
): Promise<void> => {
  const errorMessage =
    error instanceof Error ? error.message : "Unknown processing error";

  await publishDlq(buildDlqTopic(sourceTopic), {
    event,
    errorMessage,
    failedAt: new Date().toISOString(),
    consumer: "reporting-service",
    sourceTopic,
  });
};

const routeEvent = async (topic: string, event: DomainEvent): Promise<void> => {
  if (topic === ORDER_TOPIC) {
    await handleOrderEvent(event);
    return;
  }

  if (topic === PLANNING_TOPIC) {
    await handlePlanningEvent(event);
    return;
  }

  if (topic === DELIVERY_TOPIC) {
    await handleDeliveryEvent(event);
  }
};

const processWithRetry = async (
  sourceTopic: string,
  event: DomainEvent,
): Promise<void> => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await routeEvent(sourceTopic, event);
      return;
    } catch (error) {
      if (attempt === 3) {
        await publishToDlq(sourceTopic, event, error);
        logError("Reporting event processing failed", {
          sourceTopic,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
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
