import express from "express";
import vehicleRouter from "./routes/vehicle.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/vehicles", vehicleRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
