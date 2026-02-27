import { ErrorRequestHandler } from "express";

type ErrorResponse = {
  message: string;
  error?: string;
};

const isProd = process.env.NODE_ENV === "production";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const response: ErrorResponse = {
    message: "Internal server error",
  };

  if (!isProd && err instanceof Error) {
    response.error = err.message;
  }

  res.status(500).json(response);
};
