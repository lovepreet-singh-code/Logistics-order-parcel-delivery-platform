import type { Request, Response } from "express";
import { getCached, setCached } from "../cache/reporting.cache";
import {
  getDailyMetrics,
  getDeliveryMetrics,
  getOrderMetrics,
} from "../services/metrics.service";
import { fail, ok } from "../utils/apiResponse";

const isValidDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const fetchOrderMetrics = async (_req: Request, res: Response): Promise<void> => {
  const key = "reporting:orders";
  const cached = await getCached<unknown>(key);

  if (cached) {
    res.status(200).json(cached);
    return;
  }

  const metrics = await getOrderMetrics();
  const payload = ok("Order metrics fetched", metrics);
  await setCached(key, payload);
  res.status(200).json(payload);
};

export const fetchDeliveryMetrics = async (_req: Request, res: Response): Promise<void> => {
  const key = "reporting:deliveries";
  const cached = await getCached<unknown>(key);

  if (cached) {
    res.status(200).json(cached);
    return;
  }

  const metrics = await getDeliveryMetrics();
  const payload = ok("Delivery metrics fetched", metrics);
  await setCached(key, payload);
  res.status(200).json(payload);
};

export const fetchDailyMetrics = async (req: Request, res: Response): Promise<void> => {
  const { date } = req.query;

  if (typeof date !== "string" || !isValidDate(date)) {
    res.status(400).json(fail("date query param must be YYYY-MM-DD"));
    return;
  }

  const key = `reporting:daily:${date}`;
  const cached = await getCached<unknown>(key);

  if (cached) {
    res.status(200).json(cached);
    return;
  }

  const metrics = await getDailyMetrics(date);
  const payload = ok("Daily metrics fetched", metrics);
  await setCached(key, payload);
  res.status(200).json(payload);
};
