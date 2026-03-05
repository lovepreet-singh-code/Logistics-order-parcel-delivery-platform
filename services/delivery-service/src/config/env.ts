import dotenv from "dotenv";

dotenv.config();

const getPort = (): number => {
  const rawPort = process.env.PORT;

  if (!rawPort) {
    return 3010;
  }

  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error("Invalid PORT value");
  }

  return parsedPort;
};

const getMongoUri = (): string => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  return mongoUri;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: getPort(),
  mongoUri: getMongoUri(),
  kafkaBroker: process.env.KAFKA_BROKER || "kafka:9092",
  redisHost: process.env.REDIS_HOST || "redis",
  redisPort: Number(process.env.REDIS_PORT) || 6379,
};
