import { kafka } from "./kafka.config";

type DomainEventPayload = {
  eventType?: string;
  correlationId?: string;
  data?: unknown;
};

const consumer = kafka.consumer({ groupId: "planning-group" });

let isConnected = false;

const parseMessage = (value: string): DomainEventPayload | null => {
  try {
    return JSON.parse(value) as DomainEventPayload;
  } catch {
    return null;
  }
};

export const connectConsumer = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  await consumer.connect();
  await consumer.subscribe({ topic: "logistics.order.events", fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      const parsed = parseMessage(message.value.toString());

      if (!parsed || parsed.eventType !== "OrderCreated") {
        return;
      }

      const orderId = parsed.correlationId;

      if (!orderId) {
        return;
      }

      console.info(
        `Planning received OrderCreated event for orderId: ${orderId}`,
      );
    },
  });

  isConnected = true;
};

export const disconnectConsumer = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  await consumer.disconnect();
  isConnected = false;
};
