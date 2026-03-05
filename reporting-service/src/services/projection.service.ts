import { ProcessedEvent } from "../models/processedEvent.model";
import { DailyAggregates } from "../models/dailyAggregates.model";
import { DeliveryMetrics } from "../models/deliveryMetrics.model";
import { OrderMetrics } from "../models/orderMetrics.model";

export type DomainEvent = {
  eventId?: string;
  eventType?: string;
  occurredAt?: string;
  correlationId?: string;
  data?: Record<string, unknown>;
};

const GLOBAL_KEY = "global";

const parseDateKey = (occurredAt: string): string => {
  const parsed = new Date(occurredAt);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid occurredAt");
  }

  return parsed.toISOString().slice(0, 10);
};

const getEventId = (event: DomainEvent): string => {
  if (typeof event.eventId !== "string" || event.eventId.trim() === "") {
    throw new Error("Invalid or missing eventId");
  }

  return event.eventId.trim();
};

const getOccurredAt = (event: DomainEvent): string => {
  if (typeof event.occurredAt !== "string" || event.occurredAt.trim() === "") {
    throw new Error("Invalid or missing occurredAt");
  }

  return event.occurredAt;
};

const isDuplicate = async (eventId: string): Promise<boolean> => {
  const existing = await ProcessedEvent.findOne({ eventId }).lean().exec();
  return Boolean(existing);
};

const markProcessed = async (eventId: string): Promise<void> => {
  await ProcessedEvent.updateOne(
    { eventId },
    { $setOnInsert: { eventId, processedAt: new Date() } },
    { upsert: true },
  ).exec();
};

export const applyOrderCreatedProjection = async (
  event: DomainEvent,
): Promise<void> => {
  const eventId = getEventId(event);

  if (await isDuplicate(eventId)) {
    return;
  }

  const date = parseDateKey(getOccurredAt(event));

  await Promise.all([
    OrderMetrics.updateOne(
      { key: GLOBAL_KEY },
      {
        $setOnInsert: { key: GLOBAL_KEY, totalOrders: 0, plannedOrders: 0 },
        $inc: { totalOrders: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    ).exec(),
    DailyAggregates.updateOne(
      { date },
      {
        $setOnInsert: { date, orders: 0, deliveries: 0, failedDeliveries: 0 },
        $inc: { orders: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    ).exec(),
  ]);

  await markProcessed(eventId);
};

export const applyPlanConfirmedProjection = async (
  event: DomainEvent,
): Promise<void> => {
  const eventId = getEventId(event);

  if (await isDuplicate(eventId)) {
    return;
  }

  await OrderMetrics.updateOne(
    { key: GLOBAL_KEY },
    {
      $setOnInsert: { key: GLOBAL_KEY, totalOrders: 0, plannedOrders: 0 },
      $inc: { plannedOrders: 1 },
      $set: { updatedAt: new Date() },
    },
    { upsert: true },
  ).exec();

  await markProcessed(eventId);
};

export const applyDeliveryCompletedProjection = async (
  event: DomainEvent,
): Promise<void> => {
  const eventId = getEventId(event);

  if (await isDuplicate(eventId)) {
    return;
  }

  const date = parseDateKey(getOccurredAt(event));

  await Promise.all([
    DeliveryMetrics.updateOne(
      { key: GLOBAL_KEY },
      {
        $setOnInsert: { key: GLOBAL_KEY, successfulDeliveries: 0, failedDeliveries: 0 },
        $inc: { successfulDeliveries: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    ).exec(),
    DailyAggregates.updateOne(
      { date },
      {
        $setOnInsert: { date, orders: 0, deliveries: 0, failedDeliveries: 0 },
        $inc: { deliveries: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    ).exec(),
  ]);

  await markProcessed(eventId);
};

export const applyDeliveryFailedProjection = async (
  event: DomainEvent,
): Promise<void> => {
  const eventId = getEventId(event);

  if (await isDuplicate(eventId)) {
    return;
  }

  const date = parseDateKey(getOccurredAt(event));

  await Promise.all([
    DeliveryMetrics.updateOne(
      { key: GLOBAL_KEY },
      {
        $setOnInsert: { key: GLOBAL_KEY, successfulDeliveries: 0, failedDeliveries: 0 },
        $inc: { failedDeliveries: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    ).exec(),
    DailyAggregates.updateOne(
      { date },
      {
        $setOnInsert: { date, orders: 0, deliveries: 0, failedDeliveries: 0 },
        $inc: { failedDeliveries: 1 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true },
    ).exec(),
  ]);

  await markProcessed(eventId);
};
