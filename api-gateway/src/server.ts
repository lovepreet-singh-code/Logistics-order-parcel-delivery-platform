import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.info(`Service API Gateway running on port ${env.port}`);
});
