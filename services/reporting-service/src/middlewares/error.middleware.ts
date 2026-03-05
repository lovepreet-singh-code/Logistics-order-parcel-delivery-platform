import type { NextFunction, Request, Response } from "express";
import { fail } from "../utils/apiResponse";
import { logError } from "../utils/logger";

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const message = error instanceof Error ? error.message : "Internal server error";

  logError("Unhandled API error", req.correlationId, {
    message,
    stack: error instanceof Error ? error.stack : undefined,
  });

  res.status(500).json(fail(message));
};
