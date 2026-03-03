import { randomUUID } from "crypto";

export interface DomainEvent<T> {
  eventId: string;
  eventType: string;
  eventVersion: number;
  occurredAt: string;
  producer: string;
  correlationId: string;
  data: T;
}

type CreateEventEnvelopeParams<T> = {
  eventType: string;
  data: T;
  correlationId: string;
  eventVersion?: number;
};

export const createEventEnvelope = <T>({
  eventType,
  data,
  correlationId,
  eventVersion = 1,
}: CreateEventEnvelopeParams<T>): DomainEvent<T> => {
  return {
    eventId: randomUUID(),
    eventType,
    eventVersion,
    occurredAt: new Date().toISOString(),
    producer: "order-service",
    correlationId,
    data,
  };
};
