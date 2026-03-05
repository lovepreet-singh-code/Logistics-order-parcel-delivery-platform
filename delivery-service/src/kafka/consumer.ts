import { kafka } from "./kafka.config";
import { registerPlanningConsumer } from "../consumers/planning.consumer";
import { logInfo } from "../utils/logger";

const consumer = kafka.consumer({ groupId: "delivery-service-group" });

let isConnected = false;

export const connectConsumer = async (): Promise<void> => {
  if (isConnected) {
    return;
  }

  await consumer.connect();
  logInfo("Kafka consumer connected");

  await registerPlanningConsumer(consumer);
  isConnected = true;
};

export const disconnectConsumer = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  await consumer.disconnect();
  logInfo("Kafka consumer disconnected");
  isConnected = false;
};
