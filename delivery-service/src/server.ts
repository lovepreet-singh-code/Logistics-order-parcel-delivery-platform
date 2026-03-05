import app from "./app";
import { connectDatabase } from "./config/db";
import { redisClient } from "./config/redis";
import { env } from "./config/env";
import { connectConsumer, disconnectConsumer } from "./kafka/consumer";
import { connectProducer, disconnectProducer } from "./kafka/producer";

const startServer = async (): Promise<void> => {
  await connectDatabase();
  await redisClient.ping();
  await connectProducer();
  await connectConsumer();

  app.listen(env.port, () => {
    console.info(`Delivery service running on port ${env.port}`);
  });
};

const shutdown = async (): Promise<void> => {
  await disconnectConsumer();
  await disconnectProducer();
  await redisClient.quit();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});

void startServer().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
