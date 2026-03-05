import { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Error as MongooseError } from "mongoose";

type ErrorResponse = {
  message: string;
  details?: unknown;
};

const isProd = process.env.NODE_ENV === "production";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof MongooseError.ValidationError) {
    const details = Object.values(err.errors).map((e) => e.message);
    const body: ErrorResponse = {
      message: "Validation failed",
      details,
    };

    res.status(400).json(body);
    return;
  }

  if ((err as { code?: number }).code === 11000) {
    const duplicateFields = Object.keys(
      (err as { keyPattern?: Record<string, unknown> }).keyPattern || {},
    );
    const body: ErrorResponse = {
      message: "Duplicate field value",
      details: duplicateFields,
    };

    res.status(409).json(body);
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json({ message: "Token expired" } as ErrorResponse);
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ message: "Invalid token" } as ErrorResponse);
    return;
  }

  const body: ErrorResponse = {
    message: isProd
      ? "Internal server error"
      : err.message || "Internal server error",
  };

  if (!isProd && err.stack) {
    body.details = err.stack;
  }

  res.status(500).json(body);
};
