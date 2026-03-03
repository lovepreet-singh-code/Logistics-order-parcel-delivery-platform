import type { NextFunction, Request, Response } from "express";
import { fail } from "../utils/apiResponse";
import { logError } from "../utils/logger";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const message = error instanceof Error ? error.message : "Internal server error";

  logError("Unhandled API error", { message });
  res.status(500).json(fail(message));
};
