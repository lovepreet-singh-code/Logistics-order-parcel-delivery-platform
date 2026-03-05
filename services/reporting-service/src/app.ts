import express from "express";
import metricsRouter from "./routes/metrics.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { correlationIdMiddleware } from "./middlewares/correlationId.middleware";
import { requestLoggerMiddleware } from "./middlewares/requestLogger.middleware";

const app = express();

app.use(correlationIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/metrics", metricsRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
