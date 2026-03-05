import type { Request, Response } from "express";
import {
  assignDelivery,
  completeDelivery,
  failDelivery,
  returnDelivery,
  startDelivery,
} from "../services/delivery.service";

const getOrderId = (req: Request): string => {
  const orderId = req.body.orderId;

  if (typeof orderId !== "string" || orderId.trim() === "") {
    throw new Error("orderId is required");
  }

  return orderId.trim();
};

export const assignDeliveryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const orderId = getOrderId(req);
  await assignDelivery(orderId);
  res.status(200).json({ success: true, message: "Delivery assigned" });
};

export const startDeliveryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const orderId = getOrderId(req);
  await startDelivery(orderId);
  res.status(200).json({ success: true, message: "Delivery started" });
};

export const completeDeliveryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const orderId = getOrderId(req);
  await completeDelivery(orderId);
  res.status(200).json({ success: true, message: "Delivery completed" });
};

export const failDeliveryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const orderId = getOrderId(req);
  const reason = req.body.reason;

  if (typeof reason !== "string" || reason.trim() === "") {
    throw new Error("reason is required");
  }

  await failDelivery(orderId, reason);
  res.status(200).json({ success: true, message: "Delivery failed" });
};

export const returnDeliveryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const orderId = getOrderId(req);
  await returnDelivery(orderId);
  res.status(200).json({ success: true, message: "Delivery returned" });
};
