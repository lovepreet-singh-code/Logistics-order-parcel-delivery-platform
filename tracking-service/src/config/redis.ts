import Redis from "ioredis";

const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = Number(process.env.REDIS_PORT) || 6379;

export const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
});
