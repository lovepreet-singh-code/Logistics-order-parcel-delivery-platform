import { randomUUID } from "node:crypto";

export const buildEventEnvelope = (
  eventType: string,
  producer: string,
  correlationId: string,
  data: Record<string, unknown>,
) => {
  return {
    eventId: randomUUID(),
    eventType,
    eventVersion: 1,
    occurredAt: new Date().toISOString(),
    producer,
    correlationId,
    data,
  };
};
