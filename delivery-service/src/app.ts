import express from "express";
import deliveryRouter from "./routes/delivery.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/deliveries", deliveryRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
