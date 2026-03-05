import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { logError } from "../utils/logger";

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    logError(error.message, req.correlationId, { stack: error.stack });

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    });
    return;
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";

  logError(message, req.correlationId, {
    stack: error instanceof Error ? error.stack : undefined,
  });

  res.status(500).json({
    success: false,
    message,
    errorCode: "INTERNAL_SERVER_ERROR",
  });
};
