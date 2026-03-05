import pino from "pino";

const logger = pino();

const SERVICE_NAME = "tracking-service";

export const logInfo = (
  message: string,
  correlationId?: string,
  meta: Record<string, unknown> = {},
): void => {
  logger.info({
    level: "info",
    message,
    service: SERVICE_NAME,
    correlationId,
    timestamp: new Date().toISOString(),
    ...meta,
  });
};

export const logError = (
  message: string,
  correlationId?: string,
  meta: Record<string, unknown> = {},
): void => {
  logger.error({
    level: "error",
    message,
    service: SERVICE_NAME,
    correlationId,
    timestamp: new Date().toISOString(),
    ...meta,
  });
};
