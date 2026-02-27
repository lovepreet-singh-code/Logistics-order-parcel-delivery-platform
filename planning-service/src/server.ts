import app from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  await connectDatabase();
  console.log(`MongoDB connected`);
  app.listen(env.port, () => {
    console.log(`Planning service running on port ${env.port}`);
  });
};

void startServer().catch(() => {
  process.exit(1);
});
