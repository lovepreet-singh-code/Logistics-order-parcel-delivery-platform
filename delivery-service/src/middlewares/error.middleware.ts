import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
    });
    return;
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";

  res.status(500).json({
    success: false,
    message,
    errorCode: "INTERNAL_SERVER_ERROR",
  });
};
