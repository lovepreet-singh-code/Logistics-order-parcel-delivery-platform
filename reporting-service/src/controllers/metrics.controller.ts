import type { Request, Response } from "express";
import {
  getDailyMetrics,
  getDeliveryMetrics,
  getOrderMetrics,
  getRevenueMetrics,
  getSystemMetrics,
} from "../services/metrics.service";
import { fail, ok } from "../utils/apiResponse";

const isValidDate = (value: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

export const fetchOrderMetrics = async (_req: Request, res: Response): Promise<void> => {
  const metrics = await getOrderMetrics();
  res.status(200).json(ok("Order metrics fetched", metrics));
};

export const fetchDeliveryMetrics = async (_req: Request, res: Response): Promise<void> => {
  const metrics = await getDeliveryMetrics();
  res.status(200).json(ok("Delivery metrics fetched", metrics));
};

export const fetchRevenueMetrics = async (_req: Request, res: Response): Promise<void> => {
  const metrics = await getRevenueMetrics();
  res.status(200).json(ok("Revenue metrics fetched", metrics));
};

export const fetchDailyMetrics = async (req: Request, res: Response): Promise<void> => {
  const { date } = req.query;

  if (typeof date !== "string" || !isValidDate(date)) {
    res.status(400).json(fail("date query param must be YYYY-MM-DD"));
    return;
  }

  const metrics = await getDailyMetrics(date);
  res.status(200).json(ok("Daily metrics fetched", metrics));
};

export const fetchSystemMetrics = async (_req: Request, res: Response): Promise<void> => {
  const metrics = await getSystemMetrics();
  res.status(200).json(ok("System metrics fetched", metrics));
};
