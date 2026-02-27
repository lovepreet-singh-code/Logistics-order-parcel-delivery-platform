import dotenv from "dotenv";

dotenv.config();

const getPort = (): number => {
  const rawPort = process.env.PORT;

  if (!rawPort) {
    return 3004;
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
};
