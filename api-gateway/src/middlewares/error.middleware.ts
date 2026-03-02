import type { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode =
    typeof (err as { status?: unknown }).status === "number"
      ? (err as { status: number }).status
      : typeof (err as { statusCode?: unknown }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : 500;

  const message =
    err instanceof Error && err.message
      ? err.message
      : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
};
