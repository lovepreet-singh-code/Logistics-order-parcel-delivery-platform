import Redis from "ioredis";
import { env } from "./env";

export const redisClient = new Redis({
  host: env.redisHost,
  port: env.redisPort,
});
