import { kafka } from "./kafka.config";
import { logInfo } from "../utils/logger";

type EventPayload = {
  eventType?: string;
  correlationId?: string;
};

const producer = kafka.producer();

let producerConnected = false;

export const connectProducer = async (): Promise<void> => {
  if (producerConnected) {
    return;
  }

  await producer.connect();
  logInfo("Kafka producer connected");
  producerConnected = true;
};

export const disconnectProducer = async (): Promise<void> => {
  if (!producerConnected) {
    return;
  }

  await producer.disconnect();
  logInfo("Kafka producer disconnected");
  producerConnected = false;
};

export const publishDlq = async (topic: string, payload: unknown): Promise<void> => {
  const eventPayload = payload as EventPayload;

  const metadata = await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });

  for (const entry of metadata) {
    logInfo("Kafka event produced", eventPayload.correlationId, {
      topic: entry.topicName,
      partition: entry.partition,
      eventType: eventPayload.eventType,
    });
  }
};
