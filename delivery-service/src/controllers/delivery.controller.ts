import type { Request, Response } from "express";
import {
  assignDelivery,
  completeDelivery,
  failDelivery,
  returnDelivery,
  startDelivery,
} from "../services/delivery.service";

export const assignDeliveryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { orderId, driverId, vehicleId } = req.body as {
    orderId: string;
    driverId: string;
    vehicleId: string;
  };

  await assignDelivery(orderId, driverId, vehicleId);
  res.status(200).json({ success: true, message: "Delivery assigned" });
};

export const startDeliveryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { orderId } = req.body as { orderId: string };
  await startDelivery(orderId);
  res.status(200).json({ success: true, message: "Delivery started" });
};

export const completeDeliveryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { orderId } = req.body as { orderId: string };
  await completeDelivery(orderId);
  res.status(200).json({ success: true, message: "Delivery completed" });
};

export const failDeliveryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { orderId, reason } = req.body as { orderId: string; reason: string };
  await failDelivery(orderId, reason);
  res.status(200).json({ success: true, message: "Delivery failed" });
};

export const returnDeliveryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { orderId } = req.body as { orderId: string };
  await returnDelivery(orderId);
  res.status(200).json({ success: true, message: "Delivery returned" });
};
