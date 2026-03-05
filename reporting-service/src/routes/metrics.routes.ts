import { Router } from "express";
import {
  fetchDailyMetrics,
  fetchDeliveryMetrics,
  fetchOrderMetrics,
} from "../controllers/metrics.controller";

const metricsRouter = Router();

metricsRouter.get("/orders", (req, res, next) => {
  fetchOrderMetrics(req, res).catch(next);
});

metricsRouter.get("/deliveries", (req, res, next) => {
  fetchDeliveryMetrics(req, res).catch(next);
});

metricsRouter.get("/daily", (req, res, next) => {
  fetchDailyMetrics(req, res).catch(next);
});

export default metricsRouter;
