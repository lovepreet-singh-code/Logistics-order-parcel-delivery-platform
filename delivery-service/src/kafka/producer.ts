import { kafka } from "./kafka.config";

const producer = kafka.producer();

let isConnected = false;

export const connectProducer = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  await producer.connect();
  isConnected = true;
};

export const disconnectProducer = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  await producer.disconnect();
  isConnected = false;
};

export const publishEvent = async (
  topic: string,
  payload: unknown,
  key?: string,
): Promise<void> => {
  await producer.send({
    topic,
    messages: [{ key, value: JSON.stringify(payload) }],
  });
};
