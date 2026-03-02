import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

type AuthenticatedJwtPayload = JwtPayload & {
  userId?: string;
  email?: string;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedJwtPayload;
  }
}

const PUBLIC_AUTH_PATHS = new Set<string>(["/auth/register", "/auth/login"]);

const extractBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice(7).trim();
  return token || null;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (PUBLIC_AUTH_PATHS.has(req.path)) {
    next();
    return;
  }

  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
      statusCode: 401,
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === "string" || decoded === null) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        statusCode: 401,
      });
      return;
    }

    req.user = decoded as AuthenticatedJwtPayload;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
      statusCode: 401,
    });
  }
};
