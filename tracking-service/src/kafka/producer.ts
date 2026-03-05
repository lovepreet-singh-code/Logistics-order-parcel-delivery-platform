import { kafka } from "./kafka.config";
import { logInfo } from "../utils/logger";

type EventPayload = {
  eventType?: string;
  correlationId?: string;
};

const producer = kafka.producer();

let isConnected = false;

export const connectProducer = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  await producer.connect();
  logInfo("Kafka producer connected");
  isConnected = true;
};

export const disconnectProducer = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  await producer.disconnect();
  logInfo("Kafka producer disconnected");
  isConnected = false;
};

export const publishEvent = async (
  topic: string,
  event: object,
): Promise<void> => {
  const payload = event as EventPayload;

  const metadata = await producer.send({
    topic,
    messages: [{ value: JSON.stringify(event) }],
  });

  for (const entry of metadata) {
    logInfo("Kafka event produced", payload.correlationId, {
      topic: entry.topicName,
      partition: entry.partition,
      eventType: payload.eventType,
    });
  }
};
