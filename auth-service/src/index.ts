import dotenv from "dotenv";
import express from "express";
import { connectDatabase } from "./config/db";
import { errorMiddleware } from "./middlewares/error.middleware";
import authRouter from "./modules/auth/routes/auth.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(express.json());
app.use(authRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use(errorMiddleware);

const startServer = async (): Promise<void> => {
  await connectDatabase();
  app.listen(PORT);
};

startServer().catch((error: unknown) => {
  console.error("Failed to start auth service", error);
  process.exit(1);
});
