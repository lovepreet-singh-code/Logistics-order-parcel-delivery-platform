export const logInfo = (
  message: string,
  meta: Record<string, unknown> = {},
): void => {
  console.info(
    JSON.stringify({
      level: "info",
      service: "reporting-service",
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
};

export const logError = (
  message: string,
  meta: Record<string, unknown> = {},
): void => {
  console.error(
    JSON.stringify({
      level: "error",
      service: "reporting-service",
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    }),
  );
};
