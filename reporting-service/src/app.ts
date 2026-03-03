import express from "express";
import reportsRouter from "./routes/reporting.routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/reports", reportsRouter);

export default app;
