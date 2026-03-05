import { type Request, type Response } from "express";
import { redisClient } from "../config/redis";
import { Tracking } from "../models/tracking.model";

export const getTrackingTimeline = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const orderId = req.params.orderId;

  if (!orderId || orderId.trim() === "") {
    res.status(400).json({
      success: false,
      message: "orderId is required",
    });
    return;
  }

  const normalizedOrderId = orderId.trim();
  const cacheKey = `tracking:${normalizedOrderId}`;
  const cached = await redisClient.get(cacheKey);

  if (cached) {
    res.status(200).json(JSON.parse(cached) as unknown);
    return;
  }

  const timeline = await Tracking.find({ orderId: normalizedOrderId })
    .sort({ occurredAt: 1 })
    .lean()
    .exec();

  const response = {
    success: true,
    message: "Tracking timeline fetched successfully",
    data: timeline,
  };

  await redisClient.set(cacheKey, JSON.stringify(response), "EX", 300);

  res.status(200).json(response);
};
