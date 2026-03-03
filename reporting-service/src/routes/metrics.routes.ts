import { Router } from "express";
import {
  fetchDailyMetrics,
  fetchDeliveryMetrics,
  fetchOrderMetrics,
  fetchRevenueMetrics,
  fetchSystemMetrics,
} from "../controllers/metrics.controller";
import { metricsCache } from "../middlewares/cache.middleware";

const metricsRouter = Router();

metricsRouter.get("/orders", metricsCache(() => "metrics:orders"), fetchOrderMetrics);
metricsRouter.get("/deliveries", metricsCache(() => "metrics:deliveries"), fetchDeliveryMetrics);
metricsRouter.get("/revenue", metricsCache(() => "metrics:revenue"), fetchRevenueMetrics);
metricsRouter.get(
  "/daily",
  metricsCache((req) => `metrics:daily:${String(req.query.date ?? "")}`),
  fetchDailyMetrics,
);
metricsRouter.get("/system", metricsCache(() => "metrics:system"), fetchSystemMetrics);

export default metricsRouter;
