import { redisClient } from "../config/redis";
import { env } from "../config/env";

export const getCached = async <T>(key: string): Promise<T | null> => {
  const value = await redisClient.get(key);

  if (!value) {
    return null;
  }

  return JSON.parse(value) as T;
};

export const setCached = async (key: string, value: unknown): Promise<void> => {
  await redisClient.set(key, JSON.stringify(value), "EX", env.cacheTtlSeconds);
};
