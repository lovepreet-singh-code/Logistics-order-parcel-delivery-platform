import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const headerValue = req.headers["x-correlation-id"];
  const correlationId =
    typeof headerValue === "string" && headerValue.trim() !== ""
      ? headerValue.trim()
      : randomUUID();

  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);
  next();
};
