import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

const requireString = (
  source: Record<string, unknown>,
  field: string,
  errorCode: string,
): string => {
  const value = source[field];

  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(`${field} is required`, 400, errorCode);
  }

  return value.trim();
};

export const validateAssignDelivery = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const body = req.body as Record<string, unknown>;
    req.body.orderId = requireString(body, "orderId", "ORDER_ID_REQUIRED");
    req.body.driverId = requireString(body, "driverId", "DRIVER_ID_REQUIRED");
    req.body.vehicleId = requireString(body, "vehicleId", "VEHICLE_ID_REQUIRED");
    next();
  } catch (error) {
    next(error);
  }
};

export const validateOrderOnly = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const body = req.body as Record<string, unknown>;
    req.body.orderId = requireString(body, "orderId", "ORDER_ID_REQUIRED");
    next();
  } catch (error) {
    next(error);
  }
};

export const validateFailDelivery = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const body = req.body as Record<string, unknown>;
    req.body.orderId = requireString(body, "orderId", "ORDER_ID_REQUIRED");
    req.body.reason = requireString(body, "reason", "FAILURE_REASON_REQUIRED");
    next();
  } catch (error) {
    next(error);
  }
};
