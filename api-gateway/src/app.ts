import cors from "cors";
import express from "express";
import helmet from "helmet";
import gatewayRouter from "./routes/gateway.routes";
import { authMiddleware } from "./middlewares/auth.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { rateLimiterMiddleware } from "./middlewares/rateLimiter.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(rateLimiterMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    services: {
      auth: "unknown",
      user: "unknown",
      franchise: "unknown",
      vehicle: "unknown",
      order: "unknown",
      planning: "unknown",
      notification: "unknown",
    },
  });
});

app.use(authMiddleware);
app.use(gatewayRouter);

app.use(errorMiddleware);

export default app;
