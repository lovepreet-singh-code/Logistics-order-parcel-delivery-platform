import { kafka } from "./kafka.config";

type DomainEventPayload = {
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

export const connectConsumer = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  await consumer.connect();
  await consumer.subscribe({ topic: "logistics.order.events", fromBeginning: false });
  await consumer.subscribe({
    topic: "logistics.planning.events",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      const parsed = parseMessage(message.value.toString());

      if (!parsed) {
        return;
      }

      handleEvent(parsed);
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
