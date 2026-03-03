import { type Request, type Response } from "express";
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

  const timeline = await Tracking.find({ orderId: orderId.trim() })
    .sort({ occurredAt: 1 })
    .lean()
    .exec();

  res.status(200).json({
    success: true,
    message: "Tracking timeline fetched successfully",
    data: timeline,
  });
};
