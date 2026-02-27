import dotenv from "dotenv";
import express from "express";
import { connectDatabase } from "./config/db";
import { errorMiddleware } from "./middlewares/error.middleware";
import franchiseRouter from "./modules/franchise/routes/franchise.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3003;

app.use(express.json());
app.use(franchiseRouter);
app.use(errorMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Franchise service running on port ${PORT}`);
  });
};

startServer().catch((error: unknown) => {
  console.error("Failed to start franchise service", error);
  process.exit(1);
});
