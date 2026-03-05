import { kafka } from "./kafka.config";
import { registerPlanningConsumer } from "../consumers/planning.consumer";

const consumer = kafka.consumer({ groupId: "delivery-service-group" });

let isConnected = false;

export const connectConsumer = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  await consumer.connect();
  await registerPlanningConsumer(consumer);
  isConnected = true;
};

export const disconnectConsumer = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  await consumer.disconnect();
  isConnected = false;
};
