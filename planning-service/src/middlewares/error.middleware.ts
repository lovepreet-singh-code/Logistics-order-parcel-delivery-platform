import { type NextFunction, type Request, type Response } from "express";
import mongoose from "mongoose";
import { sendError } from "../utils/apiResponse";

export class AppError extends Error {
  public readonly statusCode: number;

  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const getValidationErrors = (
  validationError: mongoose.Error.ValidationError,
): string[] => {
  return Object.values(validationError.errors).map((error) => error.message);
};

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.details);
    return;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: number }).code === 11000
  ) {
    sendError(res, 409, "planningNumber already exists");
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    sendError(res, 400, "Validation failed", getValidationErrors(err));
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    sendError(res, 400, "Invalid request data");
    return;
  }

  sendError(res, 500, "Internal server error");
};
