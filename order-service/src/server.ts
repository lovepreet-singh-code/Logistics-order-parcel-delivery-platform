import app from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { connectProducer, disconnectProducer } from "./kafka/producer";

const startServer = async (): Promise<void> => {
  await connectDatabase();
  await connectProducer();
  app.listen(env.port, () => {
    console.log(`Order service running on port ${env.port}`);
  });
};

const shutdown = async (): Promise<void> => {
  await disconnectProducer();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});

void startServer().catch(() => {
  process.exit(1);
});
