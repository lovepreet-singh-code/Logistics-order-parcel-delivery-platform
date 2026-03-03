import express from "express";
import trackingRouter from "./routes/tracking.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/tracking", trackingRouter);

export default app;
