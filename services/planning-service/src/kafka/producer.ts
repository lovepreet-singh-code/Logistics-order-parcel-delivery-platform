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
  event: object,
): Promise<void> => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(event) }],
  });
};
