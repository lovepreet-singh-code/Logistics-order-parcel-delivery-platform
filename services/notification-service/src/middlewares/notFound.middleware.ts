import { type NextFunction, type Request, type Response } from "express";
import { sendError } from "../utils/apiResponse";

export const notFoundMiddleware = (
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};
