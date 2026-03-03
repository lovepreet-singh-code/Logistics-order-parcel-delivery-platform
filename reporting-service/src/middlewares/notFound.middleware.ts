import type { Request, Response } from "express";
import { fail } from "../utils/apiResponse";

export const notFoundMiddleware = (_req: Request, res: Response): void => {
  res.status(404).json(fail("Route not found"));
};
