import dotenv from "dotenv";

dotenv.config();

type EnvConfig = {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  authServiceUrl: string;
  userServiceUrl: string;
  franchiseServiceUrl: string;
  vehicleServiceUrl: string;
  orderServiceUrl: string;
  planningServiceUrl: string;
  notificationServiceUrl: string;
};

const requiredVar = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
};

export const env: EnvConfig = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: requiredVar("JWT_SECRET"),
  authServiceUrl: requiredVar("AUTH_SERVICE_URL"),
  userServiceUrl: requiredVar("USER_SERVICE_URL"),
  franchiseServiceUrl: requiredVar("FRANCHISE_SERVICE_URL"),
  vehicleServiceUrl: requiredVar("VEHICLE_SERVICE_URL"),
  orderServiceUrl: requiredVar("ORDER_SERVICE_URL"),
  planningServiceUrl: requiredVar("PLANNING_SERVICE_URL"),
  notificationServiceUrl: requiredVar("NOTIFICATION_SERVICE_URL"),
};
