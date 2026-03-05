import type { NextFunction, Request, Response } from "express";
import { logInfo } from "../utils/logger";

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startedAt = Date.now();

  res.on("finish", () => {
    logInfo("HTTP request completed", req.correlationId, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
};
