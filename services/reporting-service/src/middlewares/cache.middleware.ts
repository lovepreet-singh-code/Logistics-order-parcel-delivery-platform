import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { redisClient } from "../config/redis";
import { logError } from "../utils/logger";

export const metricsCache = (cacheKeyBuilder: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = cacheKeyBuilder(req);

    try {
      const cached = await redisClient.get(key);

      if (cached) {
        res.status(200).json(JSON.parse(cached));
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        void redisClient.set(key, JSON.stringify(body), "EX", env.cacheTtlSeconds);
        return originalJson(body);
      };

      next();
    } catch (error) {
      logError("Redis cache middleware error", req.correlationId, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      next();
    }
  };
};
