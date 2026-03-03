import { kafka } from "./kafka.config";

const producer = kafka.producer();

let producerConnected = false;

export const connectProducer = async (): Promise<void> => {
  if (producerConnected) {
    return;
  }

  await producer.connect();
  producerConnected = true;
};

export const disconnectProducer = async (): Promise<void> => {
  if (!producerConnected) {
    return;
  }

  await producer.disconnect();
  producerConnected = false;
};

export const publishDlq = async (topic: string, payload: unknown): Promise<void> => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });
};
