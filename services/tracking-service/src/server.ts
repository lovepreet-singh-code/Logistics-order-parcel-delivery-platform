import app from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { connectConsumer, disconnectConsumer } from "./kafka/consumer";
import { logError, logInfo } from "./utils/logger";

const startServer = async (): Promise<void> => {
  await connectDatabase();
  await connectConsumer();
  app.listen(env.port, () => {
    logInfo(`Tracking service running on port ${env.port}`);
  });
};

const shutdown = async (): Promise<void> => {
  await disconnectConsumer();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});

void startServer().catch((error: unknown) => {
  logError("Failed to start tracking service", undefined, {
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});
