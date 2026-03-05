import express from "express";
import trackingRouter from "./routes/tracking.routes";
import { correlationIdMiddleware } from "./middlewares/correlationId.middleware";
import { requestLoggerMiddleware } from "./middlewares/requestLogger.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(correlationIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/tracking", trackingRouter);
app.use(errorMiddleware);

export default app;
